@echo off
setlocal
cd /d "%~dp0"
call "%~dp0_env.bat"

if not exist "%PY%" (
    echo Environment not found. Run "1- install.bat" first.
    pause
    exit /b 1
)

rem Models are pre-downloaded by "1- install.bat"; stay offline.
set "HF_HUB_OFFLINE=1"
if "%GRADIO_SERVER_NAME%"=="" set "GRADIO_SERVER_NAME=127.0.0.1"
if "%GRADIO_SERVER_PORT%"=="" set "GRADIO_SERVER_PORT=7860"

echo Starting TIGER on http://%GRADIO_SERVER_NAME%:%GRADIO_SERVER_PORT%
echo The browser opens automatically when the app is ready (set TIGER_NO_BROWSER=1 to disable).
"%PY%" gradio_app.py
pause
