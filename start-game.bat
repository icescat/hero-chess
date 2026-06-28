@echo off
chcp 65001 >nul 2>&1

cd /d "%~dp0src"

python --version >nul 2>&1
if %errorlevel% == 0 (
    start http://localhost:8000
    python -m http.server 8000
) else (
    echo Python未安装，请先安装 Python 3
    pause
)
