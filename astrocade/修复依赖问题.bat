@echo off
chcp 65001 >nul
cls
echo.
echo ════════════════════════════════════════════════════════════
echo              修复TailwindCSS依赖问题
echo ════════════════════════════════════════════════════════════
echo.
echo 正在删除旧的依赖...
if exist node_modules (
    rd /s /q node_modules
    echo ✓ 已删除 node_modules
)
if exist package-lock.json (
    del package-lock.json
    echo ✓ 已删除 package-lock.json
)
echo.
echo 正在重新安装依赖...
echo 这可能需要1-3分钟，请耐心等待...
echo.
call npm install
echo.
echo ════════════════════════════════════════════════════════════
echo 修复完成！
echo 现在可以启动开发服务器了
echo ════════════════════════════════════════════════════════════
echo.
pause



