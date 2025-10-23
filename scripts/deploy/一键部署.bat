@echo off
chcp 65001 >nul
echo ========================================
echo AstroCade 游戏一键部署
echo ========================================
echo.
echo 服务器: 43.173.170.5:8888
echo 用户: ubuntu
echo.

echo 正在连接服务器并执行部署...
echo.
echo 请在提示时输入密码: MTc1MjA0NDQ0MQ
echo.

ssh ubuntu@43.173.170.5 "cd /home/ubuntu && chmod +x 部署脚本.sh && sudo bash 部署脚本.sh"

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo 部署完成！
    echo ========================================
    echo.
    echo 正在开放防火墙端口...
    ssh ubuntu@43.173.170.5 "sudo ufw allow 8888/tcp && sudo ufw reload"
    
    echo.
    echo 访问地址: http://43.173.170.5:8888
    echo.
    echo 如果无法访问，请确保云服务器安全组已开放 8888 端口
    echo.
) else (
    echo.
    echo 部署失败，请检查错误信息
    echo.
)

pause

