"""Public API / MCP callbacks. Same names and outputs as the original Space."""
import os
import shutil
import uuid
from pathlib import Path

import gradio as gr

from tiger_ui import engine
from tiger_ui.media import attach_video, browser_video, decode_audio, inspect_media

MAX_SPEAKERS = 4


def _job(prefix: str) -> Path:
    folder = Path(prefix) / uuid.uuid4().hex[:8]
    folder.mkdir(parents=True)
    return folder


def _decode(path: str, folder: Path, sample_rate: int, media: str = 'audio') -> str:
    inspect_media(path, media)
    return decode_audio(path, folder / 'input.wav', sample_rate)


def _speaker_updates(paths: list[str], label: str) -> list:
    updates = []
    for i in range(MAX_SPEAKERS):
        if i < len(paths):
            updates.append(gr.update(value=paths[i], visible=True, label=f'Separated speaker {i + 1}{label}'))
        else:
            updates.append(gr.update(value=None, visible='hidden'))
    return updates


def _videos(video_path: str, audio_paths: list[str], names: list[str], folder: Path) -> list[str]:
    info = inspect_media(video_path, 'video')
    picture = browser_video(video_path, folder, info['video_codec'])
    return [attach_video(picture, audio, str(folder / f'{name}_video.mp4'))
            for audio, name in zip(audio_paths, names)]


def separate_speakers_core(audio_path: str) -> list[str]:
    folder = _job('output_sep')
    source = _decode(audio_path, folder, engine.SPEECH_SR)
    paths = engine.separate_speakers(source, str(folder))
    os.remove(source)
    return paths


def separate_dialog_effects_music_from_audio(input_audio_path: str) -> tuple[str, str, str]:
    """
    Separate a mixed audio file into dialog, sound effects, and background music stems.

    Use this tool when an agent needs dialog/effects/music source separation from one uploaded audio file.
    Files of any length are processed in overlapping blocks.

    Args:
        input_audio_path (str): File path to a mixed audio file containing dialog, effects, music, or any combination of them.

    Returns:
        tuple[str, str, str]: File paths for dialog-only audio, effects-only audio, and music-only audio.

    Important:
        Use this for dialog/effects/music separation, not for isolating individual speakers.
    """
    folder = _job('output_dnr')
    source = _decode(input_audio_path, folder, engine.DNR_SR)
    dialog, effect, music = engine.separate_stems(source, str(folder))
    os.remove(source)
    return dialog, effect, music


def separate_speakers_from_audio(input_speech_audio_path: str) -> list:
    """
    Separate overlapping speech in an audio file into individual speaker tracks.

    Use this tool when an agent needs to isolate speakers from a speech recording.
    Files of any length are processed in overlapping blocks with consistent speaker order.

    Args:
        input_speech_audio_path (str): File path to an audio file containing one or more speakers.

    Returns:
        list: Gradio updates containing separated speaker audio files and visibility states.

    Important:
        This tool separates speaker audio but does not transcribe, diarize, or identify speaker names.
    """
    return _speaker_updates(separate_speakers_core(input_speech_audio_path), '')


def separate_dialog_effects_music_from_video(input_video_path: str) -> tuple[str, str, str]:
    """
    Separate a video's audio into dialog-only, effects-only, and music-only video outputs.

    Use this tool when an agent needs separate video copies with different audio stems.

    Args:
        input_video_path (str): File path to a video containing an audio track.

    Returns:
        tuple[str, str, str]: File paths for dialog-audio video, effects-audio video, and music-audio video.

    Important:
        This preserves the original visuals and replaces only the audio track.
    """
    stems = separate_dialog_effects_music_from_audio(input_video_path)
    folder = _job('output_dnr_video')
    videos = _videos(input_video_path, list(stems), ['dialog', 'effect', 'music'], folder)
    shutil.rmtree(Path(stems[0]).parent, ignore_errors=True)
    return tuple(videos)


def separate_speakers_from_video(input_video_path: str) -> list:
    """
    Separate speakers from a video's audio track and return speaker-specific videos.

    Use this tool when an agent needs to isolate speakers from a video while preserving visuals.

    Args:
        input_video_path (str): File path to a video containing speech and an audio track.

    Returns:
        list: Gradio updates containing separated speaker video files and visibility states.

    Important:
        This separates speakers but does not transcribe, diarize, or separate dialog from effects or music.
    """
    voices = separate_speakers_core(input_video_path)
    folder = _job('output_sep_video')
    videos = _videos(input_video_path, voices, [f'speaker_{i + 1}' for i in range(len(voices))], folder)
    shutil.rmtree(Path(voices[0]).parent, ignore_errors=True)
    return _speaker_updates(videos, ' video')
