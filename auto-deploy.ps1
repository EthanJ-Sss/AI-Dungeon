# PowerShell自动部署脚本
param(
    [string]$ServerIP = "43.173.170.5",
    [string]$Username = "ubuntu",
    [string]$Password = "MTc1MjA0NDQ0MQ"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 开始自动部署到服务器" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 服务器: $Username@$ServerIP" -ForegroundColor Yellow
Write-Host ""

# 读取部署脚本
$deployScript = Get-Content -Path "deploy-script.sh" -Raw

# 创建临时文件
$tempScript = Join-Path $env:TEMP "deploy-$(Get-Date -Format 'yyyyMMddHHmmss').sh"
$deployScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline

Write-Host "✅ 部署脚本已准备" -ForegroundColor Green
Write-Host ""
Write-Host "📤 正在连接服务器并上传脚本..." -ForegroundColor Cyan
Write-Host ""

# 方法1: 尝试直接SSH（可能已配置密钥）
Write-Host "🔍 尝试方法1: SSH密钥认证..." -ForegroundColor Yellow
$sshTest = ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no "$Username@$ServerIP" "echo 'SSH key auth successful'" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SSH密钥认证成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 上传部署脚本..." -ForegroundColor Cyan
    
    # 上传脚本
    scp -o StrictHostKeyChecking=no $tempScript "${Username}@${ServerIP}:/tmp/deploy.sh"
    
    # 执行部署
    Write-Host ""
    Write-Host "🚀 开始执行部署..." -ForegroundColor Cyan
    Write-Host ""
    ssh -o StrictHostKeyChecking=no "$Username@$ServerIP" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
    
} else {
    Write-Host "⚠️ SSH密钥认证未配置" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔍 尝试方法2: 密码认证..." -ForegroundColor Yellow
    Write-Host ""
    
    # 检查是否有sshpass或plink
    $hasSshpass = Get-Command sshpass -ErrorAction SilentlyContinue
    $hasPlink = Get-Command plink -ErrorAction SilentlyContinue
    
    if ($hasSshpass) {
        Write-Host "使用sshpass进行密码认证..." -ForegroundColor Cyan
        sshpass -p $Password scp -o StrictHostKeyChecking=no $tempScript "${Username}@${ServerIP}:/tmp/deploy.sh"
        sshpass -p $Password ssh -o StrictHostKeyChecking=no "$Username@$ServerIP" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
        
    } elseif ($hasPlink) {
        Write-Host "使用plink进行密码认证..." -ForegroundColor Cyan
        pscp -pw $Password -batch $tempScript "${Username}@${ServerIP}:/tmp/deploy.sh"
        plink -pw $Password -batch "$Username@$ServerIP" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
        
    } else {
        Write-Host "⚠️ 未找到自动密码输入工具" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "请选择以下方式之一：" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "方式A: 手动输入密码部署" -ForegroundColor White
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host "1. 运行以下命令上传脚本：" -ForegroundColor White
        Write-Host "   scp $tempScript ${Username}@${ServerIP}:/tmp/deploy.sh" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "2. 运行以下命令执行部署：" -ForegroundColor White
        Write-Host "   ssh ${Username}@${ServerIP}" -ForegroundColor Yellow
        Write-Host "   chmod +x /tmp/deploy.sh && /tmp/deploy.sh" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "密码: $Password" -ForegroundColor Red
        Write-Host ""
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host ""
        Write-Host "方式B: 复制命令到服务器执行" -ForegroundColor White
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host "1. SSH连接到服务器：" -ForegroundColor White
        Write-Host "   ssh ${Username}@${ServerIP}" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "2. 然后复制粘贴以下一键部署命令：" -ForegroundColor White
        Write-Host ""
        
        # 显示一键部署命令
        $oneLineCmd = @'
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs git nginx && sudo mkdir -p /var/www/ai-dungeon && sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon && if [ -d "/var/www/ai-dungeon/.git" ]; then cd /var/www/ai-dungeon && git pull origin main; else git clone https://github.com/EthanJ-Sss/AI-Dungeon.git /var/www/ai-dungeon; fi && cd /var/www/ai-dungeon/astrocade && npm install && npm run build && sudo tee /etc/nginx/sites-available/ai-dungeon > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name 43.173.170.5;
    root /var/www/ai-dungeon/astrocade/dist;
    index index.html;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { expires 1y; add_header Cache-Control "public, immutable"; }
}
NGINX_EOF
sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl restart nginx && sudo systemctl enable nginx && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && echo "✅ 部署完成！访问 http://43.173.170.5"
'@
        
        Write-Host $oneLineCmd -ForegroundColor Yellow
        Write-Host ""
        Write-Host "----------------------------------------" -ForegroundColor Gray
        Write-Host ""
        
        # 保存命令到文件
        $oneLineCmd | Out-File -FilePath "一键部署命令.txt" -Encoding UTF8
        Write-Host "✅ 一键部署命令已保存到: 一键部署命令.txt" -ForegroundColor Green
    }
}

# 清理临时文件
if (Test-Path $tempScript) {
    Remove-Item $tempScript -Force
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📋 部署完成检查" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 访问地址: http://43.173.170.5" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ 重要提醒：" -ForegroundColor Yellow
Write-Host "  1. 立即修改服务器密码" -ForegroundColor Red
Write-Host "  2. 配置SSH密钥认证" -ForegroundColor White
Write-Host ""


