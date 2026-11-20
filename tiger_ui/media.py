"""CPU media preparation with ffmpeg. No model state or client-supplied server paths here."""
from __future__ import annotations

import json
import math
import shutil
import subprocess
import uuid
from pathlib import Path

import numpy as np
import soundfile as sf
from gradio.data_classes import FileData

RESULTS = Path('.tiger-results')
# Containers/codecs every modern browser plays without help.
BROWSER_CONTAINERS = {'.mp4', '.m4v', '.mov', '.webm'}
BROWSER_VIDEO_CODECS = {'h264', 'vp8', 'vp9', 'av1'}
MP4_COPY_CODECS = {'h264', 'hevc', 'av1', 'vp9', 'mpeg4'}


class MediaError(ValueError):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def _run(args, timeout=None):
    return subprocess.run(args, capture_output=True, check=True, timeout=timeout)


def inspect_media(path: str, media: str) -> dict:
    source = Path(path)
    if not source.is_file() or source.stat().st_size == 0:
        raise MediaError('empty_file')
    try:
        result = _run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(source)], 120)
        info = json.loads(result.stdout)
        streams = info.get('streams', [])
        audio = next((s for s in streams if s.get('codec_type') == 'audio'), None)
        if audio is None:
            raise MediaError('no_audio')
        # Cover art in audio files is reported as a video stream; ignore it.
        video = next((s for s in streams if s.get('codec_type') == 'video'
                      and not s.get('disposition', {}).get('attached_pic')), None)
        if media == 'video' and video is None:
            raise MediaError('video_required')
        duration = float(info.get('format', {}).get('duration') or audio.get('duration') or 0)
        if not math.isfinite(duration) or duration <= 0:
            raise MediaError('invalid_file')
        return {'duration': duration, 'sample_rate': int(audio['sample_rate']),
                'channels': int(audio['channels']),
                'video_codec': video.get('codec_name') if video else None}
    except MediaError:
        raise
    except (subprocess.SubprocessError, ValueError, KeyError, OSError):
        raise MediaError('invalid_file') from None


def decode_audio(source: str, destination: Path, sample_rate: int, mono: bool = True, channels: int = 1) -> str:
    args = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', source, '-map', '0:a:0', '-vn']
    if mono:
        args += ['-ac', '1']
    elif channels > 2:
        args += ['-ac', '2']  # Surround originals are compared as stereo.
    args += ['-ar', str(sample_rate), '-c:a', 'pcm_s16le', '-rf64', 'auto', str(destination)]
    try:
        _run(args)
    except (subprocess.SubprocessError, OSError):
        raise MediaError('decode_failed') from None
    return str(destination)


def browser_video(source: str, folder: Path, codec: str | None) -> str:
    """Return a video the browser can play: the source, a remux, or an H.264 transcode (no audio)."""
    if Path(source).suffix.lower() in BROWSER_CONTAINERS and codec in BROWSER_VIDEO_CODECS:
        return source
    target = folder / 'video.mp4'
    base = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', source, '-map', '0:v:0', '-an', '-sn']
    if codec in BROWSER_VIDEO_CODECS:
        try:
            _run(base + ['-c:v', 'copy', '-movflags', '+faststart', str(target)])
            return str(target)
        except (subprocess.SubprocessError, OSError):
            pass
    try:
        _run(base + ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
                     '-movflags', '+faststart', str(target)])
    except (subprocess.SubprocessError, OSError):
        raise MediaError('decode_failed') from None
    return str(target)


def attach_video(video_path: str, audio_path: str, out_path: str) -> str:
    """Mux a separated track onto the picture. The video stream is copied when possible."""
    base = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', video_path, '-i', audio_path,
            '-map', '0:v:0', '-map', '1:a:0']
    tail = ['-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out_path]
    try:
        _run(base + ['-c:v', 'copy'] + tail)
    except (subprocess.SubprocessError, OSError):
        try:
            _run(base + ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p'] + tail)
        except (subprocess.SubprocessError, OSError):
            raise RuntimeError('Could not create the output video') from None
    if not Path(out_path).is_file() or Path(out_path).stat().st_size == 0:
        raise RuntimeError(f'Invalid or empty output file: {out_path}')
    return out_path


def envelope(path: str, bins: int = 420) -> dict:
    """Block RMS across channels, with display-only smoothing and absolute scale."""
    with sf.SoundFile(path) as f:
        frames, sr = len(f), f.samplerate
        boundaries = np.linspace(0, frames, bins + 1, dtype=np.int64)
        points = []
        for left, right in zip(boundaries[:-1], boundaries[1:]):
            # Stride through very long bins to keep this fast on hour-long files.
            count = int(right - left)
            data = f.read(min(count, sr * 4), dtype='float32', always_2d=True)
            if count > sr * 4:
                f.seek(int(right))
            if not np.isfinite(data).all():
                raise RuntimeError('Non-finite samples in the separated track')
            points.append(float(np.sqrt(np.mean(np.square(data, dtype=np.float64)))) if data.size else 0.0)
    smoothed = np.convolve(points, [0.2, 0.6, 0.2], mode='same')
    return {'duration': frames / sr, 'sample_rate': sr, 'peaks': [round(float(x), 6) for x in smoothed]}


def file_data(path: str) -> dict:
    return FileData(path=str(Path(path).resolve()), orig_name=Path(path).name).model_dump()


def input_envelope(path: str, bins: int = 160) -> dict:
    """Small CPU-only preview; low-rate decode, no browser audio graph or files."""
    info = inspect_media(path, 'audio')
    rate = 8000 if info['duration'] < 1200 else 1000
    decoded = subprocess.run(
        ['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-map', '0:a:0',
         '-vn', '-ac', '1', '-ar', str(rate), '-f', 'f32le', 'pipe:1'],
        capture_output=True, check=True, timeout=600,
    )
    samples = np.frombuffer(decoded.stdout, dtype='<f4')
    if not samples.size or not np.isfinite(samples).all():
        raise MediaError('decode_failed')
    peaks = [float(np.sqrt(np.mean(np.square(part, dtype=np.float64))))
             if part.size else 0.0 for part in np.array_split(samples, bins)]
    return {'duration': info['duration'], 'peaks': [round(x, 6) for x in peaks]}


def prepare(source: str, task: str, media: str) -> dict:
    info = inspect_media(source, media)
    RESULTS.mkdir(exist_ok=True)
    folder = RESULTS / uuid.uuid4().hex
    folder.mkdir()
    try:
        # Preserve the original for comparison. Only the model's input is mono.
        original_audio = decode_audio(source, folder / 'original.wav', info['sample_rate'],
                                      mono=False, channels=info['channels'])
        target_sr = 16000 if task == 'speakers' else 44100
        model_audio = decode_audio(source, folder / 'model-input.wav', target_sr)
        video = browser_video(source, folder, info['video_codec']) if media == 'video' else None
        return {
            'folder': str(folder), 'source': source, 'video': video, 'model_audio': model_audio,
            'info': info, 'task': task, 'media': media,
            'original': {'id': 'original', 'audio': file_data(original_audio),
                         'video': file_data(video) if video else None,
                         **envelope(original_audio)},
        }
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        raise


def pack_results(prepared: dict, paths: list[str], on_export=None) -> dict:
    ids = ['voiceA', 'voiceB'] if prepared['task'] == 'speakers' else ['dialogue', 'effects', 'music']
    if len(paths) != len(ids):
        raise RuntimeError('Unexpected source count')
    tracks = []
    for index, (track_id, path) in enumerate(zip(ids, paths)):
        video = None
        if prepared['media'] == 'video':
            if on_export:
                on_export(index, len(paths))
            output = str(Path(prepared['folder']) / f'{track_id}.mp4')
            video = file_data(attach_video(prepared['video'], path, output))
        tracks.append({'id': track_id, 'audio': file_data(path), 'video': video, **envelope(path)})
    # Put music before effects in the visual arrangement; preserve legacy API order.
    if prepared['task'] == 'stems':
        tracks = [tracks[0], tracks[2], tracks[1]]
    return {'original': prepared['original'], 'tracks': tracks,
            'duration': prepared['original']['duration'], 'info': prepared['info']}


def cleanup(prepared: dict | None, paths: list[str]):
    """After Gradio has cached output files, discard only this job's originals."""
    folders = []
    if prepared:
        folder = Path(prepared['folder']).resolve()
        if folder.parent == RESULTS.resolve():
            folders.append(folder)
    for path in paths:
        folder = Path(path).resolve().parent
        if folder.parent in [Path('output_sep').resolve(), Path('output_dnr').resolve()]:
            folders.append(folder)
    for folder in set(folders):
        shutil.rmtree(folder, ignore_errors=True)
