# AstroCade 游戏自动部署脚本
# 服务器: 43.173.170.5
# 用户: ubuntu
# 端口: 8888

$server = "43.173.170.5"
$username = "ubuntu"
$password = "MTc1MjA0NDQ0MQ"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AstroCade 游戏自动部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务器: $server" -ForegroundColor Green
Write-Host "用户: $username" -ForegroundColor Green
Write-Host "端口: 8888" -ForegroundColor Green
Write-Host ""

# 部署命令
$deployCommands = @"
cd /home/ubuntu && \
echo '开始部署...' && \
chmod +x 部署脚本.sh && \
echo '执行部署脚本...' && \
echo '$password' | sudo -S bash 部署脚本.sh && \
echo '开放防火墙端口...' && \
echo '$password' | sudo -S ufw allow 8888/tcp && \
echo '$password' | sudo -S ufw reload && \
echo '验证部署...' && \
echo '$password' | sudo -S systemctl status nginx --no-pager | head -n 10 && \
echo '$password' | sudo -S netstat -tlnp | grep :8888 && \
curl -I http://localhost:8888
"@

Write-Host "正在连接服务器并执行部署..." -ForegroundColor Yellow
Write-Host ""

# 使用 plink（如果已安装）
if (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Host "使用 plink 连接..." -ForegroundColor Yellow
    echo y | plink -ssh $username@$server -pw $password $deployCommands
} else {
    # 使用标准 SSH（需要手动输入密码）
    Write-Host "提示: 请在提示时输入密码: $password" -ForegroundColor Yellow
    Write-Host ""
    
    # 分步执行
    Write-Host "步骤 1: 验证文件..." -ForegroundColor Cyan
    ssh "$username@$server" "ls -la /home/ubuntu/ | grep -E 'dist|部署'"
    
    Write-Host ""
    Write-Host "步骤 2: 执行部署脚本..." -ForegroundColor Cyan
    ssh "$username@$server" "cd /home/ubuntu && chmod +x 部署脚本.sh && echo '$password' | sudo -S bash 部署脚本.sh"
    
    Write-Host ""
    Write-Host "步骤 3: 开放防火墙..." -ForegroundColor Cyan
    ssh "$username@$server" "echo '$password' | sudo -S ufw allow 8888/tcp && echo '$password' | sudo -S ufw reload"
    
    Write-Host ""
    Write-Host "步骤 4: 验证部署..." -ForegroundColor Cyan
    ssh "$username@$server" "echo '$password' | sudo -S systemctl status nginx --no-pager | head -n 10"
    ssh "$username@$server" "echo '$password' | sudo -S netstat -tlnp | grep :8888"
    ssh "$username@$server" "curl -I http://localhost:8888"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址: http://43.173.170.5:8888" -ForegroundColor Green
Write-Host ""
Write-Host "如果无法访问，请确保云服务器安全组已开放 8888 端口" -ForegroundColor Yellow
Write-Host ""

Read-Host "按任意键退出"

