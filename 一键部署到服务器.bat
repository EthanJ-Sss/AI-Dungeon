@echo off
chcp 65001 >nul
echo =========================================
echo 🚀 AI-Dungeon 一键部署脚本
echo =========================================
echo.
echo 📍 目标服务器: ubuntu@43.173.170.5
echo 📁 部署目录: /var/www/ai-dungeon
echo.
echo ⚠️ 安全提示：
echo    部署完成后请立即修改服务器密码！
echo.
pause

echo.
echo 📦 步骤1: 创建部署脚本...
echo.

:: 创建临时部署脚本
set DEPLOY_SCRIPT=%TEMP%\deploy-ai-dungeon.sh

(
echo #!/bin/bash
echo set -e
echo.
echo echo "========================================="
echo echo "🚀 服务器端部署开始"
echo echo "========================================="
echo echo ""
echo.
echo # 检查并安装Node.js
echo echo "🔍 检查Node.js..."
echo if ! command -v node ^&^> /dev/null; then
echo     echo "📦 安装Node.js..."
echo     curl -fsSL https://deb.nodesource.com/setup_18.x ^| sudo -E bash -
echo     sudo apt-get install -y nodejs
echo fi
echo echo "✅ Node.js: $(node -v)"
echo echo ""
echo.
echo # 检查并安装Git
echo echo "🔍 检查Git..."
echo if ! command -v git ^&^> /dev/null; then
echo     echo "📦 安装Git..."
echo     sudo apt-get update
echo     sudo apt-get install -y git
echo fi
echo echo "✅ Git已安装"
echo echo ""
echo.
echo # 检查并安装Nginx
echo echo "🔍 检查Nginx..."
echo if ! command -v nginx ^&^> /dev/null; then
echo     echo "📦 安装Nginx..."
echo     sudo apt-get update
echo     sudo apt-get install -y nginx
echo fi
echo echo "✅ Nginx已安装"
echo echo ""
echo.
echo # 创建部署目录
echo echo "📁 准备部署目录..."
echo sudo mkdir -p /var/www/ai-dungeon
echo sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon
echo.
echo # 克隆或更新项目
echo echo "🔄 获取项目代码..."
echo if [ -d "/var/www/ai-dungeon/.git" ]; then
echo     echo "📥 更新现有项目..."
echo     cd /var/www/ai-dungeon
echo     git pull origin main
echo else
echo     echo "📥 克隆新项目..."
echo     git clone https://github.com/EthanJ-Sss/AI-Dungeon.git /var/www/ai-dungeon
echo fi
echo echo "✅ 项目代码已更新"
echo echo ""
echo.
echo # 安装依赖
echo echo "📦 安装依赖..."
echo cd /var/www/ai-dungeon/astrocade
echo npm install
echo echo "✅ 依赖安装完成"
echo echo ""
echo.
echo # 构建项目
echo echo "🏗️ 构建项目..."
echo npm run build
echo echo "✅ 项目构建完成"
echo echo ""
echo.
echo # 配置Nginx
echo echo "🌐 配置Nginx..."
echo sudo tee /etc/nginx/sites-available/ai-dungeon ^> /dev/null ^<^< 'NGINX_EOF'
echo server {
echo     listen 80;
echo     server_name 43.173.170.5;
echo     root /var/www/ai-dungeon/astrocade/dist;
echo     index index.html;
echo     gzip on;
echo     gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
echo     location / {
echo         try_files $uri $uri/ /index.html;
echo     }
echo     location ~* \.\(js^|css^|png^|jpg^|jpeg^|gif^|ico^|svg^|woff^|woff2^|ttf^|eot\)$ {
echo         expires 1y;
echo         add_header Cache-Control "public, immutable";
echo     }
echo     access_log /var/log/nginx/ai-dungeon-access.log;
echo     error_log /var/log/nginx/ai-dungeon-error.log;
echo }
echo NGINX_EOF
echo.
echo sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/
echo sudo rm -f /etc/nginx/sites-enabled/default
echo sudo nginx -t
echo sudo systemctl restart nginx
echo sudo systemctl enable nginx
echo echo "✅ Nginx配置完成"
echo echo ""
echo.
echo # 配置防火墙
echo echo "🔥 配置防火墙..."
echo sudo ufw allow 80/tcp 2^>^&1 ^|^| true
echo sudo ufw allow 443/tcp 2^>^&1 ^|^| true
echo echo "✅ 防火墙配置完成"
echo echo ""
echo.
echo echo "========================================="
echo echo "✅ 部署成功！"
echo echo "========================================="
echo echo ""
echo echo "🌐 访问地址: http://43.173.170.5"
echo echo ""
) > "%DEPLOY_SCRIPT%"

echo ✅ 部署脚本已创建
echo.
echo 📤 步骤2: 上传并执行部署脚本...
echo.
echo 请输入服务器密码: MTc1MjA0NDQ0MQ
echo.

:: 使用SSH上传并执行脚本
scp "%DEPLOY_SCRIPT%" ubuntu@43.173.170.5:/tmp/deploy.sh
ssh ubuntu@43.173.170.5 "chmod +x /tmp/deploy.sh && /tmp/deploy.sh"

:: 清理临时文件
del "%DEPLOY_SCRIPT%" 2>nul

echo.
echo =========================================
echo ✅ 部署完成！
echo =========================================
echo.
echo 🌐 访问地址: http://43.173.170.5
echo.
echo ⚠️ 重要提示：
echo    1. 立即修改服务器密码
echo    2. 配置SSH密钥认证
echo    3. 考虑配置域名和HTTPS
echo.
echo 📋 查看手动部署指南: scripts\deploy\deploy-manual.md
echo.
pause


