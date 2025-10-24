# 快速部署脚本
$ServerIP = "43.173.170.5"
$Username = "ubuntu"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 AI-Dungeon 快速部署" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 创建完整的一键部署命令（分成多行以便执行）
$deployCommands = @"
echo '开始部署...'
sudo apt-get update -y
sudo apt-get install -y nodejs npm git nginx
echo '✅ 基础软件已安装'

sudo mkdir -p /var/www/ai-dungeon
sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon

cd /var/www/ai-dungeon
if [ -d .git ]; then
  echo '更新项目...'
  git pull origin main
else
  echo '克隆项目...'
  cd /var/www
  git clone https://github.com/EthanJ-Sss/AI-Dungeon.git ai-dungeon
  cd ai-dungeon
fi
echo '✅ 代码已获取'

cd /var/www/ai-dungeon/astrocade
npm install --legacy-peer-deps
echo '✅ 依赖已安装'

npm run build
echo '✅ 构建完成'

sudo bash -c 'cat > /etc/nginx/sites-available/ai-dungeon << EOF
server {
    listen 80;
    server_name 43.173.170.5;
    root /var/www/ai-dungeon/astrocade/dist;
    index index.html;
    gzip on;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF'

sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ''
echo '========================================='
echo '✅ 部署完成！'
echo '========================================='
echo '🌐 访问: http://43.173.170.5'
"@

# 保存部署命令到临时文件
$tempFile = Join-Path $env:TEMP "deploy-commands.sh"
$deployCommands | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "📝 部署脚本已创建" -ForegroundColor Green
Write-Host "📤 正在连接服务器: $Username@$ServerIP" -ForegroundColor Cyan
Write-Host ""

try {
    # 测试连接
    Write-Host "🔍 测试SSH连接..." -ForegroundColor Yellow
    $testResult = ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$Username@$ServerIP" "echo 'Connected'"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 连接成功！" -ForegroundColor Green
        Write-Host ""
        
        # 上传脚本
        Write-Host "📤 上传部署脚本..." -ForegroundColor Cyan
        scp -o StrictHostKeyChecking=no $tempFile "${Username}@${ServerIP}:/tmp/deploy.sh"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 脚本上传成功" -ForegroundColor Green
            Write-Host ""
            Write-Host "🚀 开始执行部署（这可能需要5-10分钟）..." -ForegroundColor Cyan
            Write-Host "=========================================" -ForegroundColor Gray
            Write-Host ""
            
            # 执行部署
            ssh -o StrictHostKeyChecking=no "$Username@$ServerIP" "bash /tmp/deploy.sh"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "=========================================" -ForegroundColor Green
                Write-Host "✅ 部署成功完成！" -ForegroundColor Green
                Write-Host "=========================================" -ForegroundColor Green
                Write-Host ""
                Write-Host "🌐 访问地址: " -NoNewline
                Write-Host "http://43.173.170.5" -ForegroundColor Yellow
                Write-Host ""
            } else {
                Write-Host ""
                Write-Host "❌ 部署执行失败" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ 脚本上传失败" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 无法连接到服务器" -ForegroundColor Red
        Write-Host ""
        Write-Host "请尝试手动部署：" -ForegroundColor Yellow
        Write-Host "1. 运行命令: ssh $Username@$ServerIP" -ForegroundColor White
        Write-Host "2. 然后运行: " -ForegroundColor White
        Write-Host ""
        Write-Host "curl -sL https://raw.githubusercontent.com/EthanJ-Sss/AI-Dungeon/main/deploy.sh | bash" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ 发生错误: $_" -ForegroundColor Red
}

# 清理
if (Test-Path $tempFile) {
    Remove-Item $tempFile -Force
}

Write-Host ""
Write-Host "⚠️ 安全提醒: 请立即修改服务器密码！" -ForegroundColor Yellow
Write-Host ""


