@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title 项目目录自动整理工具 v1.0

echo ===============================================
echo       项目目录自动整理工具 v1.0
echo ===============================================
echo.

:: 检查是否在正确的目录
if not exist "astrocade" (
    echo [错误] 请在项目根目录运行此脚本！
    echo 当前目录: %CD%
    pause
    exit /b 1
)

:: 使用批处理版本执行
echo [信息] 开始整理项目目录...
echo.

:: 统计变量
set /a moved=0
set /a skipped=0

:: 创建目录（如果不存在）
if not exist "docs\completed" mkdir "docs\completed"
if not exist "docs\testing" mkdir "docs\testing"
if not exist "docs\guides" mkdir "docs\guides"
if not exist "docs\design" mkdir "docs\design"
if not exist "docs\development" mkdir "docs\development"
if not exist "scripts\deploy" mkdir "scripts\deploy"
if not exist "scripts\dev" mkdir "scripts\dev"
if not exist "scripts\maintenance" mkdir "scripts\maintenance"

echo [第1步] 整理已完成功能文档...
echo ================================================
call :MoveFiles "✅*.md" "docs\completed"
call :MoveFiles "✅*.txt" "docs\completed"

echo.
echo [第2步] 整理测试文档...
echo ================================================
call :MoveFiles "🎯*.md" "docs\testing"
call :MoveFiles "🎯*.txt" "docs\testing"

echo.
echo [第3步] 整理使用指南...
echo ================================================
call :MoveFiles "⭐*.md" "docs\guides"
call :MoveFiles "⭐*.txt" "docs\guides"
call :MoveFiles "🎮*.txt" "docs\guides"

echo.
echo [第4步] 整理庆祝文档...
echo ================================================
call :MoveFiles "🎉*.md" "docs\completed"
call :MoveFiles "🎊*.txt" "docs\completed"

echo.
echo [第5步] 整理Bug文档...
echo ================================================
call :MoveFiles "🐛*.md" "docs\completed"

echo.
echo [第6步] 整理修复工具...
echo ================================================
call :MoveFiles "🔧*.txt" "scripts\maintenance"
call :MoveFiles "🔧*.bat" "scripts\maintenance"

echo.
echo [第7步] 整理指引文档...
echo ================================================
call :MoveFiles "👉*.txt" "docs\guides"
call :MoveFiles "👉*.md" "docs\guides"

echo.
echo [第8步] 整理数据分析...
echo ================================================
call :MoveFiles "📊*.md" "docs\design"

echo.
echo [9] 整理特定文档...
echo ================================================
if exist "FirstDesign.md" call :MoveFile "FirstDesign.md" "docs\design"
if exist "volcano-design-summary.md" call :MoveFile "volcano-design-summary.md" "docs\design"
if exist "volcano-level-design.md" call :MoveFile "volcano-level-design.md" "docs\design"
if exist "volcano-skill-design.md" call :MoveFile "volcano-skill-design.md" "docs\design"
if exist "火山关卡敌方阵容设计.md" call :MoveFile "火山关卡敌方阵容设计.md" "docs\design"
if exist "战斗系统规则文档.md" call :MoveFile "战斗系统规则文档.md" "docs\design"
if exist "游戏内容大扩展设计文档.md" call :MoveFile "游戏内容大扩展设计文档.md" "docs\design"
if exist "游戏内容扩展设计文档-精简版.md" call :MoveFile "游戏内容扩展设计文档-精简版.md" "docs\design"
if exist "道具系统设计文档-招募券.md" call :MoveFile "道具系统设计文档-招募券.md" "docs\design"
if exist "英雄系统重构说明.md" call :MoveFile "英雄系统重构说明.md" "docs\design"
if exist "设计简化总结.md" call :MoveFile "设计简化总结.md" "docs\design"
if exist "数值平衡分析.md" call :MoveFile "数值平衡分析.md" "docs\design"
if exist "游戏节奏调整方案.md" call :MoveFile "游戏节奏调整方案.md" "docs\design"

echo.
echo [10] 整理开发文档...
echo ================================================
if exist "开发计划.md" call :MoveFile "开发计划.md" "docs\development"
if exist "TodoList.md" call :MoveFile "TodoList.md" "docs\development"
if exist "当前开发进度.md" call :MoveFile "当前开发进度.md" "docs\development"
if exist "Sprint2技能系统开发进度.md" call :MoveFile "Sprint2技能系统开发进度.md" "docs\development"
if exist "VOLCANO_IMPLEMENTATION_SUMMARY.md" call :MoveFile "VOLCANO_IMPLEMENTATION_SUMMARY.md" "docs\development"

echo.
echo [11] 整理部署脚本...
echo ================================================
if exist "deploy.bat" call :MoveFile "deploy.bat" "scripts\deploy"
if exist "部署脚本.sh" call :MoveFile "部署脚本.sh" "scripts\deploy"
if exist "自动部署.ps1" call :MoveFile "自动部署.ps1" "scripts\deploy"
if exist "一键部署.bat" call :MoveFile "一键部署.bat" "scripts\deploy"
if exist "一键部署命令.bat" call :MoveFile "一键部署命令.bat" "scripts\deploy"
if exist "手动部署命令.txt" call :MoveFile "手动部署命令.txt" "scripts\deploy"
if exist "服务器执行命令.txt" call :MoveFile "服务器执行命令.txt" "scripts\deploy"
if exist "部署说明.md" call :MoveFile "部署说明.md" "scripts\deploy"

echo.
echo [12] 整理开发脚本...
echo ================================================
if exist "启动开发服务器.bat" call :MoveFile "启动开发服务器.bat" "scripts\dev"
if exist "一键启动游戏.bat" call :MoveFile "一键启动游戏.bat" "scripts\dev"
if exist "快速启动游戏.bat" call :MoveFile "快速启动游戏.bat" "scripts\dev"
if exist "一键修复并启动.bat" call :MoveFile "一键修复并启动.bat" "scripts\dev"

echo.
echo [13] 整理维护脚本...
echo ================================================
if exist "完全清理并重装.bat" call :MoveFile "完全清理并重装.bat" "scripts\maintenance"

echo.
echo [14] 整理使用指南文档...
echo ================================================
if exist "README使用说明.md" call :MoveFile "README使用说明.md" "docs\guides"
if exist "Web项目启动指南.md" call :MoveFile "Web项目启动指南.md" "docs\guides"
if exist "启动游戏.md" call :MoveFile "启动游戏.md" "docs\guides"
if exist "常见问题解决.md" call :MoveFile "常见问题解决.md" "docs\guides"
if exist "项目交付说明.md" call :MoveFile "项目交付说明.md" "docs\guides"
if exist "更新日志.md" call :MoveFile "更新日志.md" "docs\guides"

echo.
echo [15] 整理已完成的总结文档...
echo ================================================
if exist "Bug修复记录.md" call :MoveFile "Bug修复记录.md" "docs\completed"
if exist "技能系统测试文档.md" call :MoveFile "技能系统测试文档.md" "docs\completed"
if exist "岩浆系统检查报告.md" call :MoveFile "岩浆系统检查报告.md" "docs\completed"
if exist "布阵界面显示优化完成.md" call :MoveFile "布阵界面显示优化完成.md" "docs\completed"
if exist "战场布局一致性验证.md" call :MoveFile "战场布局一致性验证.md" "docs\completed"
if exist "战场布局调整完成.md" call :MoveFile "战场布局调整完成.md" "docs\completed"
if exist "战场扩展和刺客瞬移实现完成.md" call :MoveFile "战场扩展和刺客瞬移实现完成.md" "docs\completed"
if exist "战斗UI增强实施总结.md" call :MoveFile "战斗UI增强实施总结.md" "docs\completed"
if exist "战斗场景UI优化完成.md" call :MoveFile "战斗场景UI优化完成.md" "docs\completed"
if exist "战斗场景更新说明.md" call :MoveFile "战斗场景更新说明.md" "docs\completed"
if exist "战斗日志优化完成.md" call :MoveFile "战斗日志优化完成.md" "docs\completed"
if exist "战斗界面布局优化总结.md" call :MoveFile "战斗界面布局优化总结.md" "docs\completed"
if exist "敌方布阵和行验证修复完成.md" call :MoveFile "敌方布阵和行验证修复完成.md" "docs\completed"
if exist "敌方角色详情侧边栏实现完成.md" call :MoveFile "敌方角色详情侧边栏实现完成.md" "docs\completed"
if exist "数值平衡完成总结.md" call :MoveFile "数值平衡完成总结.md" "docs\completed"
if exist "新技能系统实现完成.md" call :MoveFile "新技能系统实现完成.md" "docs\completed"
if exist "游戏节奏调整完成总结.md" call :MoveFile "游戏节奏调整完成总结.md" "docs\completed"
if exist "火焰齐射技能平衡调整.md" call :MoveFile "火焰齐射技能平衡调整.md" "docs\completed"
if exist "英雄系统扩展实施完成总结.md" call :MoveFile "英雄系统扩展实施完成总结.md" "docs\completed"
if exist "角色放置问题修复完成.md" call :MoveFile "角色放置问题修复完成.md" "docs\completed"
if exist "角色消失问题调试指南.md" call :MoveFile "角色消失问题调试指南.md" "docs\completed"
if exist "冲刺技能伤害Bug修复完成.md" call :MoveFile "冲刺技能伤害Bug修复完成.md" "docs\completed"

echo.
echo ===============================================
echo              整理完成！
echo ===============================================
echo 移动文件数: !moved!
echo 跳过文件数: !skipped!
echo.
echo 项目目录已整理完毕！
echo 请查看: 📋项目目录管理规范.md 了解目录结构
echo.
pause
exit /b 0

:: ==================== 函数定义 ====================

:MoveFiles
:: 移动匹配模式的所有文件
setlocal
set "pattern=%~1"
set "target=%~2"

for %%F in (%pattern%) do (
    if exist "%%F" (
        if exist "%target%\%%F" (
            echo   [跳过] %%F (已存在)
            set /a skipped+=1
        ) else (
            move "%%F" "%target%\" >nul 2>&1
            if errorlevel 0 (
                echo   [移动] %%F → %target%
                set /a moved+=1
            )
        )
    )
)
goto :eof

:MoveFile
:: 移动单个文件
setlocal
set "file=%~1"
set "target=%~2"

if exist "%file%" (
    if exist "%target%\%file%" (
        echo   [跳过] %file% (已存在)
        set /a skipped+=1
    ) else (
        move "%file%" "%target%\" >nul 2>&1
        if errorlevel 0 (
            echo   [移动] %file% → %target%
            set /a moved+=1
        )
    )
)
goto :eof

