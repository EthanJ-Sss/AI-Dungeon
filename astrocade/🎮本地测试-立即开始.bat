@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║          🎮 本地测试 - 在线异步对战 🎮                ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 这将在你的电脑上启动完整的在线功能测试！
echo.
echo 步骤：
echo   1️⃣ 启动后端 API (端口 3001)
echo   2️⃣ 启动前端开发服务器 (端口 5173)
echo   3️⃣ 自动打开浏览器
echo.
pause
echo.

cd /d "%~dp0"

echo [1/3] 检查后端依赖...
if not exist server\node_modules (
    echo 📦 首次运行，安装后端依赖...
    cd server
    call npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败！
        pause
        exit /b 1
    )
    cd ..
)

echo [2/3] 启动后端 API...
start "后端API" cmd /k "cd /d %~dp0server && node index.js"

timeout /t 2 /nobreak >nul

echo [3/3] 启动前端开发服务器...
echo.
echo ✅ 后端已启动: http://localhost:3001
echo 💡 前端即将启动: http://localhost:5173
echo.
echo 🎮 测试指南:
echo    1. 等待前端启动完成
echo    2. 浏览器会自动打开
echo    3. 点击"擂台竞技"
echo    4. 输入昵称测试在线功能
echo.
echo ⚠️ 关闭此窗口会同时关闭前端和后端
echo.

call npm run dev

