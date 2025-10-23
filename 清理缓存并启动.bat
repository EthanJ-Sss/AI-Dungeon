@echo off
chcp 65001 >nul
echo ================================
echo   清理缓存并启动开发服务器
echo ================================
echo.

echo [1/4] 切换到项目目录...
cd /d "%~dp0astrocade"

echo [2/4] 清理 Vite 缓存...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo 已删除 Vite 缓存
)

echo [3/4] 清理构建目录...
if exist "dist" (
    rmdir /s /q "dist"
    echo 已删除 dist 目录
)

echo [4/4] 启动开发服务器...
echo.
echo 服务器启动后，请在浏览器中按 Ctrl+Shift+R 强制刷新！
echo.
npm run dev

pause

