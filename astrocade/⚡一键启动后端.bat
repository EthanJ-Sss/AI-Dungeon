@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║          🚀 启动异步对战后端 API 🚀                   ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0server"

echo [1/2] 检查依赖...
if not exist node_modules (
    echo 📦 首次运行，安装依赖...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ 依赖安装失败！
        pause
        exit /b 1
    )
)

echo.
echo [2/2] 启动后端服务器...
echo.
echo ✅ 后端将运行在: http://localhost:3001
echo 📁 数据保存在: ./server/data/
echo.
echo 💡 提示: 按 Ctrl+C 停止服务器
echo.

node index.js

pause


