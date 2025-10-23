@echo off
chcp 65001 >nul
echo ============================================
echo   清理Vite缓存并启动开发服务器
echo ============================================
echo.

echo [1/3] 停止现有Node进程...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo      ✓ 已停止现有进程
) else (
    echo      - 没有运行中的Node进程
)
echo.

echo [2/3] 清理Vite缓存...
if exist "node_modules\.vite" (
    rd /s /q "node_modules\.vite" 2>nul
    echo      ✓ 已清理 node_modules\.vite
) else (
    echo      - 缓存目录不存在
)

if exist ".vite" (
    rd /s /q ".vite" 2>nul
    echo      ✓ 已清理 .vite
)

if exist "dist" (
    rd /s /q "dist" 2>nul
    echo      ✓ 已清理 dist
)
echo.

echo [3/3] 启动开发服务器...
echo      正在启动，请稍候...
echo.
echo ============================================
echo   服务器启动后，访问显示的地址
echo   通常是：http://localhost:5173/
echo   按 Ctrl+C 可以停止服务器
echo ============================================
echo.

npm run dev


