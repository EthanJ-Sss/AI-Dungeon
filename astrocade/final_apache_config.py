#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
最终Apache配置 - 确保API代理工作
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

def final_config():
    """最终配置"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [最终配置] Apache + 前端部署")
    print("="*60)
    
    # 最终的Apache配置
    apache_config = """<VirtualHost *:8080>
    DocumentRoot /var/www/html
    
    # 关键：ProxyPass 必须在 Directory 配置之外
    # 并且要排除静态文件
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
    
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA路由 - 只有非API且不存在的文件才重定向到index.html
        RewriteEngine On
        RewriteBase /
        RewriteCond %{REQUEST_URI} !^/api
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/game_error.log
    CustomLog ${APACHE_LOG_DIR}/game_access.log combined
</VirtualHost>"""
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 1. 上传前端文件
        print("\n[1/4] 上传前端文件...")
        sftp = ssh.open_sftp()
        
        frontend_path = os.path.join(os.path.dirname(__file__), 'dist')
        frontend_files = []
        for root, dirs, files in os.walk(frontend_path):
            for file in files:
                local_file = os.path.join(root, file)
                relative_path = os.path.relpath(local_file, frontend_path)
                remote_file = os.path.join('/var/www/html', relative_path).replace('\\', '/')
                frontend_files.append((local_file, remote_file, relative_path))
        
        for local_file, remote_file, relative_path in frontend_files:
            remote_dir = os.path.dirname(remote_file)
            try:
                sftp.stat(remote_dir)
            except:
                stdin, stdout, stderr = ssh.exec_command(f'mkdir -p {remote_dir}')
                stdout.channel.recv_exit_status()
            
            sftp.put(local_file, remote_file)
        
        print(f"      [OK] 已上传 {len(frontend_files)} 个文件")
        
        # 2. 写入Apache配置
        print("\n[2/4] 配置Apache...")
        
        temp_config = '/tmp/game_final.conf'
        with sftp.file(temp_config, 'w') as f:
            f.write(apache_config)
        
        sftp.close()
        
        stdin, stdout, stderr = ssh.exec_command(f'sudo mv {temp_config} /etc/apache2/sites-available/game.conf')
        stdout.channel.recv_exit_status()
        
        stdin, stdout, stderr = ssh.exec_command('sudo a2ensite game.conf')
        stdout.channel.recv_exit_status()
        
        print("      [OK] 配置已更新")
        
        # 3. 重启Apache
        print("\n[3/4] 重启Apache...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl restart apache2')
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("      [OK] Apache已重启")
        else:
            print("      [ERROR] Apache重启失败")
            return False
        
        import time
        time.sleep(2)
        
        # 4. 测试
        print("\n[4/4] 测试所有功能...")
        
        # 测试前端
        stdin, stdout, stderr = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/')
        http_code = stdout.read().decode().strip()
        if http_code == '200':
            print(f"      [OK] 前端: HTTP {http_code}")
        else:
            print(f"      [WARN] 前端: HTTP {http_code}")
        
        # 测试API
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:8080/api/health')
        api_response = stdout.read().decode()
        if api_response and 'ok' in api_response.lower() and '{' in api_response:
            print(f"      [OK] API代理: {api_response[:50]}")
            success = True
        else:
            print(f"      [ERROR] API代理失败: {api_response[:100]}")
            success = False
        
        ssh.close()
        
        print("\n" + "="*60)
        if success:
            print("  [SUCCESS] 部署完成！在线模式已启用！")
        else:
            print("  [ERROR] 部署完成但API代理有问题")
        print("="*60)
        print("\n访问地址:")
        print("  游戏: http://43.173.170.5:8080/")
        print("  API:  http://43.173.170.5:8080/api/health")
        print("\n重要：访问游戏后按 Ctrl+Shift+R 强制刷新！")
        print()
        
        return success
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = final_config()
    sys.exit(0 if success else 1)

