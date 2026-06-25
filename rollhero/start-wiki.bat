@echo off
echo ========================================
echo    勇者棋 Wiki 本地服务器
echo ========================================
echo.
echo 正在启动本地服务器...
echo 浏览器将自动打开 http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

cd /d "%~dp0"

REM 尝试使用Python启动服务器
python --version >nul 2>&1
if %errorlevel% == 0 (
    start http://localhost:8000
    python -m http.server 8000
) else (
    echo Python未安装，请直接打开 index.html 文件
    pause
)

