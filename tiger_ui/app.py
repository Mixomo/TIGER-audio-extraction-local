"""Gradio hosts the inference queue; HTML owns the visible interaction."""
from __future__ import annotations

import logging
from pathlib import Path
import uuid
import gradio as gr
from . import media as media_tools
from . import source as source_tools
from .i18n import TEXT
from .errors import describe_error

HERE = Path(__file__).parent
LOG = logging.getLogger('tiger')


def asset(name):
    return (HERE / name).read_text()


def create_app(backend=None, *, preview=False):
    if backend is None:
        from . import backend
    initial = {'status': 'empty', 'job': '', 'task': 'stems', 'media': 'audio', 'preview': preview}
    with gr.Blocks(title='TIGER — Audio separation', delete_cache=(3600, 86400)) as demo:
        with gr.Column(elem_id='tiger-app'):
            header = gr.HTML({'lang': 'en'}, html_template=asset('header.html'), js_on_load=asset('header.js'), apply_default_css=False, elem_id='tiger-header')
            controls = gr.HTML({'kind': 'initial'}, html_template=asset('controls.html'), js_on_load=asset('controls.js'), apply_default_css=False, elem_id='tiger-controls')
            player = gr.HTML(initial.copy(), html_template=asset('player.html'), js_on_load=asset('player.js'), apply_default_css=False, elem_id='tiger-player')
            gr.HTML(asset('credits.html'), js_on_load=asset('credits.js'), apply_default_css=False, elem_id='tiger-credits')

        def choose_example(evt: gr.EventData):
            data = evt._data or {}
            task, medium = source_tools.settings(data)
            key = source_tools.example_key(task, medium)
            path = source_tools.example_path(key)
            return {'kind': 'example', 'token': data.get('token'), 'key': key,
                    'file': media_tools.file_data(str(path)), 'bytes': path.stat().st_size}

        controls.example(choose_example, outputs=controls, queue=False, show_progress='hidden', api_visibility='private').failure(
            lambda: {'kind': 'failure', 'error': 'load_failed'}, outputs=controls, queue=False, show_progress='hidden', api_visibility='private')

        def input_waveform(evt: gr.EventData):
            data = evt._data or {}
            result = {'kind': 'waveform', 'sourceToken': data.get('sourceToken')}
            try:
                path = source_tools.resolve_source(data.get('source'))
                result.update(media_tools.input_envelope(path))
            except Exception:
                # Preview artwork is optional: it must never interrupt upload,
                # native playback or the inference status on the same component.
                result['unavailable'] = True
            return result

        controls.waveform(input_waveform, outputs=controls, queue=False,
                          trigger_mode='multiple', show_progress='hidden', api_visibility='private')

        def process(evt: gr.EventData, progress=gr.Progress()):
            data = evt._data or {}
            prepared, paths = None, []
            job = uuid.uuid4().hex
            lang = 'fr' if data.get('lang') == 'fr' else 'en'
            payload = {'job': job, 'task': 'stems', 'media': 'audio', 'preview': preview}

            def result(status, **extra):
                payload.update(status=status, **extra)
                notice = {'kind': 'status', 'status': status, 'token': data.get('token')}
                if status == 'error':
                    notice.update(extra, reference=job[:8])
                return notice, payload.copy()

            try:
                task_value, media_value = source_tools.settings(data)
                file = source_tools.resolve_source(data.get('source'))
                payload.update(task=task_value, media=media_value, filename=Path(file).name)
                yield result('prepare')
                prepared = media_tools.prepare(file, task_value, media_value)
                yield result('separating', duration=prepared['info']['duration'])
                paths = backend.separate(prepared['model_audio'], task_value, lang, progress, media=media_value)
                yield result('export')
                packed = media_tools.pack_results(prepared, paths,
                    lambda index, total: progress((index, total), desc=TEXT[lang]['export']))
                yield result('complete', **packed)
            except Exception as exc:
                LOG.exception('TIGER execution %s failed', job)
                yield result('error', **describe_error(exc), reference=job[:8])
            finally:
                media_tools.cleanup(prepared, paths)

        controls.separate(process, outputs=[controls, player],
            concurrency_limit=1, concurrency_id='tiger-inference',
            show_progress='hidden', api_visibility='private').failure(
                lambda: {'kind': 'failure', 'error': 'failed'}, outputs=controls,
                queue=False, show_progress='hidden', api_visibility='private')

        if not preview:
            import tiger_legacy as legacy
            with gr.Column(visible=False):
                a = gr.Audio(type='filepath', label='Input mixed audio')
                a_speech = gr.Audio(type='filepath', label='Input speech audio')
                v = gr.Video(label='Input video for audio stem separation')
                v_speech = gr.Video(label='Input video for speaker separation')
                specs = [
                    (legacy.separate_dialog_effects_music_from_audio, a, [gr.Audio(label=x) for x in ['Separated dialog audio', 'Separated sound effects audio', 'Separated background music audio']]),
                    (legacy.separate_speakers_from_audio, a_speech, [gr.Audio(label=f'Separated speaker {i+1}', visible=True if i==0 else 'hidden') for i in range(4)]),
                    (legacy.separate_dialog_effects_music_from_video, v, [gr.Video(label=x) for x in ['Video with dialog-only audio', 'Video with effects-only audio', 'Video with music-only audio']]),
                    (legacy.separate_speakers_from_video, v_speech, [gr.Video(label=f'Video with separated speaker {i+1}', visible=True if i==0 else 'hidden') for i in range(4)]),
                ]
                for fn, input_component, output_components in specs:
                    gr.Button(visible=False).click(fn, input_component, output_components,
                        api_name=fn.__name__, api_visibility='public',
                        concurrency_limit=1, concurrency_id='tiger-inference')
    demo.queue(max_size=20, default_concurrency_limit=1)
    return demo


def launch(demo, **kwargs):
    font=HERE / 'fonts' / 'NunitoSans-latin.woff2'
    css=asset('style.css').replace('__TIGER_FONT_URL__', '/gradio_api/file='+font.as_posix())
    demo.launch(ssr_mode=False, mcp_server=True, css=css, allowed_paths=[str(font.parent), str(HERE.parent / 'examples')], **kwargs)
