"""Validate the custom HTML uploader without trusting client paths or URLs."""
from pathlib import Path
from gradio.utils import get_upload_folder
from .media import MediaError

ROOT = Path(__file__).resolve().parents[1]
# Fetched into ./examples by "1- install.bat" (download_models.py).
EXAMPLE_FILES = {
    'stems': 'examples/sound-scene.wav',
    'speakers': 'examples/two-voices.wav',
    'video': 'examples/video.mp4',
}
EXAMPLES = {key: ROOT / name for key, name in EXAMPLE_FILES.items()}


def _available(path):
    return path.is_file() and path.stat().st_size > 0


def example_path(key):
    if not isinstance(key, str) or key not in EXAMPLES:
        raise MediaError('invalid_file')
    path = EXAMPLES[key]
    if not _available(path):
        raise MediaError('load_failed')
    return path


def settings(data):
    task, media = data.get('task'), data.get('media')
    if task not in ('stems', 'speakers') or media not in ('audio', 'video'):
        raise MediaError('invalid_file')
    return task, media


def example_key(task, media):
    return 'video' if media == 'video' else task


def resolve_source(source):
    if not isinstance(source, dict):
        raise MediaError('empty_file')
    if source.get('origin') == 'example':
        path = example_path(source.get('key'))
    else:
        value = source.get('path')
        if not isinstance(value, str) or not value:
            raise MediaError('empty_file')
        # HTML event data bypasses gr.File preprocessing. Restrict it ourselves
        # to files created by Gradio's upload endpoint, after resolving symlinks.
        path = Path(value).resolve()
        try:
            path.relative_to(Path(get_upload_folder()).resolve())
        except ValueError:
            raise MediaError('invalid_file') from None
    if not path.is_file() or path.stat().st_size == 0:
        raise MediaError('empty_file')
    return str(path)
