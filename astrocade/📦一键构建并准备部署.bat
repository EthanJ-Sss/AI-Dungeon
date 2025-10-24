@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║       📦 构建前端并准备部署包 📦                      ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/3] 检查环境配置...
if not exist .env.production (
    echo ⚠️ 未找到 .env.production，使用默认配置
    echo VITE_API_URL=http://43.173.170.5:3001/api > .env.production
)
echo ✅ API 地址配置:
type .env.production
echo.

echo [2/3] 构建前端项目...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo [3/3] 准备部署包...
if exist deploy (
    rmdir /s /q deploy
)
mkdir deploy
mkdir deploy\frontend
mkdir deploy\backend

echo 📋 复制前端文件...
xcopy /E /I /Y dist deploy\frontend >nul

echo 📋 复制后端文件...
xcopy /E /I /Y server deploy\backend >nul

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║          ✅ 部署包准备完成！                          ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📁 部署包位置: .\deploy\
echo.
echo 📤 下一步：
echo    1. 将 deploy\backend 上传到服务器（例如: /home/user/astrocade-server）
echo    2. 在服务器上进入 backend 目录，运行: npm install ^&^& node index.js
echo    3. 将 deploy\frontend 上传到服务器的 Web 根目录（例如: /var/www/html）
echo.
echo 🎮 上传完成后即可访问: http://43.173.170.5:8080/
echo.
pause

