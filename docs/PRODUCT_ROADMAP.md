# Greenroom Local Product Roadmap

The immediate priority is to make the working audio-production loop exceptionally clear: script, voice, direction, sound, review and export. New model labels should follow working capability, not lead it.

## Next release priorities

### 1. Finish the local voice engine

Connect the Chatterbox local runtime to selectable voices, reference-audio cloning and testable acting controls. Add a short built-in listening suite before advertising an accent or expression as ready.

### 2. Make local models operational, not collectible

Add a pinned, tested inference route for WazobiaVoice only after its complete runtime, required files, licence and performance behaviour can be verified. Until then, Greenroom may manage the downloaded weight but must not offer it as a usable voice.

### 3. Local transcription

Integrate Whisper as a real in-app transcription workflow: import audio, transcribe locally, review timing and attach the result to the project. The model should not reappear in Model Center until this route works end to end.

### 4. Better guided onboarding

Add a first-run checklist that recognizes whether the person wants offline voices, cloud voices, sound effects or a combination. It should install only the selected essentials and make disk size and privacy tradeoffs obvious.

### 5. Listening-led accent quality

Build curated audition packs for Nigerian English, Yoruba, Igbo, Hausa, British English, Filipino English and Korean. Record listener ratings, speaker/reference context and limitations rather than making broad accent claims.

## Product design principles

- A button must perform a useful action, not open a research link.
- A model download is not a working engine. The interface must say which is true.
- Local-first means no terminal, no hand-managed folders and no surprise network calls.
- Cloud features remain optional, visible and confirmed before paid work.
- Voice cloning requires consent, and accent quality is validated by listening rather than marketing labels.

## Later opportunities

- A scene-level performance board for pace, energy and physical continuity.
- Versioned sound-design presets for podcasts, drama, training and games.
- Guided model update channels with license/change notices.
- A commercial-rights report that surfaces provider terms alongside each final asset.

## Lessons from Vois Studio (reviewed 2026-11-02, from a screenshot and its public site)
- **A pipeline-shaped top bar** (Home, Projects, Listen, Voices, Tutorials) and a home screen of three big actions, then templates, then tutorials. Greenroom opens on an empty project list: add templates (Podcast, Audiobook, Game dialogue, Ad, Training) that create a cast and sample script.
- **A visible engine tier chip** ("Expressive") with a status dot, always in the header: show the active voice engine and whether it is ready.
- **Engines downloaded on first use with the size and hardware shown first**, grouped as quality tiers. Group Model Center by tier (Fast, Expressive, Direct-in-words) rather than by model name.
- **Export presets** per destination (ACX, Spotify, Apple, YouTube). Greenroom has loudness; add named presets.
- **Pronunciation dictionary with CSV import.**
- What Vois does not appear to have, and Greenroom can own: performance direction by body state, a consent ledger, picture sync, local SFX and music.

## Still to build (requested 2026-11-02, not started)
Local SFX (Stable Audio Open), local music (ACE-Step), Foley from picture, local Acting Director, speech-to-speech, performance compiler, one-click packs for every model. WazobiaVoice is the first model on the new gated one-click path (`docs/WAZOBIA_INSTALL.md`); the same pattern (pinned manifest, token, verified download, golden-path card) is the template for the rest.

## Local SFX and music: findings (checked on Hugging Face and PyPI, 2026-11-02)
| Model | Use | Licence | Gated | Runtime |
|---|---|---|---|---|
| Stable Audio Open Small | sound effects, short loops | Stability AI Community (free below a revenue limit, read before commercial use) | Yes, accept terms with a Hugging Face account (same flow as WazobiaVoice: `install_gated`) | `stable-audio-tools` |
| ACE-Step v1 3.5B | full songs, optional vocals | Apache-2.0 | No (can be pinned like Chatterbox) | diffusers-style pipeline |
| AudioLDM2, MusicGen | effects, music | CC-BY-NC (non-commercial) | No | skip for commercial users |

**Blocker found:** `stable-audio-tools` 0.0.20 requires Python 3.10 (`<3.11`) and `torch==2.7.1`, but Greenroom's managed runtime is Python 3.11.9 with torch 2.6.0. Local SFX therefore needs its own pinned Python 3.10 runtime (separate from Chatterbox, Kokoro and Qwen), several GB, and a real-machine test of install and generation. Nothing was built for it blind, because install and generation could not be checked here (the weights are gated).

**Suggested next spike (needs the owner's Hugging Face token on a real PC):** build the Python 3.10 runtime, install stable-audio-tools, run one 8-step generation from the local weights, then wrap it in the Model Center card pattern used for WazobiaVoice. ACE-Step is the easier first win because it is ungated and Apache-2.0.
