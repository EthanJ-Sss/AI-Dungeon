# 🚀 手动部署指南

## 服务器信息

- **IP地址**: 43.173.170.5
- **用户名**: ubuntu
- **SSH端口**: 22

## 部署步骤

### 1️⃣ 连接到服务器

**使用PuTTY（Windows）**:
1. 打开PuTTY
2. Host Name: `43.173.170.5`
3. Port: `22`
4. Connection type: SSH
5. 点击"Open"
6. 输入用户名: `ubuntu`
7. 输入密码

**使用SSH命令（Linux/Mac/Git Bash）**:
```bash
ssh ubuntu@43.173.170.5
```

---

### 2️⃣ 安装必要的软件

```bash
# 更新软件包列表
sudo apt-get update

# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v

# 安装Git
sudo apt-get install -y git

# 安装Nginx
sudo apt-get install -y nginx

# 验证Nginx
sudo systemctl status nginx
```

---

### 3️⃣ 克隆项目

```bash
# 创建部署目录
sudo mkdir -p /var/www/ai-dungeon
sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon

# 克隆项目
cd /var/www
git clone https://github.com/EthanJ-Sss/AI-Dungeon.git ai-dungeon

# 进入项目目录
cd ai-dungeon/astrocade
```

---

### 4️⃣ 安装依赖并构建

```bash
# 安装项目依赖
npm install

# 构建生产版本
npm run build

# 验证构建结果
ls -la dist/
```

---

### 5️⃣ 配置Nginx

```bash
# 创建Nginx配置文件
sudo nano /etc/nginx/sites-available/ai-dungeon
```

**粘贴以下配置**:

```nginx
server {
    listen 80;
    server_name 43.173.170.5;
    
    # 项目根目录
    root /var/www/ai-dungeon/astrocade/dist;
    index index.html;
    
    # 启用gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # 主要路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存（1年）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML文件不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # 日志文件
    access_log /var/log/nginx/ai-dungeon-access.log;
    error_log /var/log/nginx/ai-dungeon-error.log;
}
```

**保存并退出**:
- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

**启用站点**:
```bash
# 创建符号链接
sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/

# 删除默认站点
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

---

### 6️⃣ 配置防火墙

```bash
# 允许HTTP流量
sudo ufw allow 80/tcp

# 允许HTTPS流量（为将来准备）
sudo ufw allow 443/tcp

# 允许SSH（重要！）
sudo ufw allow 22/tcp

# 查看状态
sudo ufw status
```

---

### 7️⃣ 验证部署

打开浏览器访问: **http://43.173.170.5**

你应该能看到游戏界面！

---

## 📊 常用管理命令

### Nginx管理

```bash
# 查看Nginx状态
sudo systemctl status nginx

# 启动Nginx
sudo systemctl start nginx

# 停止Nginx
sudo systemctl stop nginx

# 重启Nginx
sudo systemctl restart nginx

# 重新加载配置（无需重启）
sudo systemctl reload nginx

# 查看访问日志
sudo tail -f /var/log/nginx/ai-dungeon-access.log

# 查看错误日志
sudo tail -f /var/log/nginx/ai-dungeon-error.log
```

### 项目更新

```bash
# 进入项目目录
cd /var/www/ai-dungeon

# 拉取最新代码
git pull origin main

# 进入astrocade目录
cd astrocade

# 安装新依赖
npm install

# 重新构建
npm run build

# 重启Nginx
sudo systemctl restart nginx
```

### 查看系统资源

```bash
# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看进程
htop  # 或 top

# 查看端口占用
sudo netstat -tulpn | grep nginx
```

---

## 🔒 安全加固

### 1. 立即修改密码

```bash
# 修改当前用户密码
passwd

# 输入新密码（强密码！）
```

### 2. 配置SSH密钥认证

**在本地电脑（Windows）**:

```powershell
# 生成SSH密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh ubuntu@43.173.170.5 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**在服务器上**:

```bash
# 设置正确的权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# 禁用密码登录（可选，确保密钥能用后再做）
sudo nano /etc/ssh/sshd_config
# 找到并修改：PasswordAuthentication no

# 重启SSH服务
sudo systemctl restart sshd
```

### 3. 配置HTTPS（可选但推荐）

```bash
# 安装Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书（需要域名）
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## ❌ 故障排查

### 问题1: 无法访问网站

```bash
# 检查Nginx是否运行
sudo systemctl status nginx

# 检查端口是否开放
sudo netstat -tulpn | grep :80

# 检查防火墙
sudo ufw status

# 查看错误日志
sudo tail -100 /var/log/nginx/error.log
```

### 问题2: 页面显示不正常

```bash
# 检查dist目录是否存在
ls -la /var/www/ai-dungeon/astrocade/dist/

# 检查文件权限
sudo chown -R www-data:www-data /var/www/ai-dungeon/astrocade/dist/

# 检查Nginx配置
sudo nginx -t

# 清除浏览器缓存并刷新
```

### 问题3: 构建失败

```bash
# 检查Node.js版本
node -v  # 应该是 v18.x 或更高

# 清除缓存重新安装
cd /var/www/ai-dungeon/astrocade
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 更新日志

每次更新后记录：

```bash
# 在服务器上创建更新日志
echo "$(date): 项目初次部署" >> /var/www/ai-dungeon/deploy.log
```

---

## 🆘 紧急回滚

如果部署出问题，回滚到上一个版本：

```bash
cd /var/www/ai-dungeon
git log --oneline  # 查看提交历史
git reset --hard <commit-id>  # 回滚到指定版本
cd astrocade
npm install
npm run build
sudo systemctl restart nginx
```

---

## 📞 获取帮助

- GitHub仓库: https://github.com/EthanJ-Sss/AI-Dungeon
- Nginx文档: https://nginx.org/en/docs/
- Node.js文档: https://nodejs.org/docs/

---

**祝部署顺利！🎉**


