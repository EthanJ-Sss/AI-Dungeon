#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置Nginx反向代理
让前端通过 /api 路径访问后端
"""

import os
import sys
import io

# 设置UTF-8输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def install_paramiko():
    """安装paramiko库"""
    print("正在安装 paramiko 库...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "-q"])
    print("[OK] paramiko 安装完成")

def setup_nginx():
    """配置Nginx反向代理"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [配置] Nginx反向代理")
    print("="*60)
    
    # Nginx配置文件内容
    nginx_config = """server {
    listen 8080;
    server_name _;
    
    root /var/www/html;
    index index.html;
    
    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}"""
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 检查Nginx是否安装
        print("\n[1] 检查Nginx...")
        stdin, stdout, stderr = ssh.exec_command('which nginx')
        nginx_path = stdout.read().decode().strip()
        
        if not nginx_path:
            print("    [安装] 正在安装Nginx...")
            stdin, stdout, stderr = ssh.exec_command('sudo apt update && sudo apt install -y nginx')
            exit_status = stdout.channel.recv_exit_status()
            if exit_status == 0:
                print("    [OK] Nginx安装完成")
            else:
                print("    [ERROR] Nginx安装失败")
                return False
        else:
            print(f"    [OK] Nginx已安装: {nginx_path}")
        
        # 写入配置文件
        print("\n[2] 配置Nginx...")
        
        # 创建临时配置文件
        sftp = ssh.open_sftp()
        temp_config = '/tmp/game_nginx.conf'
        with sftp.file(temp_config, 'w') as f:
            f.write(nginx_config)
        sftp.close()
        
        # 移动到Nginx配置目录
        stdin, stdout, stderr = ssh.exec_command(f'sudo mv {temp_config} /etc/nginx/sites-available/game')
        stdout.channel.recv_exit_status()
        
        # 创建软链接
        stdin, stdout, stderr = ssh.exec_command('sudo ln -sf /etc/nginx/sites-available/game /etc/nginx/sites-enabled/game')
        stdout.channel.recv_exit_status()
        
        # 删除默认配置
        stdin, stdout, stderr = ssh.exec_command('sudo rm -f /etc/nginx/sites-enabled/default')
        stdout.channel.recv_exit_status()
        
        print("    [OK] 配置文件已创建")
        
        # 测试配置
        print("\n[3] 测试Nginx配置...")
        stdin, stdout, stderr = ssh.exec_command('sudo nginx -t')
        test_output = stdout.read().decode() + stderr.read().decode()
        print(f"    {test_output.strip()}")
        
        if 'successful' in test_output or 'ok' in test_output.lower():
            print("    [OK] 配置测试通过")
        else:
            print("    [ERROR] 配置测试失败")
            return False
        
        # 重启Nginx
        print("\n[4] 重启Nginx...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl restart nginx')
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("    [OK] Nginx已重启")
        else:
            print("    [ERROR] Nginx重启失败")
            error_output = stderr.read().decode()
            print(f"    {error_output}")
            return False
        
        # 检查Nginx状态
        print("\n[5] 检查Nginx状态...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl status nginx | head -10')
        status_output = stdout.read().decode()
        if 'active (running)' in status_output:
            print("    [OK] Nginx运行中")
        else:
            print("    [WARN] Nginx状态异常")
            print(status_output)
        
        ssh.close()
        
        print("\n" + "="*60)
        print("  [SUCCESS] Nginx配置完成！")
        print("="*60)
        print("\n配置说明:")
        print("  - 前端静态文件: http://43.173.170.5:8080/")
        print("  - API代理: http://43.173.170.5:8080/api/ -> localhost:3001/api/")
        print("\n现在前端可以通过相对路径 /api 访问后端！")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = setup_nginx()
    sys.exit(0 if success else 1)

