@echo off
chcp 65001 >nul
color 0A
cls
echo.
echo ═══════════════════════════════════════
echo      🎮 AstroCade 游戏一键启动
echo ═══════════════════════════════════════
echo.
echo [提示] 正在启动开发服务器...
echo [提示] 启动后会自动打开浏览器
echo [提示] 服务器地址: http://localhost:5173
echo [提示] 按 Ctrl+C 可停止服务器
echo.
echo ═══════════════════════════════════════
echo.

cd astrocade

if not exist "node_modules\" (
    echo [警告] 检测到依赖未安装，正在自动安装...
    echo.
    call npm install
    echo.
    echo [完成] 依赖安装完成！
    echo.
)

echo [启动] 正在启动服务器...
echo.
call npm run dev

pause

