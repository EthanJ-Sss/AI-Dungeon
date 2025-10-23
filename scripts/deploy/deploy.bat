@echo off
chcp 65001 >nul
cls
echo ========================================
echo AstroCade Game Deployment
echo ========================================
echo.
echo Server: 43.173.170.5:8888
echo User: ubuntu
echo.

echo [1/5] Executing deployment script...
ssh ubuntu@43.173.170.5 "cd /home/ubuntu && chmod +x 部署脚本.sh && echo 'MTc1MjA0NDQ0MQ' | sudo -S bash 部署脚本.sh"

echo.
echo [2/5] Opening firewall port...
ssh ubuntu@43.173.170.5 "echo 'MTc1MjA0NDQ0MQ' | sudo -S ufw allow 8888/tcp 2>/dev/null; echo 'MTc1MjA0NDQ0MQ' | sudo -S ufw reload 2>/dev/null || echo 'Firewall not active or already configured'"

echo.
echo [3/5] Checking Nginx status...
ssh ubuntu@43.173.170.5 "echo 'MTc1MjA0NDQ0MQ' | sudo -S systemctl status nginx --no-pager | head -n 5"

echo.
echo [4/5] Checking port 8888...
ssh ubuntu@43.173.170.5 "echo 'MTc1MjA0NDQ0MQ' | sudo -S netstat -tlnp 2>/dev/null | grep :8888 || echo 'MTc1MjA0NDQ0MQ' | sudo -S ss -tlnp 2>/dev/null | grep :8888"

echo.
echo [5/5] Testing local access...
ssh ubuntu@43.173.170.5 "curl -I http://localhost:8888 2>/dev/null | head -n 1"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Access URL: http://43.173.170.5:8888
echo.
echo Note: If you cannot access, please check cloud server security group settings
echo       to ensure port 8888 is open for inbound traffic
echo.

pause

