@echo off
chcp 65001 >nul
title 一键整理项目目录

echo ===============================================
echo         一键整理项目目录
echo ===============================================
echo.

:: 检查是否在项目根目录
if not exist "astrocade" (
    echo [错误] 请在项目根目录运行此脚本！
    pause
    exit /b 1
)

:: 调用整理脚本
if exist "scripts\maintenance\organize-project.bat" (
    call "scripts\maintenance\organize-project.bat"
) else if exist "scripts\maintenance\整理项目目录-简化版.bat" (
    call "scripts\maintenance\整理项目目录-简化版.bat"
) else if exist "scripts\maintenance\整理项目目录.bat" (
    call "scripts\maintenance\整理项目目录.bat"
) else (
    echo [错误] 找不到整理脚本！
    echo 路径: scripts\maintenance\organize-project.bat
    pause
    exit /b 1
)

