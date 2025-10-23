@echo off
chcp 65001 >nul
cls
echo ========================================
echo AstroCade 游戏一键部署
echo ========================================
echo.
echo 服务器: 43.173.170.5:8888
echo 用户: ubuntu
echo 密码: MTc1MjA0NDQ0MQ
echo.
echo ========================================
echo.

echo [1/5] 验证文件...
ssh ubuntu@43.173.170.5 "ls -la /home/ubuntu/ | grep -E 'dist|部署'"
if %errorlevel% neq 0 (
    echo 连接失败或文件不存在！
    pause
    exit /b 1
)
echo ✓ 文件验证成功
echo.

echo [2/5] 执行部署脚本...
ssh ubuntu@43.173.170.5 "cd /home/ubuntu && chmod +x 部署脚本.sh && echo 'MTc1MjA0NDQ0MQ' | sudo -S bash 部署脚本.sh"
if %errorlevel% neq 0 (
    echo 部署脚本执行失败！
    pause
    exit /b 1
)
echo ✓ 部署脚本执行成功
echo.

echo [3/5] 开放防火墙端口...
ssh ubuntu@43.173.170.5 "echo 'MTc1MjA0NDQ0MQ' | sudo -S ufw allow 8888/tcp 2>/dev/null; echo 'MTc1MjA0NDQ0MQ' | sudo -S ufw reload 2>/dev/null"
echo ✓ 防火墙配置完成
echo.

echo [4/5] 验证 Nginx 状态...
ssh ubuntu@43.173.170.5 "echo 'MTc1MjA0NDQ0MQ' | sudo -S systemctl status nginx --no-pager | head -n 5"
echo.

echo [5/5] 检查端口监听...
ssh ubuntu@43.173.170.5 "echo 'MTc1MjA0NDQ0MQ' | sudo -S netstat -tlnp 2>/dev/null | grep :8888 || echo 'MTc1MjA0NDQ0MQ' | sudo -S ss -tlnp 2>/dev/null | grep :8888"
echo.

echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 访问地址: http://43.173.170.5:8888
echo.
echo 提示：
echo - 如果无法访问，请检查云服务器安全组是否开放 8888 端口
echo - 云服务器控制台 ^> 安全组 ^> 添加入站规则 ^> TCP 8888
echo.

pause

