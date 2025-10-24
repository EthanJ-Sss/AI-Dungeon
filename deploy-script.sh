#!/bin/bash
set -e

echo "========================================="
echo "🚀 AI-Dungeon 自动部署脚本"
echo "========================================="
echo ""

# 检查并安装Node.js
echo "🔍 步骤1: 检查Node.js..."
if ! command -v node &> /dev/null; then
    echo "📦 正在安装Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js已安装: $(node -v)"
fi

# 检查并安装Git
echo ""
echo "🔍 步骤2: 检查Git..."
if ! command -v git &> /dev/null; then
    echo "📦 正在安装Git..."
    sudo apt-get update
    sudo apt-get install -y git
else
    echo "✅ Git已安装"
fi

# 检查并安装Nginx
echo ""
echo "🔍 步骤3: 检查Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "📦 正在安装Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
else
    echo "✅ Nginx已安装"
fi

# 创建部署目录
echo ""
echo "📁 步骤4: 准备部署目录..."
sudo mkdir -p /var/www/ai-dungeon
sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon
echo "✅ 目录已准备"

# 克隆或更新项目
echo ""
echo "🔄 步骤5: 获取项目代码..."
if [ -d "/var/www/ai-dungeon/.git" ]; then
    echo "📥 更新现有项目..."
    cd /var/www/ai-dungeon
    git pull origin main
else
    echo "📥 克隆新项目..."
    git clone https://github.com/EthanJ-Sss/AI-Dungeon.git /var/www/ai-dungeon
    cd /var/www/ai-dungeon
fi
echo "✅ 代码获取完成"

# 安装依赖
echo ""
echo "📦 步骤6: 安装项目依赖..."
cd /var/www/ai-dungeon/astrocade
npm install --legacy-peer-deps
echo "✅ 依赖安装完成"

# 构建项目
echo ""
echo "🏗️ 步骤7: 构建生产版本..."
npm run build
echo "✅ 构建完成"

# 配置Nginx
echo ""
echo "🌐 步骤8: 配置Nginx..."
sudo tee /etc/nginx/sites-available/ai-dungeon > /dev/null << 'EOF'
server {
    listen 80;
    server_name 43.173.170.5;
    
    root /var/www/ai-dungeon/astrocade/dist;
    index index.html;
    
    # 启用gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript
               application/xml application/rss+xml
               font/truetype font/opentype 
               image/svg+xml;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    access_log /var/log/nginx/ai-dungeon-access.log;
    error_log /var/log/nginx/ai-dungeon-error.log;
}
EOF

sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
echo "✅ Nginx配置完成"

# 配置防火墙
echo ""
echo "🔥 步骤9: 配置防火墙..."
sudo ufw allow 80/tcp 2>&1 || true
sudo ufw allow 443/tcp 2>&1 || true
sudo ufw allow 22/tcp 2>&1 || true
echo "✅ 防火墙配置完成"

# 显示状态
echo ""
echo "========================================="
echo "✅ 部署成功完成！"
echo "========================================="
echo ""
echo "📊 服务状态："
echo "  Nginx: $(sudo systemctl is-active nginx)"
echo "  项目目录: /var/www/ai-dungeon"
echo "  构建目录: /var/www/ai-dungeon/astrocade/dist"
echo ""
echo "🌐 访问地址: http://43.173.170.5"
echo ""
echo "📋 常用命令："
echo "  查看访问日志: sudo tail -f /var/log/nginx/ai-dungeon-access.log"
echo "  查看错误日志: sudo tail -f /var/log/nginx/ai-dungeon-error.log"
echo "  重启Nginx: sudo systemctl restart nginx"
echo ""
echo "⚠️ 重要提醒："
echo "  1. 请立即修改服务器密码: passwd"
echo "  2. 建议配置SSH密钥认证"
echo ""


