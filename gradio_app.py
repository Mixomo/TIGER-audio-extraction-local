"""TIGER Gradio entrypoint."""
from tiger_ui.app import create_app, launch

demo = create_app()

# A small, non-sensitive startup inventory makes rebuilds diagnosable.
import importlib.metadata
import json
import platform
print("TIGER runtime: " + json.dumps({
    "python": platform.python_version(),
    **{name: importlib.metadata.version(name) for name in [
        "gradio", "torch", "torchaudio", "numpy", "numba",
        "llvmlite", "huggingface-hub",
    ]},
}), flush=True)

if __name__ == '__main__':
    import os
    # Open the GUI in the default browser once the server is ready.
    # Set TIGER_NO_BROWSER=1 to disable.
    launch(demo, inbrowser=os.environ.get('TIGER_NO_BROWSER', '') not in ('1', 'true', 'yes'))
