@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║       🚀 自动部署 - 立即执行 🚀                       ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/2] 构建前端项目...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo [2/2] 准备部署包...
if exist deploy (
    rmdir /s /q deploy
)
mkdir deploy

echo 📋 复制前端文件到 deploy 目录...
xcopy /E /I /Y dist deploy >nul

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║          ✅ 构建完成！                                ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📁 部署包位置: .\deploy\
echo.
echo 💡 下一步：
echo    请将 deploy\ 目录中的所有文件
echo    上传到服务器: http://43.173.170.5:8080/
echo.
echo    或使用以下命令（如果配置了SSH）：
echo    scp -r deploy/* root@43.173.170.5:/var/www/html/
echo.
pause

