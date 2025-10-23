@echo off
chcp 65001 >nul
color 0B
echo =====================================
echo 🎮 启动火山关卡游戏
echo =====================================
echo.

cd astrocade

echo 正在启动开发服务器...
echo.
echo 提示: 启动后在浏览器访问 http://localhost:5173/
echo 提示: 按 Ctrl+C 可停止服务器
echo 提示: 如果启动失败，请运行【一键修复并启动.bat】
echo.

npm run dev

pause

