# 🔧 火山关卡一键修复和启动脚本
# 用法：在 PowerShell 中运行 .\fix-and-start.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🌋 火山关卡修复和启动脚本" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 进入 astrocade 目录
Set-Location astrocade

Write-Host "步骤 1/5: 清除 Vite 缓存..." -ForegroundColor Green
if (Test-Path ".vite") {
    Remove-Item -Recurse -Force .vite
    Write-Host "✅ Vite 缓存已清除" -ForegroundColor Green
} else {
    Write-Host "✅ 没有 Vite 缓存" -ForegroundColor Green
}

Write-Host ""
Write-Host "步骤 2/5: 清除 node_modules 缓存..." -ForegroundColor Green
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force node_modules\.vite
    Write-Host "✅ node_modules Vite 缓存已清除" -ForegroundColor Green
} else {
    Write-Host "✅ 没有 node_modules Vite 缓存" -ForegroundColor Green
}

Write-Host ""
Write-Host "步骤 3/5: 清除 TypeScript 构建缓存..." -ForegroundColor Green
if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item tsconfig.tsbuildinfo
    Write-Host "✅ TypeScript 构建缓存已清除" -ForegroundColor Green
}
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ node_modules 缓存已清除" -ForegroundColor Green
}

Write-Host ""
Write-Host "步骤 4/5: 验证类型文件..." -ForegroundColor Green
$typesFile = Get-Content "src/types/index.ts" -Raw
if ($typesFile -match "export type ElementType") {
    Write-Host "✅ ElementType 导出正常" -ForegroundColor Green
} else {
    Write-Host "❌ ElementType 导出异常！" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "步骤 5/5: 启动开发服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🚀 正在启动 Vite 开发服务器..." -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 启动后在浏览器中访问 http://localhost:5173/" -ForegroundColor Cyan
Write-Host "提示: 按 Ctrl+C 停止服务器" -ForegroundColor Cyan
Write-Host ""

# 启动开发服务器
npm run dev

