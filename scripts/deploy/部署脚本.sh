#!/bin/bash

# AstroCade 游戏部署脚本
# 服务器: 43.173.170.5:8888
# 执行方式：将本脚本和 dist 文件夹上传到服务器，然后执行 bash 部署脚本.sh

echo "=========================================="
echo "AstroCade 游戏部署脚本"
echo "=========================================="

# 1. 创建部署目录
echo "步骤1: 创建部署目录..."
sudo mkdir -p /var/www/astrocade
sudo chown -R ubuntu:ubuntu /var/www/astrocade

# 2. 复制文件到部署目录
echo "步骤2: 复制构建文件..."
if [ -d "./dist" ]; then
    cp -r ./dist/* /var/www/astrocade/
    echo "文件复制成功！"
else
    echo "错误: 找不到 dist 目录，请确保 dist 文件夹与此脚本在同一目录"
    exit 1
fi

# 3. 创建 Nginx 配置
echo "步骤3: 配置 Nginx..."
sudo tee /etc/nginx/sites-available/astrocade > /dev/null <<'EOF'
server {
    listen 8888;
    server_name _;
    
    root /var/www/astrocade;
    index index.html;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# 4. 启用站点配置
echo "步骤4: 启用站点配置..."
sudo ln -sf /etc/nginx/sites-available/astrocade /etc/nginx/sites-enabled/astrocade

# 5. 测试 Nginx 配置
echo "步骤5: 测试 Nginx 配置..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "错误: Nginx 配置测试失败！"
    exit 1
fi

# 6. 重启 Nginx
echo "步骤6: 重启 Nginx 服务..."
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "Nginx 重启成功！"
else
    echo "错误: Nginx 重启失败！"
    exit 1
fi

# 7. 检查 Nginx 状态
echo "步骤7: 检查 Nginx 状态..."
sudo systemctl status nginx --no-pager | head -n 10

# 8. 检查端口监听
echo ""
echo "步骤8: 检查端口监听..."
sudo netstat -tlnp | grep :8888 || sudo ss -tlnp | grep :8888

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo "访问地址: http://43.173.170.5:8888"
echo ""
echo "如果无法访问，请检查："
echo "1. 防火墙是否开放 8888 端口"
echo "2. 云服务器安全组是否开放 8888 端口"
echo ""
echo "开放防火墙端口命令："
echo "  sudo ufw allow 8888/tcp"
echo "  sudo ufw reload"
echo ""

