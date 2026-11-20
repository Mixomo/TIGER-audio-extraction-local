@echo off
setlocal
cd /d "%~dp0"
call "%~dp0_env.bat"

echo.
echo === TIGER local install (self-contained, no cache) ===
echo.

rem --- 1. uv (portable, inside .uv\bin) ---------------------------------------
if not exist "%UV_EXE%" (
    echo [1/4] Downloading uv...
    if not exist "%UV_DIR%\bin" mkdir "%UV_DIR%\bin"
    curl.exe -L --fail -o "%UV_DIR%\uv.zip" https://github.com/astral-sh/uv/releases/download/0.12.7/uv-x86_64-pc-windows-msvc.zip || goto :fail
    tar.exe -xf "%UV_DIR%\uv.zip" -C "%UV_DIR%\bin" || goto :fail
    del "%UV_DIR%\uv.zip"
) else (
    echo [1/4] uv already present.
)
"%UV_EXE%" --version || goto :fail

rem --- 2. ffmpeg / ffprobe (portable, inside .ffmpeg\bin) ---------------------
if not exist "%FFMPEG_DIR%\bin\ffprobe.exe" (
    echo [2/4] Downloading ffmpeg...
    if exist "%FFMPEG_DIR%" rmdir /s /q "%FFMPEG_DIR%"
    mkdir "%FFMPEG_DIR%"
    curl.exe -L --fail -o "%FFMPEG_DIR%\ffmpeg.zip" https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip || goto :fail
    tar.exe -xf "%FFMPEG_DIR%\ffmpeg.zip" -C "%FFMPEG_DIR%" --strip-components=1 || goto :fail
    del "%FFMPEG_DIR%\ffmpeg.zip"
) else (
    echo [2/4] ffmpeg already present.
)
ffprobe.exe -version >nul 2>&1 || goto :fail

rem --- 3. Python 3.10 + dependencies (torch 2.8.0 CUDA 12.8) ------------------
echo [3/4] Installing Python and dependencies (this downloads ~3 GB)...
"%UV_EXE%" python install 3.10 || goto :fail
"%UV_EXE%" sync --locked --python 3.10 || goto :fail
"%PY%" -c "import torch; print('torch', torch.__version__, 'CUDA', torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else '')" || goto :fail

rem --- 4. Model weights + examples -------------------------------------------
echo [4/4] Downloading models...
"%PY%" download_models.py || goto :fail

echo.
echo === Install complete. Run "2- start.bat" ===
pause
exit /b 0

:fail
echo.
echo *** Install FAILED (see messages above) ***
pause
exit /b 1
