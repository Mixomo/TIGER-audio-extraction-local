@echo off
rem Shared environment: everything lives inside this folder, no global caches.
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

set "UV_DIR=%ROOT%\.uv"
set "UV_EXE=%UV_DIR%\bin\uv.exe"
set "UV_NO_CACHE=1"
set "UV_PYTHON_INSTALL_DIR=%UV_DIR%\python"
set "UV_PYTHON_PREFERENCE=only-managed"
set "UV_PROJECT_ENVIRONMENT=%ROOT%\.venv"
set "UV_TOOL_DIR=%UV_DIR%\tools"
set "UV_LINK_MODE=copy"
set "UV_NO_CONFIG=1"

set "HF_HOME=%ROOT%\.hf"
set "HF_HUB_DISABLE_TELEMETRY=1"
set "TORCH_HOME=%ROOT%\.torch"
set "GRADIO_TEMP_DIR=%ROOT%\.gradio\tmp"
set "GRADIO_ANALYTICS_ENABLED=False"
set "PYTHONUTF8=1"
set "PYTHONNOUSERSITE=1"
set "PYTHONDONTWRITEBYTECODE=1"

set "FFMPEG_DIR=%ROOT%\.ffmpeg"
set "PATH=%FFMPEG_DIR%\bin;%UV_DIR%\bin;%PATH%"
set "PY=%ROOT%\.venv\Scripts\python.exe"
