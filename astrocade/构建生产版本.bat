@echo off
chcp 65001
echo ====================================
echo    构建生产版本
echo ====================================
echo.
echo 正在构建生产版本...
echo.

call npm run build

echo.
echo ====================================
echo 构建完成！
echo 输出目录: dist/
echo ====================================
echo.

pause



