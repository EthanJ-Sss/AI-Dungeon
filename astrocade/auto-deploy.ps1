# 自动部署脚本
$server = "43.173.170.5"
$username = "ubuntu"
$password = "MTc1MjA0NDQ0MQ"
$sourcePath = "dist/*"
$targetPath = "/var/www/html/"

Write-Host "正在部署到服务器..." -ForegroundColor Green
Write-Host "服务器: $username@$server" -ForegroundColor Yellow

# 使用 pscp (PuTTY的SCP工具)
$pscpPath = "pscp"
$scpCommand = "scp"

# 尝试使用 scp
$env:SSHPASS = $password
& scp -r -o StrictHostKeyChecking=no $sourcePath "${username}@${server}:${targetPath}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 部署成功!" -ForegroundColor Green
    Write-Host "访问: http://$server:8080/" -ForegroundColor Cyan
} else {
    Write-Host "正在尝试其他方法..." -ForegroundColor Yellow
    
    # 创建临时expect脚本
    $expectScript = @"
spawn scp -r dist/* ${username}@${server}:${targetPath}
expect "password:"
send "${password}\r"
expect eof
"@
    
    $expectScript | Out-File -FilePath "temp-deploy.exp" -Encoding ASCII
    
    if (Get-Command expect -ErrorAction SilentlyContinue) {
        expect temp-deploy.exp
        Remove-Item temp-deploy.exp
    } else {
        Write-Host "❌ 需要手动上传" -ForegroundColor Red
        Write-Host "服务器: $server" -ForegroundColor Yellow
        Write-Host "用户名: $username" -ForegroundColor Yellow
        Write-Host "密码: $password" -ForegroundColor Yellow
    }
}


