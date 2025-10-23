@echo off
chcp 65001 >nul
color 0E
echo =====================================
echo 🔧 ElementType 错误专项修复
echo =====================================
echo.
echo 这个脚本专门修复以下错误：
echo "does not provide an export named 'ElementType'"
echo.
echo 将执行以下操作：
echo 1. 停止所有 Node 进程
echo 2. 清除所有 Vite 缓存
echo 3. 清除 TypeScript 缓存
echo 4. 清除浏览器兼容缓存
echo 5. 触发类型文件重新编译
echo 6. 启动服务器
echo.
pause

cd astrocade

echo.
echo [1/7] 停止现有 Node 进程...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Node 进程已停止
    timeout /t 2 >nul
) else (
    echo ✓ 没有运行中的 Node 进程
)

echo.
echo [2/7] 清除 Vite 缓存...
if exist ".vite" (
    rmdir /s /q .vite
    echo ✓ .vite 已删除
)
if exist "node_modules\.vite" (
    rmdir /s /q node_modules\.vite
    echo ✓ node_modules\.vite 已删除
)

echo.
echo [3/7] 清除 TypeScript 缓存...
if exist "tsconfig.tsbuildinfo" (
    del tsconfig.tsbuildinfo
    echo ✓ tsconfig.tsbuildinfo 已删除
)
if exist "tsconfig.app.tsbuildinfo" (
    del tsconfig.app.tsbuildinfo
    echo ✓ tsconfig.app.tsbuildinfo 已删除
)

echo.
echo [4/7] 清除 node_modules 缓存...
if exist "node_modules\.cache" (
    rmdir /s /q node_modules\.cache
    echo ✓ node_modules\.cache 已删除
)

echo.
echo [5/7] 清除构建输出...
if exist "dist" (
    rmdir /s /q dist
    echo ✓ dist 已删除
)

echo.
echo [6/7] 触发类型文件更新...
echo. >> src\types\index.ts
echo ✓ 类型文件时间戳已更新

echo.
echo [7/7] 启动开发服务器...
echo.
echo =====================================
echo 🚀 正在启动 Vite 开发服务器...
echo =====================================
echo.
echo ⚠️ 重要提示：
echo 1. 服务器启动后，在浏览器中按 Ctrl+Shift+R 硬刷新
echo 2. 如果还有错误，清除浏览器缓存后重试
echo 3. 确保没有其他 Vite 服务器在运行
echo.
echo 启动中...
echo.

npm run dev

pause

