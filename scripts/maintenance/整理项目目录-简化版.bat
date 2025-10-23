@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title 项目目录整理工具

echo ===============================================
echo       项目目录整理工具 v1.0
echo ===============================================
echo.

cd /d "%~dp0..\.."

:: 检查是否在正确的目录
if not exist "astrocade" (
    echo [错误] 未找到astrocade目录！
    echo 当前目录: %CD%
    pause
    exit /b 1
)

echo [信息] 开始整理...
echo.

:: 创建目录
if not exist "docs\completed" mkdir "docs\completed"
if not exist "docs\testing" mkdir "docs\testing"
if not exist "docs\guides" mkdir "docs\guides"
if not exist "docs\design" mkdir "docs\design"
if not exist "docs\development" mkdir "docs\development"
if not exist "scripts\deploy" mkdir "scripts\deploy"
if not exist "scripts\dev" mkdir "scripts\dev"

set count=0

echo [1] 整理已完成文档 (✅)...
for %%F in (✅*.md ✅*.txt) do (
    if exist "%%F" (
        if not exist "docs\completed\%%F" (
            move "%%F" "docs\completed\" >nul 2>&1
            echo   [移动] %%F
            set /a count+=1
        )
    )
)

echo [2] 整理测试文档 (🎯)...
for %%F in (🎯*.md 🎯*.txt) do (
    if exist "%%F" (
        if not exist "docs\testing\%%F" (
            move "%%F" "docs\testing\" >nul 2>&1
            echo   [移动] %%F
            set /a count+=1
        )
    )
)

echo [3] 整理指南文档 (⭐🎮👉)...
for %%F in (⭐*.md ⭐*.txt 🎮*.txt 👉*.txt 👉*.md) do (
    if exist "%%F" (
        if not exist "docs\guides\%%F" (
            move "%%F" "docs\guides\" >nul 2>&1
            echo   [移动] %%F
            set /a count+=1
        )
    )
)

echo [4] 整理庆祝文档 (🎉🎊)...
for %%F in (🎉*.md 🎊*.txt) do (
    if exist "%%F" (
        if not exist "docs\completed\%%F" (
            move "%%F" "docs\completed\" >nul 2>&1
            echo   [移动] %%F
            set /a count+=1
        )
    )
)

echo [5] 整理Bug文档 (🐛)...
for %%F in (🐛*.md) do (
    if exist "%%F" (
        if not exist "docs\completed\%%F" (
            move "%%F" "docs\completed\" >nul 2>&1
            echo   [移动] %%F
            set /a count+=1
        )
    )
)

echo [6] 整理数据文档 (📊)...
for %%F in (📊*.md) do (
    if exist "%%F" (
        if not exist "docs\design\%%F" (
            move "%%F" "docs\design\" >nul 2>&1
            echo   [移动] %%F
            set /a count+=1
        )
    )
)

echo [7] 整理设计文档...
for %%F in (
    "FirstDesign.md"
    "volcano-design-summary.md"
    "volcano-level-design.md"
    "volcano-skill-design.md"
    "火山关卡敌方阵容设计.md"
    "战斗系统规则文档.md"
    "游戏内容大扩展设计文档.md"
    "游戏内容扩展设计文档-精简版.md"
    "道具系统设计文档-招募券.md"
    "英雄系统重构说明.md"
    "设计简化总结.md"
    "数值平衡分析.md"
    "游戏节奏调整方案.md"
) do (
    if exist %%F (
        if not exist "docs\design\%%~F" (
            move %%F "docs\design\" >nul 2>&1
            echo   [移动] %%~F
            set /a count+=1
        )
    )
)

echo [8] 整理开发文档...
for %%F in (
    "开发计划.md"
    "TodoList.md"
    "当前开发进度.md"
    "Sprint2技能系统开发进度.md"
    "VOLCANO_IMPLEMENTATION_SUMMARY.md"
) do (
    if exist %%F (
        if not exist "docs\development\%%~F" (
            move %%F "docs\development\" >nul 2>&1
            echo   [移动] %%~F
            set /a count+=1
        )
    )
)

echo [9] 整理部署脚本...
for %%F in (
    "deploy.bat"
    "部署脚本.sh"
    "自动部署.ps1"
    "一键部署.bat"
    "一键部署命令.bat"
    "手动部署命令.txt"
    "服务器执行命令.txt"
    "部署说明.md"
) do (
    if exist %%F (
        if not exist "scripts\deploy\%%~F" (
            move %%F "scripts\deploy\" >nul 2>&1
            echo   [移动] %%~F
            set /a count+=1
        )
    )
)

echo [10] 整理开发脚本...
for %%F in (
    "启动开发服务器.bat"
    "一键启动游戏.bat"
    "快速启动游戏.bat"
    "一键修复并启动.bat"
) do (
    if exist %%F (
        if not exist "scripts\dev\%%~F" (
            move %%F "scripts\dev\" >nul 2>&1
            echo   [移动] %%~F
            set /a count+=1
        )
    )
)

echo [11] 整理维护脚本...
for %%F in (
    "完全清理并重装.bat"
) do (
    if exist %%F (
        if not exist "scripts\maintenance\%%~F" (
            move %%F "scripts\maintenance\" >nul 2>&1
            echo   [移动] %%~F
            set /a count+=1
        )
    )
)

echo [12] 整理使用指南...
for %%F in (
    "README使用说明.md"
    "Web项目启动指南.md"
    "启动游戏.md"
    "常见问题解决.md"
    "项目交付说明.md"
    "更新日志.md"
) do (
    if exist %%F (
        if not exist "docs\guides\%%~F" (
            move %%F "docs\guides\" >nul 2>&1
            echo   [移动] %%~F
            set /a count+=1
        )
    )
)

echo [13] 整理完成文档...
for %%F in (
    "Bug修复记录.md"
    "技能系统测试文档.md"
    "岩浆系统检查报告.md"
    "布阵界面显示优化完成.md"
    "战场布局一致性验证.md"
    "战场布局调整完成.md"
    "战场扩展和刺客瞬移实现完成.md"
    "战斗UI增强实施总结.md"
    "战斗场景UI优化完成.md"
    "战斗场景更新说明.md"
    "战斗日志优化完成.md"
    "战斗界面布局优化总结.md"
    "敌方布阵和行验证修复完成.md"
    "敌方角色详情侧边栏实现完成.md"
    "数值平衡完成总结.md"
    "新技能系统实现完成.md"
    "游戏节奏调整完成总结.md"
    "火焰齐射技能平衡调整.md"
    "英雄系统扩展实施完成总结.md"
    "角色放置问题修复完成.md"
    "角色消失问题调试指南.md"
    "冲刺技能伤害Bug修复完成.md"
) do (
    if exist %%F (
        if not exist "docs\completed\%%~F" (
            move %%F "docs\completed\" >nul 2>&1
            echo   [移动] %%~F
            set /a count+=1
        )
    )
)

echo [14] 整理修复工具 (🔧)...
for %%F in (🔧*.txt 🔧*.bat) do (
    if exist "%%F" (
        if "%%F" NEQ "🔧一键整理项目目录.bat" (
            if not exist "scripts\maintenance\%%F" (
                move "%%F" "scripts\maintenance\" >nul 2>&1
                echo   [移动] %%F
                set /a count+=1
            )
        )
    )
)

echo.
echo ===============================================
echo              整理完成！
echo ===============================================
echo 移动文件数: !count!
echo.
echo 项目目录已整理完毕！
echo 查看: 📋项目目录管理规范.md
echo.
pause

