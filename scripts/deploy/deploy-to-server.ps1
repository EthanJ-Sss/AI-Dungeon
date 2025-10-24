# PowerShell 服务器部署脚本
# 用途：从Windows自动化部署项目到远程Linux服务器

$SERVER_IP = "43.173.170.5"
$SERVER_USER = "ubuntu"
$SERVER_PASSWORD = "MTc1MjA0NDQ0MQ"
$REMOTE_DIR = "/var/www/ai-dungeon"
$GITHUB_REPO = "https://github.com/EthanJ-Sss/AI-Dungeon.git"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 开始部署项目到服务器" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 服务器地址: $SERVER_USER@$SERVER_IP" -ForegroundColor Yellow
Write-Host "📁 部署目录: $REMOTE_DIR" -ForegroundColor Yellow
Write-Host ""

# 检查是否安装了plink（PuTTY）
Write-Host "🔍 检查部署工具..." -ForegroundColor Cyan
if (!(Get-Command plink -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到plink，请先安装PuTTY" -ForegroundColor Red
    Write-Host "下载地址: https://www.putty.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "或者使用以下方法之一：" -ForegroundColor Yellow
    Write-Host "  方法1: 使用Git Bash (推荐)" -ForegroundColor White
    Write-Host "  方法2: 使用WSL (Windows Subsystem for Linux)" -ForegroundColor White
    Write-Host "  方法3: 手动部署（参考deploy-manual.md）" -ForegroundColor White
    exit 1
}

Write-Host "✅ 部署工具已就绪" -ForegroundColor Green
Write-Host ""

# 创建临时部署脚本
$deployScript = @"
#!/bin/bash
set -e

echo '========================================='
echo '🚀 服务器端部署开始'
echo '========================================='

# 1. 检查并安装依赖
echo ''
echo '🔍 步骤1: 检查环境...'

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo '📦 安装Node.js...'
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo '✅ Node.js: '`node -v`

# 检查Git
if ! command -v git &> /dev/null; then
    echo '📦 安装Git...'
    sudo apt-get update
    sudo apt-get install -y git
fi
echo '✅ Git: '`git --version`

# 检查Nginx
if ! command -v nginx &> /dev/null; then
    echo '📦 安装Nginx...'
    sudo apt-get update
    sudo apt-get install -y nginx
fi
echo '✅ Nginx已安装'

# 2. 克隆/更新项目
echo ''
echo '🔄 步骤2: 获取项目代码...'
sudo mkdir -p $REMOTE_DIR
sudo chown -R ubuntu:ubuntu $REMOTE_DIR

if [ -d "$REMOTE_DIR/.git" ]; then
    echo '📥 更新现有项目...'
    cd $REMOTE_DIR
    git pull origin main
else
    echo '📥 克隆新项目...'
    git clone $GITHUB_REPO $REMOTE_DIR
fi
echo '✅ 项目代码已更新'

# 3. 安装依赖
echo ''
echo '📦 步骤3: 安装依赖...'
cd $REMOTE_DIR/astrocade
npm install
echo '✅ 依赖安装完成'

# 4. 构建项目
echo ''
echo '🏗️ 步骤4: 构建项目...'
npm run build
echo '✅ 项目构建完成'

# 5. 配置Nginx
echo ''
echo '🌐 步骤5: 配置Nginx...'
sudo tee /etc/nginx/sites-available/ai-dungeon > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name $SERVER_IP;
    
    root $REMOTE_DIR/astrocade/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    access_log /var/log/nginx/ai-dungeon-access.log;
    error_log /var/log/nginx/ai-dungeon-error.log;
}
NGINX_EOF

sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
echo '✅ Nginx配置完成'

# 6. 配置防火墙
echo ''
echo '🔥 步骤6: 配置防火墙...'
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true
echo '✅ 防火墙配置完成'

echo ''
echo '========================================='
echo '✅ 部署成功！'
echo '========================================='
echo ''
echo '🌐 访问地址: http://$SERVER_IP'
echo ''
"@

# 保存脚本到临时文件
$tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
$deployScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "📤 上传部署脚本到服务器..." -ForegroundColor Cyan

# 使用plink和pscp进行部署
try {
    # 上传脚本
    & pscp -pw $SERVER_PASSWORD $tempScript "${SERVER_USER}@${SERVER_IP}:/tmp/deploy.sh"
    
    # 执行部署脚本
    Write-Host ""
    Write-Host "🚀 执行部署脚本..." -ForegroundColor Cyan
    & plink -pw $SERVER_PASSWORD "${SERVER_USER}@${SERVER_IP}" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "✅ 部署完成！" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 访问地址: http://$SERVER_IP" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️ 重要提示：" -ForegroundColor Yellow
    Write-Host "  1. 立即修改服务器密码！" -ForegroundColor Red
    Write-Host "  2. 配置SSH密钥认证" -ForegroundColor White
    Write-Host "  3. 考虑配置域名和HTTPS" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ 部署失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请尝试以下方法：" -ForegroundColor Yellow
    Write-Host "  1. 使用Git Bash运行deploy-to-server.sh" -ForegroundColor White
    Write-Host "  2. 参考deploy-manual.md手动部署" -ForegroundColor White
    exit 1
} finally {
    # 清理临时文件
    if (Test-Path $tempScript) {
        Remove-Item $tempScript
    }
}


