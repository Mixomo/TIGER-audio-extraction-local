"""Queued UI inference; the four public API callbacks live in tiger_legacy."""
from pathlib import Path
import uuid

import gradio as gr

from . import engine
from .i18n import TEXT


def separate(path: str, task: str, lang: str, progress=gr.Progress(), media: str = 'audio') -> list[str]:
    report = lambda fraction: progress(round(fraction, 4), desc=TEXT[lang]['separating'])
    report(0.0)
    if task == 'speakers':
        return engine.separate_speakers(path, str(Path('output_sep') / uuid.uuid4().hex), report)
    return engine.separate_stems(path, str(Path('output_dnr') / uuid.uuid4().hex), report)
