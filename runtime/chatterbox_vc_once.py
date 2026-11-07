"""Private one-shot Chatterbox voice-conversion worker. JSON comes from stdin; a WAV file is written to "out".

Input: {"model_dir", "source", "target", "out"}. The timing and emotion of "source" are kept; the voice becomes "target".
"""
import contextlib
import json
import os
import sys
from pathlib import Path

request = json.load(sys.stdin)
os.environ.setdefault("HF_HUB_OFFLINE", "1")

with contextlib.redirect_stdout(sys.stderr):
    import torch
    import torchaudio
    from chatterbox.vc import ChatterboxVC

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = ChatterboxVC.from_local(Path(request["model_dir"]), device)
    with torch.inference_mode():
        wav = model.generate(request["source"], target_voice_path=request["target"])
    torchaudio.save(request["out"], wav.detach().cpu(), model.sr, encoding="PCM_S", bits_per_sample=16)
