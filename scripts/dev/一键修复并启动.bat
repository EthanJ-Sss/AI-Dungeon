@echo off
chcp 65001 >nul
color 0A
echo =====================================
echo 🌋 火山关卡修复和启动
echo =====================================
echo.

cd astrocade

echo 步骤 1/4: 清除 Vite 缓存...
if exist ".vite" (
    rmdir /s /q .vite
    echo ✓ Vite 缓存已清除
) else (
    echo ✓ 没有 Vite 缓存
)

echo.
echo 步骤 2/4: 清除 node_modules 缓存...
if exist "node_modules\.vite" (
    rmdir /s /q node_modules\.vite
    echo ✓ node_modules 缓存已清除
)

echo.
echo 步骤 3/4: 清除 TypeScript 构建缓存...
if exist "tsconfig.tsbuildinfo" (
    del tsconfig.tsbuildinfo
    echo ✓ TypeScript 缓存已清除
)
if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache
    echo ✓ 构建缓存已清除
)

echo.
echo 步骤 4/6: 清除浏览器兼容缓存...
if exist "dist" (
    rmdir /s /q dist
    echo ✓ 构建输出已清除
)

echo.
echo 步骤 5/6: 触发文件更新...
echo. >> src\types\index.ts
echo ✓ 类型文件已更新

echo.
echo 步骤 6/6: 启动开发服务器...
echo.
echo =====================================
echo 🚀 正在启动 Vite 开发服务器...
echo =====================================
echo.
echo 提示: 启动后在浏览器访问 http://localhost:5173/
echo 提示: 按 Ctrl+C 可停止服务器
echo.

npm run dev

pause

