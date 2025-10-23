@echo off
chcp 65001 >nul
cls
echo.
echo ════════════════════════════════════════════════════════════
echo                   AstroCade 游戏项目
echo ════════════════════════════════════════════════════════════
echo.
echo   [1] 启动开发服务器（首次使用请先选择2安装依赖）
echo   [2] 安装项目依赖（首次使用必选）
echo   [3] 修复依赖问题（如果遇到TailwindCSS错误）
echo   [4] 构建生产版本
echo   [5] 打开项目文件夹
echo   [6] 查看快速启动指南
echo   [7] 退出
echo.
echo ════════════════════════════════════════════════════════════
echo.
set /p choice=请输入选项 (1-7): 

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto install
if "%choice%"=="3" goto fix_deps
if "%choice%"=="4" goto build
if "%choice%"=="5" goto open_folder
if "%choice%"=="6" goto show_guide
if "%choice%"=="7" goto end

echo 无效选项，请重新选择！
timeout /t 2 >nul
goto :eof

:start_dev
cls
echo.
echo ════════════════════════════════════════════════════════════
echo              启动开发服务器
echo ════════════════════════════════════════════════════════════
echo.
echo 正在启动...
echo.
cd astrocade
call npm run dev
goto end

:install
cls
echo.
echo ════════════════════════════════════════════════════════════
echo              安装项目依赖
echo ════════════════════════════════════════════════════════════
echo.
echo 正在安装依赖包...
echo 这可能需要1-3分钟，请耐心等待...
echo.
cd astrocade
call npm install
echo.
echo ════════════════════════════════════════════════════════════
echo 依赖安装完成！现在可以选择1启动开发服务器
echo ════════════════════════════════════════════════════════════
echo.
pause
goto :eof

:fix_deps
cls
echo.
echo ════════════════════════════════════════════════════════════
echo              修复依赖问题
echo ════════════════════════════════════════════════════════════
echo.
echo 此选项会：
echo 1. 重新安装依赖包
echo 2. 修复TailwindCSS版本问题
echo.
echo 正在修复...
echo.
cd astrocade
call npm install
echo.
echo ════════════════════════════════════════════════════════════
echo 修复完成！现在可以选择1启动开发服务器
echo ════════════════════════════════════════════════════════════
echo.
pause
goto :eof

:build
cls
echo.
echo ════════════════════════════════════════════════════════════
echo              构建生产版本
echo ════════════════════════════════════════════════════════════
echo.
echo 正在构建...
echo.
cd astrocade
call npm run build
echo.
echo ════════════════════════════════════════════════════════════
echo 构建完成！输出目录: astrocade\dist\
echo ════════════════════════════════════════════════════════════
echo.
pause
goto :eof

:open_folder
cls
echo 正在打开项目文件夹...
explorer astrocade
goto end

:show_guide
cls
echo 正在打开快速启动指南...
start astrocade\快速启动指南.md
goto end

:end
echo.
echo 感谢使用！
timeout /t 2 >nul
exit

