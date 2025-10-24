@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Project Directory Organizer

echo ===============================================
echo       Project Directory Organizer v1.0
echo ===============================================
echo.

cd /d "%~dp0..\.."

:: Check if we're in the correct directory
if not exist "astrocade" (
    echo [ERROR] astrocade directory not found!
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo [INFO] Starting organization...
echo.

:: Create directories
if not exist "docs\completed" mkdir "docs\completed"
if not exist "docs\testing" mkdir "docs\testing"
if not exist "docs\guides" mkdir "docs\guides"
if not exist "docs\design" mkdir "docs\design"
if not exist "docs\development" mkdir "docs\development"
if not exist "scripts\deploy" mkdir "scripts\deploy"
if not exist "scripts\dev" mkdir "scripts\dev"

set count=0

echo [1] Moving completed documents...
for %%F in (✅*.md ✅*.txt) do (
    if exist "%%F" (
        if not exist "docs\completed\%%F" (
            move "%%F" "docs\completed\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   [MOVED] %%F
                set /a count+=1
            )
        )
    )
)

echo [2] Moving test documents...
for %%F in (🎯*.md 🎯*.txt) do (
    if exist "%%F" (
        if not exist "docs\testing\%%F" (
            move "%%F" "docs\testing\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   [MOVED] %%F
                set /a count+=1
            )
        )
    )
)

echo [3] Moving guide documents...
for %%F in (⭐*.md ⭐*.txt 🎮*.txt 👉*.txt 👉*.md) do (
    if exist "%%F" (
        if not exist "docs\guides\%%F" (
            move "%%F" "docs\guides\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   [MOVED] %%F
                set /a count+=1
            )
        )
    )
)

echo [4] Moving celebration documents...
for %%F in (🎉*.md 🎊*.txt) do (
    if exist "%%F" (
        if not exist "docs\completed\%%F" (
            move "%%F" "docs\completed\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   [MOVED] %%F
                set /a count+=1
            )
        )
    )
)

echo [5] Moving bug documents...
for %%F in (🐛*.md) do (
    if exist "%%F" (
        if not exist "docs\completed\%%F" (
            move "%%F" "docs\completed\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   [MOVED] %%F
                set /a count+=1
            )
        )
    )
)

echo [6] Moving data documents...
for %%F in (📊*.md 📋*.md) do (
    if exist "%%F" (
        if not exist "docs\design\%%F" (
            move "%%F" "docs\design\" >nul 2>&1
            if !errorlevel! equ 0 (
                echo   [MOVED] %%F
                set /a count+=1
            )
        )
    )
)

echo [7] Moving design documents...
if exist "FirstDesign.md" if not exist "docs\design\FirstDesign.md" move "FirstDesign.md" "docs\design\" >nul 2>&1 && echo   [MOVED] FirstDesign.md && set /a count+=1
if exist "volcano-design-summary.md" if not exist "docs\design\volcano-design-summary.md" move "volcano-design-summary.md" "docs\design\" >nul 2>&1 && echo   [MOVED] volcano-design-summary.md && set /a count+=1
if exist "volcano-level-design.md" if not exist "docs\design\volcano-level-design.md" move "volcano-level-design.md" "docs\design\" >nul 2>&1 && echo   [MOVED] volcano-level-design.md && set /a count+=1
if exist "volcano-skill-design.md" if not exist "docs\design\volcano-skill-design.md" move "volcano-skill-design.md" "docs\design\" >nul 2>&1 && echo   [MOVED] volcano-skill-design.md && set /a count+=1
if exist "火山关卡敌方阵容设计.md" if not exist "docs\design\火山关卡敌方阵容设计.md" move "火山关卡敌方阵容设计.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 火山关卡敌方阵容设计.md && set /a count+=1
if exist "战斗系统规则文档.md" if not exist "docs\design\战斗系统规则文档.md" move "战斗系统规则文档.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 战斗系统规则文档.md && set /a count+=1
if exist "游戏内容大扩展设计文档.md" if not exist "docs\design\游戏内容大扩展设计文档.md" move "游戏内容大扩展设计文档.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 游戏内容大扩展设计文档.md && set /a count+=1
if exist "游戏内容扩展设计文档-精简版.md" if not exist "docs\design\游戏内容扩展设计文档-精简版.md" move "游戏内容扩展设计文档-精简版.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 游戏内容扩展设计文档-精简版.md && set /a count+=1
if exist "道具系统设计文档-招募券.md" if not exist "docs\design\道具系统设计文档-招募券.md" move "道具系统设计文档-招募券.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 道具系统设计文档-招募券.md && set /a count+=1
if exist "英雄系统重构说明.md" if not exist "docs\design\英雄系统重构说明.md" move "英雄系统重构说明.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 英雄系统重构说明.md && set /a count+=1
if exist "设计简化总结.md" if not exist "docs\design\设计简化总结.md" move "设计简化总结.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 设计简化总结.md && set /a count+=1
if exist "数值平衡分析.md" if not exist "docs\design\数值平衡分析.md" move "数值平衡分析.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 数值平衡分析.md && set /a count+=1
if exist "游戏节奏调整方案.md" if not exist "docs\design\游戏节奏调整方案.md" move "游戏节奏调整方案.md" "docs\design\" >nul 2>&1 && echo   [MOVED] 游戏节奏调整方案.md && set /a count+=1

echo [8] Moving development documents...
if exist "开发计划.md" if not exist "docs\development\开发计划.md" move "开发计划.md" "docs\development\" >nul 2>&1 && echo   [MOVED] 开发计划.md && set /a count+=1
if exist "TodoList.md" if not exist "docs\development\TodoList.md" move "TodoList.md" "docs\development\" >nul 2>&1 && echo   [MOVED] TodoList.md && set /a count+=1
if exist "当前开发进度.md" if not exist "docs\development\当前开发进度.md" move "当前开发进度.md" "docs\development\" >nul 2>&1 && echo   [MOVED] 当前开发进度.md && set /a count+=1
if exist "Sprint2技能系统开发进度.md" if not exist "docs\development\Sprint2技能系统开发进度.md" move "Sprint2技能系统开发进度.md" "docs\development\" >nul 2>&1 && echo   [MOVED] Sprint2技能系统开发进度.md && set /a count+=1
if exist "VOLCANO_IMPLEMENTATION_SUMMARY.md" if not exist "docs\development\VOLCANO_IMPLEMENTATION_SUMMARY.md" move "VOLCANO_IMPLEMENTATION_SUMMARY.md" "docs\development\" >nul 2>&1 && echo   [MOVED] VOLCANO_IMPLEMENTATION_SUMMARY.md && set /a count+=1

echo [9] Moving deployment scripts...
if exist "deploy.bat" if not exist "scripts\deploy\deploy.bat" move "deploy.bat" "scripts\deploy\" >nul 2>&1 && echo   [MOVED] deploy.bat && set /a count+=1
if exist "部署脚本.sh" if not exist "scripts\deploy\部署脚本.sh" move "部署脚本.sh" "scripts\deploy\" >nul 2>&1 && echo   [MOVED] 部署脚本.sh && set /a count+=1
if exist "自动部署.ps1" if not exist "scripts\deploy\自动部署.ps1" move "自动部署.ps1" "scripts\deploy\" >nul 2>&1 && echo   [MOVED] 自动部署.ps1 && set /a count+=1
if exist "一键部署.bat" if not exist "scripts\deploy\一键部署.bat" move "一键部署.bat" "scripts\deploy\" >nul 2>&1 && echo   [MOVED] 一键部署.bat && set /a count+=1
if exist "一键部署命令.bat" if not exist "scripts\deploy\一键部署命令.bat" move "一键部署命令.bat" "scripts\deploy\" >nul 2>&1 && echo   [MOVED] 一键部署命令.bat && set /a count+=1
if exist "手动部署命令.txt" if not exist "scripts\deploy\手动部署命令.txt" move "手动部署命令.txt" "scripts\deploy\" >nul 2>&1 && echo   [MOVED] 手动部署命令.txt && set /a count+=1
if exist "服务器执行命令.txt" if not exist "scripts\deploy\服务器执行命令.txt" move "服务器执行命令.txt" "scripts\deploy\" >nul 2>&1 && echo   [MOVED] 服务器执行命令.txt && set /a count+=1
if exist "部署说明.md" if not exist "scripts\deploy\部署说明.md" move "部署说明.md" "scripts\deploy\" >nul 2>&1 && echo   [MOVED] 部署说明.md && set /a count+=1

echo [10] Moving development scripts...
if exist "启动开发服务器.bat" if not exist "scripts\dev\启动开发服务器.bat" move "启动开发服务器.bat" "scripts\dev\" >nul 2>&1 && echo   [MOVED] 启动开发服务器.bat && set /a count+=1
if exist "一键启动游戏.bat" if not exist "scripts\dev\一键启动游戏.bat" move "一键启动游戏.bat" "scripts\dev\" >nul 2>&1 && echo   [MOVED] 一键启动游戏.bat && set /a count+=1
if exist "快速启动游戏.bat" if not exist "scripts\dev\快速启动游戏.bat" move "快速启动游戏.bat" "scripts\dev\" >nul 2>&1 && echo   [MOVED] 快速启动游戏.bat && set /a count+=1
if exist "一键修复并启动.bat" if not exist "scripts\dev\一键修复并启动.bat" move "一键修复并启动.bat" "scripts\dev\" >nul 2>&1 && echo   [MOVED] 一键修复并启动.bat && set /a count+=1

echo [11] Moving maintenance scripts...
if exist "完全清理并重装.bat" if not exist "scripts\maintenance\完全清理并重装.bat" move "完全清理并重装.bat" "scripts\maintenance\" >nul 2>&1 && echo   [MOVED] 完全清理并重装.bat && set /a count+=1

echo [12] Moving guide documents...
if exist "README使用说明.md" if not exist "docs\guides\README使用说明.md" move "README使用说明.md" "docs\guides\" >nul 2>&1 && echo   [MOVED] README使用说明.md && set /a count+=1
if exist "Web项目启动指南.md" if not exist "docs\guides\Web项目启动指南.md" move "Web项目启动指南.md" "docs\guides\" >nul 2>&1 && echo   [MOVED] Web项目启动指南.md && set /a count+=1
if exist "启动游戏.md" if not exist "docs\guides\启动游戏.md" move "启动游戏.md" "docs\guides\" >nul 2>&1 && echo   [MOVED] 启动游戏.md && set /a count+=1
if exist "常见问题解决.md" if not exist "docs\guides\常见问题解决.md" move "常见问题解决.md" "docs\guides\" >nul 2>&1 && echo   [MOVED] 常见问题解决.md && set /a count+=1
if exist "项目交付说明.md" if not exist "docs\guides\项目交付说明.md" move "项目交付说明.md" "docs\guides\" >nul 2>&1 && echo   [MOVED] 项目交付说明.md && set /a count+=1
if exist "更新日志.md" if not exist "docs\guides\更新日志.md" move "更新日志.md" "docs\guides\" >nul 2>&1 && echo   [MOVED] 更新日志.md && set /a count+=1

echo [13] Moving completed documents...
if exist "Bug修复记录.md" if not exist "docs\completed\Bug修复记录.md" move "Bug修复记录.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] Bug修复记录.md && set /a count+=1
if exist "技能系统测试文档.md" if not exist "docs\completed\技能系统测试文档.md" move "技能系统测试文档.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 技能系统测试文档.md && set /a count+=1
if exist "岩浆系统检查报告.md" if not exist "docs\completed\岩浆系统检查报告.md" move "岩浆系统检查报告.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 岩浆系统检查报告.md && set /a count+=1
if exist "布阵界面显示优化完成.md" if not exist "docs\completed\布阵界面显示优化完成.md" move "布阵界面显示优化完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 布阵界面显示优化完成.md && set /a count+=1
if exist "战场布局一致性验证.md" if not exist "docs\completed\战场布局一致性验证.md" move "战场布局一致性验证.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 战场布局一致性验证.md && set /a count+=1
if exist "战场布局调整完成.md" if not exist "docs\completed\战场布局调整完成.md" move "战场布局调整完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 战场布局调整完成.md && set /a count+=1
if exist "战场扩展和刺客瞬移实现完成.md" if not exist "docs\completed\战场扩展和刺客瞬移实现完成.md" move "战场扩展和刺客瞬移实现完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 战场扩展和刺客瞬移实现完成.md && set /a count+=1
if exist "战斗UI增强实施总结.md" if not exist "docs\completed\战斗UI增强实施总结.md" move "战斗UI增强实施总结.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 战斗UI增强实施总结.md && set /a count+=1
if exist "战斗场景UI优化完成.md" if not exist "docs\completed\战斗场景UI优化完成.md" move "战斗场景UI优化完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 战斗场景UI优化完成.md && set /a count+=1
if exist "战斗场景更新说明.md" if not exist "docs\completed\战斗场景更新说明.md" move "战斗场景更新说明.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 战斗场景更新说明.md && set /a count+=1
if exist "战斗日志优化完成.md" if not exist "docs\completed\战斗日志优化完成.md" move "战斗日志优化完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 战斗日志优化完成.md && set /a count+=1
if exist "战斗界面布局优化总结.md" if not exist "docs\completed\战斗界面布局优化总结.md" move "战斗界面布局优化总结.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 战斗界面布局优化总结.md && set /a count+=1
if exist "敌方布阵和行验证修复完成.md" if not exist "docs\completed\敌方布阵和行验证修复完成.md" move "敌方布阵和行验证修复完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 敌方布阵和行验证修复完成.md && set /a count+=1
if exist "敌方角色详情侧边栏实现完成.md" if not exist "docs\completed\敌方角色详情侧边栏实现完成.md" move "敌方角色详情侧边栏实现完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 敌方角色详情侧边栏实现完成.md && set /a count+=1
if exist "数值平衡完成总结.md" if not exist "docs\completed\数值平衡完成总结.md" move "数值平衡完成总结.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 数值平衡完成总结.md && set /a count+=1
if exist "新技能系统实现完成.md" if not exist "docs\completed\新技能系统实现完成.md" move "新技能系统实现完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 新技能系统实现完成.md && set /a count+=1
if exist "游戏节奏调整完成总结.md" if not exist "docs\completed\游戏节奏调整完成总结.md" move "游戏节奏调整完成总结.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 游戏节奏调整完成总结.md && set /a count+=1
if exist "火焰齐射技能平衡调整.md" if not exist "docs\completed\火焰齐射技能平衡调整.md" move "火焰齐射技能平衡调整.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 火焰齐射技能平衡调整.md && set /a count+=1
if exist "英雄系统扩展实施完成总结.md" if not exist "docs\completed\英雄系统扩展实施完成总结.md" move "英雄系统扩展实施完成总结.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 英雄系统扩展实施完成总结.md && set /a count+=1
if exist "角色放置问题修复完成.md" if not exist "docs\completed\角色放置问题修复完成.md" move "角色放置问题修复完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 角色放置问题修复完成.md && set /a count+=1
if exist "角色消失问题调试指南.md" if not exist "docs\completed\角色消失问题调试指南.md" move "角色消失问题调试指南.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 角色消失问题调试指南.md && set /a count+=1
if exist "冲刺技能伤害Bug修复完成.md" if not exist "docs\completed\冲刺技能伤害Bug修复完成.md" move "冲刺技能伤害Bug修复完成.md" "docs\completed\" >nul 2>&1 && echo   [MOVED] 冲刺技能伤害Bug修复完成.md && set /a count+=1

echo [14] Moving maintenance tools...
for %%F in (🔧*.txt 🔧*.bat) do (
    if exist "%%F" (
        if "%%F" NEQ "🔧一键整理项目目录.bat" (
            if not exist "scripts\maintenance\%%F" (
                move "%%F" "scripts\maintenance\" >nul 2>&1
                if !errorlevel! equ 0 (
                    echo   [MOVED] %%F
                    set /a count+=1
                )
            )
        )
    )
)

echo.
echo ===============================================
echo              Organization Complete!
echo ===============================================
echo Files moved: !count!
echo.
echo Project directory has been organized!
echo See: docs\design\📋项目目录管理规范.md
echo.
pause


