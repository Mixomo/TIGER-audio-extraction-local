"""TIGER models and chunked, streaming separation of files of any length.

Both models are run on overlapping blocks read from disk; results are
cross-faded and written straight to WAV, so neither RAM nor VRAM grows with
the input duration.
"""
from __future__ import annotations

import itertools
import math
import os
from pathlib import Path

import numpy as np
import soundfile as sf
import torch

import look2hear.models

ROOT = Path(__file__).resolve().parents[1]
CACHE = str(ROOT / 'cache')
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

dnr_model = look2hear.models.TIGERDNR.from_pretrained(
    'JusperLee/TIGER-DnR', revision='b7a59560bbca10febbcd46fb01600f868e587f57', cache_dir=CACHE,
).to(device).eval()
sep_model = look2hear.models.TIGER.from_pretrained(
    'JusperLee/TIGER-speech', revision='f0340340b2d9bbf72074edf8c076dcab59a10ba2', cache_dir=CACHE,
).to(device).eval()

DNR_SR = 44100
SPEECH_SR = 16000
# DnR already windows internally (12 s); blocks only bound memory.
DNR_BLOCK, DNR_OVERLAP = 120.0, 6.0
# The speech model needs ~0.105 GB of VRAM per second of audio.
SPEECH_GB_PER_SECOND = 0.105
SPEECH_MIN_BLOCK, SPEECH_MAX_BLOCK, SPEECH_OVERLAP = 10.0, 60.0, 4.0
WAV_LIMIT = 4 * 1024**3 - 1024**2


def speech_block_seconds() -> float:
    if device.type != 'cuda':
        return 30.0
    free, _ = torch.cuda.mem_get_info()
    seconds = free / 1024**3 * 0.7 / SPEECH_GB_PER_SECOND
    return float(max(SPEECH_MIN_BLOCK, min(SPEECH_MAX_BLOCK, math.floor(seconds))))


def _writer(path, sr, channels, frames):
    # Plain WAV is preferred (browser friendly); RF64 only beyond 4 GB.
    fmt = 'RF64' if frames * channels * 2 > WAV_LIMIT else 'WAV'
    return sf.SoundFile(path, 'w', samplerate=sr, channels=channels, subtype='PCM_16', format=fmt)


def _best_permutation(previous: np.ndarray, current: np.ndarray) -> list[int]:
    """Match sources across blocks by correlation on the shared overlap."""
    n = previous.shape[0]
    a = previous.reshape(n, -1)
    b = current.reshape(n, -1)
    a = a / (np.linalg.norm(a, axis=1, keepdims=True) + 1e-8)
    b = b / (np.linalg.norm(b, axis=1, keepdims=True) + 1e-8)
    score = a @ b.T
    return list(max(itertools.permutations(range(n)),
                    key=lambda p: sum(score[i, p[i]] for i in range(n))))


def separate_file(source: str, outputs: list[str], infer, block_s: float, overlap_s: float,
                  align: bool = False, progress=None) -> list[str]:
    """Stream `source` through `infer` in overlapping blocks into `outputs`.

    infer(x[channels, n], on_fraction) -> np.ndarray[n_sources, channels, n]
    progress(fraction) receives overall completion in [0, 1].
    """
    with sf.SoundFile(source) as f:
        sr, total = f.samplerate, f.frames
        if total == 0:
            raise ValueError('Empty audio')
        block = max(1, int(block_s * sr))
        overlap = min(int(overlap_s * sr), block // 2)
        step = block - overlap
        starts = list(range(0, max(total - overlap, 1), step))
        writers = []
        tail = None
        try:
            for index, start in enumerate(starts):
                f.seek(start)
                x = f.read(min(block, total - start), dtype='float32', always_2d=True).T
                fraction = lambda value, i=index: progress and progress((i + value) / len(starts))
                y = np.asarray(infer(x, fraction), dtype=np.float32)
                if not writers:
                    writers = [_writer(path, sr, y.shape[1], total) for path in outputs]
                if tail is not None:
                    width = tail.shape[-1]
                    if align:
                        y = y[_best_permutation(tail, y[..., :width])]
                    fade = np.linspace(0.0, 1.0, width, dtype=np.float32)
                    y[..., :width] = tail * (1.0 - fade) + y[..., :width] * fade
                last = start + x.shape[-1] >= total
                keep, tail = (y, None) if last else (y[..., :-overlap], y[..., -overlap:].copy())
                for writer, track in zip(writers, keep):
                    writer.write(np.clip(track.T, -1.0, 1.0))
                if progress:
                    progress((index + 1) / len(starts))
        finally:
            for writer in writers:
                writer.close()
    return outputs


def _infer_dnr(x: np.ndarray, on_fraction) -> np.ndarray:
    audio = torch.from_numpy(x.mean(axis=0, keepdims=True)).to(device)[None]
    with torch.no_grad():
        stems = dnr_model(audio, progress_callback=lambda done, total, _branch: on_fraction(done / total))
    # Order kept from the original API: dialog, effect, music.
    return np.stack([stem.float().cpu().numpy() for stem in stems])


def _infer_speakers(x: np.ndarray, on_fraction) -> np.ndarray:
    mono = torch.from_numpy(x.mean(axis=0, keepdims=True)).to(device)[None]
    with torch.no_grad():
        voices = sep_model(mono)[0]  # [2, n]
    return voices.float().cpu().numpy()[:, None, :]


def separate_stems(source: str, folder: str, progress=None) -> list[str]:
    """`source` must be a WAV at 44.1 kHz (mixed down to mono). Returns dialog, effect, music paths."""
    os.makedirs(folder, exist_ok=True)
    outputs = [os.path.join(folder, f'{name}.wav') for name in ('dialog', 'effect', 'music')]
    try:
        return separate_file(source, outputs, _infer_dnr, DNR_BLOCK, DNR_OVERLAP, progress=progress)
    finally:
        if device.type == 'cuda':
            torch.cuda.empty_cache()


def separate_speakers(source: str, folder: str, progress=None) -> list[str]:
    """`source` must be a mono WAV at 16 kHz. Returns two speaker paths."""
    os.makedirs(folder, exist_ok=True)
    outputs = [os.path.join(folder, f'speaker_{i + 1}.wav') for i in range(2)]
    try:
        return separate_file(source, outputs, _infer_speakers, speech_block_seconds(),
                             SPEECH_OVERLAP, align=True, progress=progress)
    finally:
        if device.type == 'cuda':
            torch.cuda.empty_cache()
