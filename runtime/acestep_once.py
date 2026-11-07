"""Private one-shot ACE-Step music worker. JSON comes from stdin; a WAV file is written to the path in "out".

Input: {"model_dir", "prompt", "lyrics", "seconds", "seed", "out"}. Nothing is sent over the network.
"""
import contextlib
import json
import os
import sys

request = json.load(sys.stdin)
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

with contextlib.redirect_stdout(sys.stderr):
    import torch
    from acestep.pipeline_ace_step import ACEStepPipeline

    seconds = max(1, min(int(request["seconds"]), 240))
    seed = int(request.get("seed", 0))
    pipeline = ACEStepPipeline(
        checkpoint_dir=request["model_dir"],
        dtype="bfloat16" if torch.cuda.is_available() else "float32",
        torch_compile=False,
        cpu_offload=False,
    )
    pipeline(
        audio_duration=float(seconds),
        prompt=str(request.get("prompt", "")),
        lyrics=str(request.get("lyrics", "")) or "[instrumental]",
        infer_step=60,
        guidance_scale=15.0,
        scheduler_type="euler",
        cfg_type="apg",
        omega_scale=10.0,
        manual_seeds=str(seed),
        guidance_interval=0.5,
        guidance_interval_decay=0.0,
        min_guidance_scale=3.0,
        use_erg_tag=True,
        use_erg_lyric=True,
        use_erg_diffusion=True,
        save_path=request["out"],
    )
