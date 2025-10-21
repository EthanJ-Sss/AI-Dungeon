# 🧹 快速清理缓存脚本
# 如果修复脚本无效，尝试这个完全清理方案

Write-Host "=====================================" -ForegroundColor Red
Write-Host "🧹 完全清理和重装" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  警告: 这将删除 node_modules 并重新安装依赖" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "确定要继续吗? (输入 yes 确认)"
if ($confirm -ne "yes") {
    Write-Host "❌ 已取消" -ForegroundColor Red
    exit 0
}

Set-Location astrocade

Write-Host ""
Write-Host "步骤 1/5: 删除 node_modules..." -ForegroundColor Green
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✅ node_modules 已删除" -ForegroundColor Green
}

Write-Host ""
Write-Host "步骤 2/5: 删除 package-lock.json..." -ForegroundColor Green
if (Test-Path "package-lock.json") {
    Remove-Item package-lock.json
    Write-Host "✅ package-lock.json 已删除" -ForegroundColor Green
}

Write-Host ""
Write-Host "步骤 3/5: 删除所有缓存文件..." -ForegroundColor Green
if (Test-Path ".vite") {
    Remove-Item -Recurse -Force .vite
}
if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
}
if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item tsconfig.tsbuildinfo
}
Write-Host "✅ 缓存已清除" -ForegroundColor Green

Write-Host ""
Write-Host "步骤 4/5: 重新安装依赖..." -ForegroundColor Green
Write-Host "(这可能需要几分钟...)" -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "步骤 5/5: 启动开发服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🚀 正在启动开发服务器..." -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

npm run dev

