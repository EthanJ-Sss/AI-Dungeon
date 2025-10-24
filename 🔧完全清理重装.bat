@echo off
chcp 65001 >nul
echo ================================
echo   完全清理并重新安装
echo ================================
echo.
echo ⚠️  警告：此操作将删除 node_modules 并重新安装所有依赖
echo.
pause
echo.

echo [1/6] 切换到项目目录...
cd /d "%~dp0astrocade"
if errorlevel 1 (
    echo ❌ 无法切换到 astrocade 目录
    pause
    exit /b 1
)

echo [2/6] 删除 node_modules\.vite 缓存...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ 已删除 node_modules\.vite
) else (
    echo ℹ️  node_modules\.vite 不存在，跳过
)

echo [3/6] 删除 dist 构建目录...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ 已删除 dist
) else (
    echo ℹ️  dist 不存在，跳过
)

echo [4/6] 删除 TypeScript 缓存...
if exist "tsconfig.tsbuildinfo" (
    del /q "tsconfig.tsbuildinfo"
    echo ✅ 已删除 tsconfig.tsbuildinfo
)
if exist "tsconfig.app.tsbuildinfo" (
    del /q "tsconfig.app.tsbuildinfo"
    echo ✅ 已删除 tsconfig.app.tsbuildinfo
)

echo [5/6] 重新安装依赖...
echo ℹ️  这可能需要几分钟时间...
call npm install
if errorlevel 1 (
    echo ❌ npm install 失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo [6/6] 启动开发服务器...
echo.
echo 🚀 服务器启动后，请在浏览器中按 Ctrl+Shift+R 强制刷新！
echo.
npm run dev

pause




