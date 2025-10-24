@echo off
chcp 65001 >nul
echo ================================
echo   清理缓存并启动开发服务器
echo ================================
echo.

echo [1/5] 切换到项目目录...
cd /d "%~dp0astrocade"
if errorlevel 1 (
    echo ❌ 无法切换到 astrocade 目录
    pause
    exit /b 1
)

echo [2/5] 清理 Vite 缓存...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ 已删除 node_modules\.vite
) else (
    echo ℹ️  node_modules\.vite 不存在，跳过
)

echo [3/5] 清理 dist 目录...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ 已删除 dist
) else (
    echo ℹ️  dist 不存在，跳过
)

echo [4/5] 清理 TypeScript 缓存...
if exist "tsconfig.tsbuildinfo" (
    del /q "tsconfig.tsbuildinfo"
    echo ✅ 已删除 tsconfig.tsbuildinfo
) else (
    echo ℹ️  tsconfig.tsbuildinfo 不存在，跳过
)

echo [5/5] 启动开发服务器...
echo.
echo 🚀 服务器启动后，请在浏览器中按 Ctrl+Shift+R 强制刷新！
echo.
npm run dev

pause



