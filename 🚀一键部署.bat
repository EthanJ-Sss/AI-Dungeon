@echo off
chcp 65001 >nul
echo =========================================
echo 🚀 AI-Dungeon 一键部署到服务器
echo =========================================
echo.

set SERVER=ubuntu@43.173.170.5

echo 📡 正在连接服务器...
echo.

REM 创建部署命令
echo 创建部署脚本...

ssh -o StrictHostKeyChecking=no %SERVER% "echo '🚀 开始自动部署...'; sudo apt-get update -qq; sudo apt-get install -y nodejs npm git nginx; echo '✅ 软件安装完成'; sudo mkdir -p /var/www/ai-dungeon; sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon; if [ -d /var/www/ai-dungeon/.git ]; then cd /var/www/ai-dungeon; git pull origin main; else cd /var/www; git clone https://github.com/EthanJ-Sss/AI-Dungeon.git ai-dungeon; fi; echo '✅ 代码已获取'; cd /var/www/ai-dungeon/astrocade; npm install --legacy-peer-deps; echo '✅ 依赖已安装'; npm run build; echo '✅ 项目已构建'; echo 'server { listen 80; server_name 43.173.170.5; root /var/www/ai-dungeon/astrocade/dist; index index.html; gzip on; location / { try_files \$uri \$uri/ /index.html; } }' | sudo tee /etc/nginx/sites-available/ai-dungeon; sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/; sudo rm -f /etc/nginx/sites-enabled/default; sudo nginx -t; sudo systemctl restart nginx; sudo systemctl enable nginx; echo ''; echo =========================================; echo '✅ 部署完成！'; echo =========================================; echo '🌐 访问地址: http://43.173.170.5'"

if %errorlevel% equ 0 (
    echo.
    echo =========================================
    echo ✅ 部署成功！
    echo =========================================
    echo.
    echo 🌐 访问地址: http://43.173.170.5
    echo.
) else (
    echo.
    echo ❌ 部署失败，请检查网络连接或服务器状态
    echo.
)

echo ⚠️ 重要: 请立即修改服务器密码！
echo.
pause


