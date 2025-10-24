# 项目目录自动整理脚本
# 版本: 1.0
# 日期: 2025-10-22

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "      项目目录自动整理工具 v1.0" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "E:\circletest"
Set-Location $projectRoot

# 统计变量
$movedCount = 0
$skippedCount = 0

# 函数：移动文件
function Move-FileToDir {
    param(
        [string]$Pattern,
        [string]$TargetDir,
        [string]$Description
    )
    
    Write-Host "正在整理: $Description..." -ForegroundColor Yellow
    
    $files = Get-ChildItem -Path $projectRoot -Filter $Pattern -File -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $targetPath = Join-Path $TargetDir $file.Name
        
        if (Test-Path $targetPath) {
            Write-Host "  [跳过] $($file.Name) (已存在)" -ForegroundColor Gray
            $script:skippedCount++
        } else {
            Move-Item -Path $file.FullName -Destination $targetPath -Force
            Write-Host "  [移动] $($file.Name) → $TargetDir" -ForegroundColor Green
            $script:movedCount++
        }
    }
}

# 1. 整理已完成功能文档 (✅开头)
Write-Host "`n【第1步】整理已完成功能文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Move-FileToDir "✅*.md" "docs\completed" "已完成功能文档"
Move-FileToDir "✅*.txt" "docs\completed" "已完成功能文本"

# 2. 整理测试文档 (🎯开头)
Write-Host "`n【第2步】整理测试文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Move-FileToDir "🎯*.md" "docs\testing" "测试指南"
Move-FileToDir "🎯*.txt" "docs\testing" "测试文本"

# 3. 整理使用指南 (⭐🎮开头)
Write-Host "`n【第3步】整理使用指南" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Move-FileToDir "⭐*.md" "docs\guides" "启动指南"
Move-FileToDir "⭐*.txt" "docs\guides" "启动文本"
Move-FileToDir "🎮*.txt" "docs\guides" "游戏指南"

# 4. 整理庆祝文档 (🎉🎊开头)
Write-Host "`n【第4步】整理庆祝文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Move-FileToDir "🎉*.md" "docs\completed" "Sprint完成"
Move-FileToDir "🎊*.txt" "docs\completed" "里程碑完成"

# 5. 整理Bug文档 (🐛开头)
Write-Host "`n【第5步】整理Bug文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Move-FileToDir "🐛*.md" "docs\completed" "Bug修复文档"

# 6. 整理修复工具 (🔧开头)
Write-Host "`n【第6步】整理修复工具" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Move-FileToDir "🔧*.txt" "scripts\maintenance" "修复文本"
Move-FileToDir "🔧*.bat" "scripts\maintenance" "修复脚本"

# 7. 整理指引文档 (👉开头)
Write-Host "`n【第7步】整理指引文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Move-FileToDir "👉*.txt" "docs\guides" "指引文档"
Move-FileToDir "👉*.md" "docs\guides" "指引文档"

# 8. 整理数据分析 (📊开头)
Write-Host "`n【第8步】整理数据分析" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Move-FileToDir "📊*.md" "docs\design" "数据分析文档"

# 9. 整理设计文档
Write-Host "`n【第9步】整理设计文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
$designDocs = @(
    "FirstDesign.md",
    "volcano-design-summary.md",
    "volcano-level-design.md",
    "volcano-skill-design.md",
    "火山关卡敌方阵容设计.md",
    "战斗系统规则文档.md",
    "游戏内容大扩展设计文档.md",
    "游戏内容扩展设计文档-精简版.md",
    "道具系统设计文档-招募券.md",
    "英雄系统重构说明.md",
    "设计简化总结.md",
    "数值平衡分析.md",
    "游戏节奏调整方案.md"
)

foreach ($doc in $designDocs) {
    $sourcePath = Join-Path $projectRoot $doc
    if (Test-Path $sourcePath) {
        $targetPath = Join-Path "docs\design" $doc
        if (Test-Path $targetPath) {
            Write-Host "  [跳过] $doc (已存在)" -ForegroundColor Gray
            $skippedCount++
        } else {
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  [移动] $doc → docs\design" -ForegroundColor Green
            $movedCount++
        }
    }
}

# 10. 整理开发文档
Write-Host "`n【第10步】整理开发文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
$devDocs = @(
    "开发计划.md",
    "TodoList.md",
    "当前开发进度.md",
    "Sprint2技能系统开发进度.md",
    "VOLCANO_IMPLEMENTATION_SUMMARY.md"
)

foreach ($doc in $devDocs) {
    $sourcePath = Join-Path $projectRoot $doc
    if (Test-Path $sourcePath) {
        $targetPath = Join-Path "docs\development" $doc
        if (Test-Path $targetPath) {
            Write-Host "  [跳过] $doc (已存在)" -ForegroundColor Gray
            $skippedCount++
        } else {
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  [移动] $doc → docs\development" -ForegroundColor Green
            $movedCount++
        }
    }
}

# 11. 整理部署脚本
Write-Host "`n【第11步】整理部署脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
$deployScripts = @(
    "deploy.bat",
    "部署脚本.sh",
    "自动部署.ps1",
    "一键部署.bat",
    "一键部署命令.bat",
    "手动部署命令.txt",
    "服务器执行命令.txt",
    "部署说明.md"
)

foreach ($script in $deployScripts) {
    $sourcePath = Join-Path $projectRoot $script
    if (Test-Path $sourcePath) {
        $targetPath = Join-Path "scripts\deploy" $script
        if (Test-Path $targetPath) {
            Write-Host "  [跳过] $script (已存在)" -ForegroundColor Gray
            $skippedCount++
        } else {
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  [移动] $script → scripts\deploy" -ForegroundColor Green
            $movedCount++
        }
    }
}

# 12. 整理开发脚本
Write-Host "`n【第12步】整理开发脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
$devScripts = @(
    "启动开发服务器.bat",
    "一键启动游戏.bat",
    "快速启动游戏.bat",
    "一键修复并启动.bat"
)

foreach ($script in $devScripts) {
    $sourcePath = Join-Path $projectRoot $script
    if (Test-Path $sourcePath) {
        $targetPath = Join-Path "scripts\dev" $script
        if (Test-Path $targetPath) {
            Write-Host "  [跳过] $script (已存在)" -ForegroundColor Gray
            $skippedCount++
        } else {
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  [移动] $script → scripts\dev" -ForegroundColor Green
            $movedCount++
        }
    }
}

# 13. 整理维护脚本
Write-Host "`n【第13步】整理维护脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
$mainScripts = @(
    "完全清理并重装.bat"
)

foreach ($script in $mainScripts) {
    $sourcePath = Join-Path $projectRoot $script
    if (Test-Path $sourcePath) {
        $targetPath = Join-Path "scripts\maintenance" $script
        if (Test-Path $targetPath) {
            Write-Host "  [跳过] $script (已存在)" -ForegroundColor Gray
            $skippedCount++
        } else {
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  [移动] $script → scripts\maintenance" -ForegroundColor Green
            $movedCount++
        }
    }
}

# 14. 整理使用指南文档
Write-Host "`n【第14步】整理使用指南文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
$guideDocs = @(
    "README使用说明.md",
    "Web项目启动指南.md",
    "启动游戏.md",
    "常见问题解决.md",
    "项目交付说明.md",
    "更新日志.md"
)

foreach ($doc in $guideDocs) {
    $sourcePath = Join-Path $projectRoot $doc
    if (Test-Path $sourcePath) {
        $targetPath = Join-Path "docs\guides" $doc
        if (Test-Path $targetPath) {
            Write-Host "  [跳过] $doc (已存在)" -ForegroundColor Gray
            $skippedCount++
        } else {
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  [移动] $doc → docs\guides" -ForegroundColor Green
            $movedCount++
        }
    }
}

# 15. 整理已完成的总结文档
Write-Host "`n【第15步】整理已完成的总结文档" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
$completedDocs = @(
    "Bug修复记录.md",
    "技能系统测试文档.md",
    "岩浆系统检查报告.md",
    "布阵界面显示优化完成.md",
    "战场布局一致性验证.md",
    "战场布局调整完成.md",
    "战场扩展和刺客瞬移实现完成.md",
    "战斗UI增强实施总结.md",
    "战斗场景UI优化完成.md",
    "战斗场景更新说明.md",
    "战斗日志优化完成.md",
    "战斗界面布局优化总结.md",
    "敌方布阵和行验证修复完成.md",
    "敌方角色详情侧边栏实现完成.md",
    "数值平衡完成总结.md",
    "新技能系统实现完成.md",
    "游戏节奏调整完成总结.md",
    "火焰齐射技能平衡调整.md",
    "英雄系统扩展实施完成总结.md",
    "角色放置问题修复完成.md",
    "角色消失问题调试指南.md",
    "冲刺技能伤害Bug修复完成.md"
)

foreach ($doc in $completedDocs) {
    $sourcePath = Join-Path $projectRoot $doc
    if (Test-Path $sourcePath) {
        $targetPath = Join-Path "docs\completed" $doc
        if (Test-Path $targetPath) {
            Write-Host "  [跳过] $doc (已存在)" -ForegroundColor Gray
            $skippedCount++
        } else {
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "  [移动] $doc → docs\completed" -ForegroundColor Green
            $movedCount++
        }
    }
}

# 完成统计
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "              整理完成！" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "移动文件数: $movedCount" -ForegroundColor Green
Write-Host "跳过文件数: $skippedCount" -ForegroundColor Yellow
Write-Host "`n项目目录已整理完毕！" -ForegroundColor Green
Write-Host "请查看: 📋项目目录管理规范.md 了解目录结构" -ForegroundColor Cyan
Write-Host ""

# 暂停以便查看结果
Read-Host "按回车键退出"


