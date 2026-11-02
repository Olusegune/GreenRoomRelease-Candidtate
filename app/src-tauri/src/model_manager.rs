//! Safe local-model storage and machine profiling. Model manifests remain application-owned:
//! the UI can request an id, but it can never supply an arbitrary download URL or checksum.

use serde::Serialize;
use sha2::{Digest, Sha256};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use sysinfo::System;
use tauri::{Emitter, Manager};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HardwareInfo {
    pub platform: String,
    pub architecture: String,
    pub memory_gb: u64,
    pub cpu: String,
    pub accelerator: String,
    pub vram_gb: u64,
    pub tier: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelState {
    pub id: String,
    pub state: String,
    pub progress: u8,
    pub version: Option<String>,
    pub path: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgress {
    pub id: String,
    pub downloaded: u64,
    pub total: u64,
    pub percent: u8,
}

#[derive(Debug, Clone)]
pub struct Artifact {
    pub url: &'static str,
    pub bytes: u64,
    pub sha256: &'static str,
    pub filename: &'static str,
}

#[derive(Debug, Clone)]
pub struct Manifest {
    pub id: &'static str,
    pub version: &'static str,
    pub artifacts: &'static [Artifact],
}

pub fn hardware() -> HardwareInfo {
    let mut system = System::new_all();
    system.refresh_all();
    let memory_gb = (system.total_memory() as f64 / 1_073_741_824.0).round() as u64;
    let cpu = system
        .cpus()
        .first()
        .map(|c| c.brand().trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "Unknown CPU".into());
    let platform = if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else if cfg!(target_os = "linux") {
        "linux"
    } else {
        "unknown"
    };
    let accelerator = if cfg!(all(target_os = "macos", target_arch = "aarch64")) {
        "Apple Metal"
    } else {
        "GPU auto-detection pending"
    };
    let tier = if memory_gb >= 24 {
        "studio"
    } else if memory_gb >= 12 {
        "standard"
    } else {
        "compact"
    };
    HardwareInfo {
        platform: platform.into(),
        architecture: std::env::consts::ARCH.into(),
        memory_gb,
        cpu,
        accelerator: accelerator.into(),
        vram_gb: 0,
        tier: tier.into(),
    }
}

pub fn models_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_local_data_dir()
        .map_err(|_| "Could not find the local application-data folder.".to_string())?
        .join("models"))
}

pub fn states(app: &tauri::AppHandle, ids: &[String]) -> Result<Vec<ModelState>, String> {
    let root = models_root(app)?;
    Ok(ids.iter().map(|id| state(&root, id)).collect())
}

fn state(root: &Path, id: &str) -> ModelState {
    if !valid_id(id) {
        return ModelState {
            id: id.into(),
            state: "error".into(),
            progress: 0,
            version: None,
            path: None,
            error: Some("Invalid model id".into()),
        };
    }
    let dir = root.join(id);
    let active = fs::read_to_string(dir.join("active"))
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| valid_version(s));
    if let Some(version) = active {
        let version_dir = dir.join(&version);
        if version_dir.join("installed.json").is_file() {
            return ModelState {
                id: id.into(),
                state: "installed".into(),
                progress: 100,
                version: Some(version),
                path: Some(version_dir.to_string_lossy().into()),
                error: None,
            };
        }
    }
    let partial = fs::read_dir(&dir).into_iter().flatten().flatten().any(|entry| {
        entry.file_name().to_string_lossy().ends_with(".staging")
            && fs::read_dir(entry.path()).into_iter().flatten().flatten()
                .any(|file| file.file_name().to_string_lossy().ends_with(".part"))
    });
    ModelState {
        id: id.into(),
        state: if partial {
            "queued"
        } else {
            "available"
        }
        .into(),
        progress: 0,
        version: None,
        path: None,
        error: None,
    }
}

pub fn install(app: &tauri::AppHandle, manifest: &Manifest) -> Result<ModelState, String> {
    install_artifacts(app, manifest.id, manifest.version, manifest.artifacts, None)
}

fn install_artifacts(app: &tauri::AppHandle, id: &'static str, version: &'static str, artifacts: &[Artifact], token: Option<&str>) -> Result<ModelState, String> {
    let manifest = Manifest { id, version, artifacts: &[] };
    let manifest = &manifest;
    if !valid_id(manifest.id) || !valid_version(manifest.version) {
        return Err("The model manifest is invalid.".into());
    }
    let root = models_root(app)?;
    let model_dir = root.join(manifest.id);
    // Recover a completed installation whose active-pointer write was interrupted,
    // and make retries idempotent without downloading gigabytes again.
    let target = model_dir.join(manifest.version);
    if target.join("installed.json").is_file() && artifacts.iter().all(|artifact| {
        let path = target.join(artifact.filename);
        fs::metadata(&path).map(|m| m.len()).ok() == Some(artifact.bytes)
            && verify_sha256(&path, artifact.sha256).is_ok()
    }) {
        crate::store::atomic_write(&model_dir.join("active"), manifest.version.as_bytes())?;
        return Ok(state(&root, manifest.id));
    }
    let stage = model_dir.join(format!("{}.staging", manifest.version));
    fs::create_dir_all(&stage).map_err(|_| "Could not create the model staging folder.")?;
    for artifact in artifacts {
        let complete = stage.join(artifact.filename);
        if complete.is_file() && fs::metadata(&complete).map(|m| m.len()).ok() == Some(artifact.bytes) && verify_sha256(&complete, artifact.sha256).is_ok() {
            continue;
        }
        download_artifact(app, manifest.id, artifact, &stage, token)?;
    }
    let installed = serde_json::json!({"id": manifest.id, "version": manifest.version, "artifacts": artifacts.len()});
    crate::store::atomic_write(
        &stage.join("installed.json"),
        installed.to_string().as_bytes(),
    )?;
    let target = model_dir.join(manifest.version);
    if target.exists() { return Err("This model version already exists. Its files were not replaced.".into()); }
    fs::rename(&stage, &target).map_err(|_| "Could not activate the downloaded model files.")?;
    crate::store::atomic_write(&model_dir.join("active"), manifest.version.as_bytes())?;
    Ok(state(&root, manifest.id))
}


/// A file in a gated Hugging Face repository. Sizes and the git object id are public and pinned here; the
/// SHA-256 of a large file is only shown to an authenticated account, so it is read at install time from
/// the same pinned revision and every byte is still checked against it.
pub struct GatedFile { pub path: &'static str, pub filename: &'static str, pub bytes: u64, pub git_oid: Option<&'static str> }
pub struct GatedManifest { pub id: &'static str, pub version: &'static str, pub repo: &'static str, pub revision: &'static str, pub files: &'static [GatedFile] }

pub fn install_gated(app: &tauri::AppHandle, m: &GatedManifest, token: &str) -> Result<ModelState, String> {
    let get = |url: &str| crate::net::agent().get(url).set("Authorization", &format!("Bearer {token}")).call().map_err(|e| match e {
        ureq::Error::Status(401 | 403, _) => "Hugging Face refused the request. Open the model page, accept its terms with the same account, and check the saved token has read access.".to_string(),
        ureq::Error::Status(404, _) => "Hugging Face could not find the pinned model version.".to_string(),
        _ => "Could not reach Hugging Face. Check your connection and try again.".to_string(),
    });
    let artifacts = resolve_gated(m, |url| get(url).and_then(|r| crate::net::read_json(r, 4 << 20)), |url| get(url).and_then(|r| crate::net::read_all(r, 4 << 20)))?;
    install_artifacts(app, m.id, m.version, &artifacts, Some(token))
}

fn git_blob_sha1(bytes: &[u8]) -> String {
    use sha1::{Digest as _, Sha1};
    let mut h = Sha1::new();
    h.update(format!("blob {} ", bytes.len()).as_bytes());
    h.update(bytes);
    format!("{:x}", h.finalize())
}

fn resolve_gated(
    m: &GatedManifest,
    json: impl Fn(&str) -> Result<serde_json::Value, String>,
    bytes: impl Fn(&str) -> Result<Vec<u8>, String>,
) -> Result<Vec<Artifact>, String> {
    if m.revision.len() != 40 || !m.revision.bytes().all(|b| b.is_ascii_hexdigit()) || !m.repo.bytes().all(|b| b.is_ascii_alphanumeric() || matches!(b, b'/' | b'-' | b'_' | b'.')) {
        return Err("The model manifest is invalid.".into());
    }
    let listing = json(&format!("https://huggingface.co/api/models/{}/tree/{}?recursive=true", m.repo, m.revision))?;
    let rows = listing.as_array().ok_or("Hugging Face sent an unexpected file list.")?;
    let leak = |s: String| -> &'static str { Box::leak(s.into_boxed_str()) };
    let mut out = Vec::new();
    for f in m.files {
        let row = rows.iter().find(|r| r["path"].as_str() == Some(f.path)).ok_or_else(|| format!("{} is not in the pinned model version.", f.filename))?;
        if row["size"].as_u64() != Some(f.bytes) { return Err(format!("{} does not match the size Greenroom checked, so it was not downloaded.", f.filename)); }
        let url = format!("https://huggingface.co/{}/resolve/{}/{}", m.repo, m.revision, f.path);
        let sha = match (row["lfs"]["oid"].as_str(), f.git_oid) {
            (Some(oid), _) if oid.len() == 64 && oid.bytes().all(|b| b.is_ascii_hexdigit()) => oid.to_string(),
            (Some(_), _) => return Err("Hugging Face did not reveal this file's checksum. Accept the model terms with the account whose token is saved, then try again.".into()),
            // Small files stored directly in git: check them against the pinned git object id.
            (None, Some(git)) => {
                let data = bytes(&url)?;
                if data.len() as u64 != f.bytes || git_blob_sha1(&data) != git { return Err(format!("{} did not match the version Greenroom checked.", f.filename)); }
                crate::local::sha256_hex(&data)
            }
            (None, None) => return Err(format!("{} has no checksum Greenroom can verify.", f.filename)),
        };
        out.push(Artifact { url: leak(url), bytes: f.bytes, sha256: leak(sha), filename: f.filename });
    }
    Ok(out)
}

pub fn import_files(app: &tauri::AppHandle, manifest: &Manifest, source: &Path) -> Result<ModelState, String> {
    if !valid_id(manifest.id) || !valid_version(manifest.version) { return Err("The model manifest is invalid.".into()); }
    for artifact in manifest.artifacts {
        let path = source.join(artifact.filename);
        if fs::metadata(&path).map(|m| m.len()).ok() != Some(artifact.bytes) || verify_sha256(&path, artifact.sha256).is_err() {
            return Err(format!("The downloaded {} is missing or does not match the verified model version.", artifact.filename));
        }
    }
    let root = models_root(app)?;
    let dir = root.join(manifest.id);
    let target = dir.join(manifest.version);
    if target.exists() { return Err("This model version already exists. Its files were not replaced.".into()); }
    let stage = dir.join(format!("{}.staging", manifest.version));
    fs::create_dir_all(&stage).map_err(|_| "Could not create the model staging folder.")?;
    for artifact in manifest.artifacts {
        let destination = stage.join(artifact.filename);
        if destination.exists() && fs::metadata(&destination).map(|m| m.len()).ok() == Some(artifact.bytes) && verify_sha256(&destination, artifact.sha256).is_ok() { continue; }
        let temp = stage.join(format!("{}.importing", artifact.filename));
        fs::copy(source.join(artifact.filename), &temp).map_err(|_| "Could not copy the model files. Check available disk space.")?;
        verify_sha256(&temp, artifact.sha256)?;
        fs::rename(&temp, &destination).map_err(|_| "Could not finish copying the model file.")?;
    }
    let installed = serde_json::json!({"id": manifest.id, "version": manifest.version, "artifacts": manifest.artifacts.len()});
    crate::store::atomic_write(&stage.join("installed.json"), installed.to_string().as_bytes())?;
    fs::rename(&stage, &target).map_err(|_| "Could not activate the downloaded model files.")?;
    crate::store::atomic_write(&dir.join("active"), manifest.version.as_bytes())?;
    Ok(state(&root, manifest.id))
}

/// Wazobia's public release currently provides a model weight, but no pinned, Greenroom-tested
/// inference bundle. Keep the selected weight in the same managed location as other models without
/// ever executing it. This is deliberately separate from `import_files`, which is checksum-pinned.
pub fn import_wazobia_weight(app: &tauri::AppHandle, source: &Path) -> Result<ModelState, String> {
    const ID: &str = "wazobia-voice";
    const VERSION: &str = "v2";
    const FILE: &str = "t3_mtl23ls_v2.safetensors";
    let name = source.file_name().and_then(|x| x.to_str()).unwrap_or("");
    let bytes = fs::metadata(source).map_err(|_| "Greenroom could not read the selected Wazobia file.")?.len();
    if name != FILE || !(50 * 1024 * 1024..=15 * 1024 * 1024 * 1024).contains(&bytes) {
        return Err("Choose the Wazobia file named t3_mtl23ls_v2.safetensors. The selected file was not copied.".into());
    }
    let root = models_root(app)?;
    let model_dir = root.join(ID);
    let target = model_dir.join(VERSION);
    if target.join("installed.json").is_file() { return Ok(state(&root, ID)); }
    let stage = model_dir.join(format!("{VERSION}.staging"));
    fs::create_dir_all(&stage).map_err(|_| "Could not create the Wazobia model folder.")?;
    let temp = stage.join(format!("{FILE}.importing"));
    fs::copy(source, &temp).map_err(|_| "Could not copy the Wazobia model file. Check available disk space.")?;
    fs::rename(&temp, stage.join(FILE)).map_err(|_| "Could not finish adding the Wazobia model file.")?;
    let installed = serde_json::json!({"id": ID, "version": VERSION, "artifacts": 1, "source": "user-selected", "verified": false});
    crate::store::atomic_write(&stage.join("installed.json"), installed.to_string().as_bytes())?;
    fs::rename(&stage, &target).map_err(|_| "Could not activate the Wazobia model file.")?;
    crate::store::atomic_write(&model_dir.join("active"), VERSION.as_bytes())?;
    Ok(state(&root, ID))
}

fn download_artifact(
    app: &tauri::AppHandle,
    id: &str,
    artifact: &Artifact,
    stage: &Path,
    token: Option<&str>,
) -> Result<(), String> {
    if !crate::net::safe_https(artifact.url)
        || artifact.bytes == 0
        || artifact.bytes > 32 * 1024 * 1024 * 1024
        || artifact.sha256.len() != 64
        || !artifact.sha256.bytes().all(|b| b.is_ascii_hexdigit())
        || !valid_filename(artifact.filename)
    {
        return Err("The model artifact manifest is invalid.".into());
    }
    let part = stage.join(format!("{}.part", artifact.filename));
    let mut have = fs::metadata(&part).map(|m| m.len()).unwrap_or(0);
    if have > artifact.bytes {
        fs::remove_file(&part).map_err(|_| "Could not restart the model download.")?;
        have = 0;
    }
    if have == artifact.bytes {
        if verify_sha256(&part, artifact.sha256).is_ok() {
            return fs::rename(&part, stage.join(artifact.filename)).map_err(|_| "Could not finish the verified model artifact.".to_string());
        }
        fs::remove_file(&part).map_err(|_| "Could not restart the damaged model download.")?;
        have = 0;
    }
    download_to_file(artifact, stage, have, |offset| {
    let mut request = crate::net::agent().get(artifact.url).set("Accept-Encoding", "identity");
    // ureq drops Authorization when a redirect leaves huggingface.co, so the token never reaches the CDN.
    if let Some(token) = token { request = request.set("Authorization", &format!("Bearer {token}")); }
    if offset > 0 {
        request = request.set("Range", &format!("bytes={offset}-"));
    }
    request.call().map_err(|error| match error {
        ureq::Error::Status(401 | 403, _) if token.is_some() => format!("Hugging Face refused {}. Open the model page, accept its terms with the same account, then make sure the saved token has read access.", artifact.filename),
        ureq::Error::Status(status, _) => format!("The model server returned HTTP {status} for {}. Retry the download; existing partial files are kept.", artifact.filename),
        ureq::Error::Transport(_) => format!("Could not connect to the model server for {}. Check your connection and retry; existing partial files are kept.", artifact.filename),
    })
    }, |have| {
        let _ = app.emit("model-download-progress", DownloadProgress {
            id: id.into(), downloaded: have, total: artifact.bytes,
            percent: ((have.saturating_mul(100) / artifact.bytes).min(100)) as u8,
        });
    })
}

/// Transport is injected so tests exercise real streaming and filesystem behavior.
fn download_to_file(
    artifact: &Artifact, stage: &Path, mut have: u64,
    request: impl Fn(u64) -> Result<ureq::Response, String>,
    progress: impl Fn(u64),
) -> Result<(), String> {
    let part = stage.join(format!("{}.part", artifact.filename));
    let response = request(have)?;
    if response.status() == 200 {
        // The server ignored Range. Reuse this complete response, truncating the
        // old prefix instead of issuing a second request or appending duplicate data.
        have = 0;
    } else if response.status() == 206 {
        validate_range(response.header("Content-Range"), have, artifact.bytes)?;
    } else {
        return Err(format!("Unexpected model download response: HTTP {}.", response.status()));
    }
    let mut output = OpenOptions::new()
        .create(true)
        .write(true)
        .append(have > 0)
        .truncate(have == 0)
        .open(&part)
        .map_err(|_| "Could not open the model download file.")?;
    let mut reader = response.into_reader();
    let mut buffer = [0u8; 128 * 1024];
    loop {
        let count = reader
            .read(&mut buffer)
            .map_err(|_| "The model download was interrupted.")?;
        if count == 0 {
            break;
        }
        have = have.saturating_add(count as u64);
        if have > artifact.bytes {
            return Err("The model download was larger than its signed manifest.".into());
        }
        output
            .write_all(&buffer[..count])
            .map_err(|_| "Could not save the model download.")?;
        progress(have);
    }
    output
        .sync_all()
        .map_err(|_| "Could not finish saving the model download.")?;
    // Close the handle before rename/removal (required on Windows).
    drop(output);
    if have != artifact.bytes {
        return Err("The model download ended before it was complete.".into());
    }
    if let Err(e) = verify_sha256(&part, artifact.sha256) {
        let _ = fs::remove_file(&part);
        return Err(e);
    }
    fs::rename(&part, stage.join(artifact.filename))
        .map_err(|_| "Could not finish the verified model artifact.".to_string())
}

fn validate_range(header: Option<&str>, offset: u64, total: u64) -> Result<(), String> {
    let expected = format!("bytes {offset}-{}/{total}", total.saturating_sub(1));
    if header != Some(expected.as_str()) {
        return Err("The model server returned an invalid resume range. The partial download was kept; retry later.".into());
    }
    Ok(())
}

fn verify_sha256(path: &Path, wanted: &str) -> Result<(), String> {
    let mut file = File::open(path).map_err(|_| "Could not verify the model download.")?;
    let mut hash = Sha256::new();
    let mut buffer = [0u8; 128 * 1024];
    loop {
        let count = file
            .read(&mut buffer)
            .map_err(|_| "Could not verify the model download.")?;
        if count == 0 {
            break;
        }
        hash.update(&buffer[..count]);
    }
    let got = format!("{:x}", hash.finalize());
    if !got.eq_ignore_ascii_case(wanted) {
        return Err(
            "The model download did not match its signed checksum and was not installed.".into(),
        );
    }
    Ok(())
}

fn valid_id(s: &str) -> bool {
    !s.is_empty()
        && s.len() <= 80
        && s.bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
}
fn valid_version(s: &str) -> bool {
    !s.is_empty()
        && s != "." && s != ".."
        && s.len() <= 48
        && s.bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'.' | b'-' | b'_'))
}
fn valid_filename(s: &str) -> bool {
    !s.is_empty()
        && s.len() <= 120
        && !s.starts_with('.')
        && s.bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'.' | b'-' | b'_'))
}

#[cfg(test)]
mod tests {
    use super::*;
    fn temp(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("greenroom-download-{name}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }
    fn fixture() -> Artifact {
        Artifact { url: "https://example.com/model", bytes: 6,
            sha256: "bef57ec7f53a6d40beb640a780a639c83bc29ac8a9816f1fc6c5c6dcd93c4721", filename: "model.bin" }
    }
    fn response(status: u16, body: &[u8]) -> ureq::Response {
        ureq::Response::new(status, "Test", &String::from_utf8_lossy(body)).unwrap()
    }
    #[test]
    fn fresh_download_verifies_and_renames() {
        let dir = temp("fresh");
        download_to_file(&fixture(), &dir, 0, |_| Ok(response(200, b"abcdef")), |_| {}).unwrap();
        assert_eq!(fs::read(dir.join("model.bin")).unwrap(), b"abcdef");
        assert!(!dir.join("model.bin.part").exists());
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn resumes_only_the_requested_range() {
        let dir = temp("resume"); fs::write(dir.join("model.bin.part"), b"abc").unwrap();
        assert!(validate_range(Some("bytes 3-5/6"), 3, 6).is_ok());
        download_to_file(&fixture(), &dir, 3, |offset| {
            assert_eq!(offset, 3);
            Ok(response(200, b"abcdef"))
        }, |_| {}).unwrap();
        assert_eq!(fs::read(dir.join("model.bin")).unwrap(), b"abcdef");
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn ignored_range_restarts_without_appending_or_requesting_again() {
        let dir = temp("ignored"); fs::write(dir.join("model.bin.part"), b"abc").unwrap();
        download_to_file(&fixture(), &dir, 3, |_| Ok(response(200, b"abcdef")), |_| {}).unwrap();
        assert_eq!(fs::read(dir.join("model.bin")).unwrap(), b"abcdef");
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn invalid_range_preserves_partial_download() {
        let dir = temp("range"); fs::write(dir.join("model.bin.part"), b"abc").unwrap();
        for header in [None, Some("bytes 0-2/6"), Some("bytes 3-5/9")] { assert!(validate_range(header, 3, 6).is_err()); }
        assert_eq!(fs::read(dir.join("model.bin.part")).unwrap(), b"abc");
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn corruption_is_rejected_and_retry_can_succeed() {
        let dir = temp("corrupt");
        assert!(download_to_file(&fixture(), &dir, 0, |_| Ok(response(200, b"abcdeg")), |_| {}).is_err());
        assert!(!dir.join("model.bin").exists());
        assert!(!dir.join("model.bin.part").exists());
        download_to_file(&fixture(), &dir, 0, |_| Ok(response(200, b"abcdef")), |_| {}).unwrap();
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn incomplete_download_remains_resumable() {
        let dir = temp("short");
        assert!(download_to_file(&fixture(), &dir, 0, |_| Ok(response(200, b"abc")), |_| {}).is_err());
        assert_eq!(fs::read(dir.join("model.bin.part")).unwrap(), b"abc");
        assert!(!dir.join("model.bin").exists());
        fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn state_finds_real_staging_partials() {
        let dir = temp("state");
        fs::create_dir_all(dir.join("model/v1.staging")).unwrap();
        fs::write(dir.join("model/v1.staging/model.bin.part"), b"abc").unwrap();
        assert_eq!(state(&dir, "model").state, "queued");
        assert!(!valid_version("..")); assert!(!valid_version("."));
        fs::remove_dir_all(dir).unwrap();
    }
    const GATED: &[GatedFile] = &[
        GatedFile { path: "merged_model/big.bin", filename: "big.bin", bytes: 10, git_oid: None },
        GatedFile { path: "merged_model/small.json", filename: "small.json", bytes: 2, git_oid: Some("e69de29bb2d1d6434b8b29ae775ad8c2e48c5391") },
    ];
    fn gated() -> GatedManifest { GatedManifest { id: "demo", version: "v1", repo: "Org/Model", revision: "8ca840df03f738e56086a0f501819bdedd59e516", files: GATED } }
    fn listing(oid: &str) -> serde_json::Value {
        serde_json::json!([{"path":"merged_model/big.bin","size":10,"lfs":{"oid":oid}},{"path":"merged_model/small.json","size":2}])
    }
    #[test]
    fn gated_manifest_reads_checksums_with_the_token() {
        let oid = "a".repeat(64);
        // The pinned git id above is for an empty blob, so serve empty bytes with a size of 0 to match it.
        const EMPTY: &[GatedFile] = &[GatedFile { path: "merged_model/small.json", filename: "small.json", bytes: 0, git_oid: Some("e69de29bb2d1d6434b8b29ae775ad8c2e48c5391") }];
        let m = GatedManifest { id: "demo", version: "v1", repo: "Org/Model", revision: "8ca840df03f738e56086a0f501819bdedd59e516", files: EMPTY };
        let out = resolve_gated(&m, |_| Ok(serde_json::json!([{"path":"merged_model/small.json","size":0}])), |_| Ok(Vec::new())).unwrap();
        assert_eq!(out[0].filename, "small.json");
        assert!(out[0].url.starts_with("https://huggingface.co/Org/Model/resolve/8ca840df"));
        let out = resolve_gated(&gated(), |_| Ok(listing(&oid)), |_| Ok(vec![0u8; 2]));
        assert!(out.is_err(), "wrong git object id for the small file must be refused");
    }
    #[test]
    fn gated_manifest_refuses_hidden_masked_or_resized_files() {
        let masked = "*".repeat(64);
        assert!(resolve_gated(&gated(), |_| Ok(listing(&masked)), |_| Ok(Vec::new())).unwrap_err().contains("ccept the model terms"));
        let resized = serde_json::json!([{"path":"merged_model/big.bin","size":11,"lfs":{"oid":"a".repeat(64)}}]);
        assert!(resolve_gated(&gated(), |_| Ok(resized.clone()), |_| Ok(Vec::new())).unwrap_err().contains("size"));
        assert!(resolve_gated(&gated(), |_| Ok(serde_json::json!([])), |_| Ok(Vec::new())).is_err());
        let bad = GatedManifest { revision: "main", ..gated() };
        assert!(resolve_gated(&bad, |_| Ok(listing("x")), |_| Ok(Vec::new())).is_err());
    }
    #[test]
    fn git_blob_hash_matches_git() {
        assert_eq!(git_blob_sha1(b""), "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
        assert_eq!(git_blob_sha1(b"hello
"), "ce013625030ba8dba906f756967f9e9ca394464a");
    }
    #[test]
    fn identifiers_cannot_escape_storage() {
        for bad in ["../x", "A", "a/b", "", ".hidden"] {
            assert!(!valid_id(bad), "{bad}");
        }
        assert!(valid_id("qwen3-tts-17b"));
    }
    #[test]
    fn filenames_are_single_safe_components() {
        assert!(valid_filename("model-01.safetensors"));
        for bad in ["../x", "a/b", ".part", ""] {
            assert!(!valid_filename(bad));
        }
    }
    #[test]
    fn checksum_rejects_changed_content() {
        let dir = std::env::temp_dir().join(format!("greenroom-model-test-{}", std::process::id()));
        let _ = fs::create_dir_all(&dir);
        let file = dir.join("x");
        fs::write(&file, b"greenroom").unwrap();
        assert!(verify_sha256(
            &file,
            "92f8b7393e403b5a1d957605b5f7187790e606db77f10d5532d5e7d6d4c319f2"
        )
        .is_err());
        let _ = fs::remove_dir_all(dir);
    }
}
