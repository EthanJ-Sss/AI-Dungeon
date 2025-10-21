@echo off
chcp 65001
echo ====================================
echo    AstroCade 游戏开发服务器启动
echo ====================================
echo.
echo 正在启动开发服务器...
echo 请等待浏览器自动打开...
echo.
echo 开发服务器地址: http://localhost:5173
echo 按 Ctrl+C 可以停止服务器
echo.
echo ====================================
echo.

call npm run dev

pause



