@echo off
chcp 65001 >nul
color 0C
echo =====================================
echo 🧹 完全清理和重新安装
echo =====================================
echo.
echo ⚠️ 警告: 这将删除 node_modules 并重新安装依赖
echo 这个过程需要几分钟时间
echo.
pause
echo.

cd astrocade

echo 步骤 1/5: 删除 node_modules...
if exist "node_modules" (
    echo 正在删除 node_modules（这可能需要1-2分钟）...
    rmdir /s /q node_modules
    echo ✓ node_modules 已删除
)

echo.
echo 步骤 2/5: 删除 package-lock.json...
if exist "package-lock.json" (
    del package-lock.json
    echo ✓ package-lock.json 已删除
)

echo.
echo 步骤 3/5: 删除所有缓存文件...
if exist ".vite" rmdir /s /q .vite
if exist "dist" rmdir /s /q dist
if exist "tsconfig.tsbuildinfo" del tsconfig.tsbuildinfo
echo ✓ 缓存已清除

echo.
echo 步骤 4/5: 重新安装依赖...
echo （这可能需要2-3分钟，请耐心等待）
npm install

echo.
echo 步骤 5/5: 启动开发服务器...
echo.
echo =====================================
echo 🚀 正在启动开发服务器...
echo =====================================
echo.
echo 提示: 启动后在浏览器访问 http://localhost:5173/
echo 提示: 按 Ctrl+C 可停止服务器
echo.

npm run dev

pause

