#!/bin/bash

# 服务器部署脚本
# 用途：自动化部署项目到远程服务器

echo "========================================="
echo "🚀 开始部署项目到服务器"
echo "========================================="

# 服务器信息
SERVER_IP="43.173.170.5"
SERVER_USER="ubuntu"
REMOTE_DIR="/var/www/ai-dungeon"
PROJECT_NAME="AI-Dungeon"

echo "📍 服务器地址: $SERVER_USER@$SERVER_IP"
echo "📁 部署目录: $REMOTE_DIR"
echo ""

# 步骤1：连接服务器并检查环境
echo "🔍 步骤1: 检查服务器环境..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
  echo "✅ SSH连接成功"
  
  # 检查Node.js
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js已安装: $NODE_VERSION"
  else
    echo "❌ Node.js未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
  
  # 检查npm
  if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm已安装: $NPM_VERSION"
  else
    echo "❌ npm未安装"
  fi
  
  # 检查git
  if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Git已安装: $GIT_VERSION"
  else
    echo "❌ Git未安装，正在安装..."
    sudo apt-get update
    sudo apt-get install -y git
  fi
  
  # 检查nginx
  if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1)
    echo "✅ Nginx已安装: $NGINX_VERSION"
  else
    echo "❌ Nginx未安装，正在安装..."
    sudo apt-get update
    sudo apt-get install -y nginx
  fi
ENDSSH

echo ""
echo "🔄 步骤2: 克隆/更新项目..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
  # 创建部署目录
  sudo mkdir -p $REMOTE_DIR
  sudo chown -R $SERVER_USER:$SERVER_USER $REMOTE_DIR
  
  # 克隆或更新项目
  if [ -d "$REMOTE_DIR/.git" ]; then
    echo "📥 更新现有项目..."
    cd $REMOTE_DIR
    git pull origin main
  else
    echo "📥 克隆新项目..."
    git clone https://github.com/EthanJ-Sss/AI-Dungeon.git $REMOTE_DIR
  fi
  
  echo "✅ 项目代码已更新"
ENDSSH

echo ""
echo "📦 步骤3: 进入项目目录并安装依赖..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
  cd $REMOTE_DIR/astrocade
  echo "📦 安装依赖..."
  npm install
  echo "✅ 依赖安装完成"
ENDSSH

echo ""
echo "🏗️ 步骤4: 构建项目..."
ssh $SERVER_USER@$SERVER_IP << ENDSSH
  cd $REMOTE_DIR/astrocade
  echo "🏗️ 开始构建..."
  npm run build
  echo "✅ 项目构建完成"
ENDSSH

echo ""
echo "🌐 步骤5: 配置Nginx..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
  # 创建Nginx配置
  sudo tee /etc/nginx/sites-available/ai-dungeon > /dev/null << 'EOF'
server {
    listen 80;
    server_name 43.173.170.5;
    
    root /var/www/ai-dungeon/astrocade/dist;
    index index.html;
    
    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 日志
    access_log /var/log/nginx/ai-dungeon-access.log;
    error_log /var/log/nginx/ai-dungeon-error.log;
}
EOF
  
  # 启用站点
  sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/
  
  # 删除默认站点（如果存在）
  sudo rm -f /etc/nginx/sites-enabled/default
  
  # 测试Nginx配置
  sudo nginx -t
  
  # 重启Nginx
  sudo systemctl restart nginx
  sudo systemctl enable nginx
  
  echo "✅ Nginx配置完成"
ENDSSH

echo ""
echo "🔥 步骤6: 配置防火墙..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
  # 允许HTTP和HTTPS
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow 22/tcp
  
  echo "✅ 防火墙配置完成"
ENDSSH

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "🌐 访问地址: http://43.173.170.5"
echo ""
echo "📋 常用命令："
echo "  查看Nginx状态: sudo systemctl status nginx"
echo "  重启Nginx: sudo systemctl restart nginx"
echo "  查看日志: sudo tail -f /var/log/nginx/ai-dungeon-access.log"
echo ""
echo "⚠️ 重要提示："
echo "  1. 建议配置域名和HTTPS证书（使用Let's Encrypt）"
echo "  2. 立即修改服务器密码"
echo "  3. 配置SSH密钥认证"
echo ""



