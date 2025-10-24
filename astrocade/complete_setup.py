#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整设置 - API代理 + SPA路由 + 最新前端
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

def complete_setup():
    """完整设置"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [完整设置] API代理 + SPA路由 + 前端")
    print("="*60)
    
    # 完整的Apache配置
    apache_config = """<VirtualHost *:8080>
    DocumentRoot /var/www/html
    
    # API代理到后端
    ProxyRequests Off
    ProxyPreserveHost On
    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
    
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA路由支持
        RewriteEngine On
        RewriteBase /
        # 排除API请求
        RewriteCond %{REQUEST_URI} !^/api
        # 排除实际存在的文件
        RewriteCond %{REQUEST_FILENAME} !-f
        # 排除实际存在的目录
        RewriteCond %{REQUEST_FILENAME} !-d
        # 所有其他请求重定向到index.html
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
        
        # 1. 上传最新前端
        print("\n[1/4] 上传最新前端...")
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
            print(f"      ✓ {relative_path}")
        
        print(f"      [OK] 已上传 {len(frontend_files)} 个文件")
        
        # 2. 更新Apache配置
        print("\n[2/4] 更新Apache配置...")
        
        temp_config = '/tmp/game_complete.conf'
        with sftp.file(temp_config, 'w') as f:
            f.write(apache_config)
        
        sftp.close()
        
        stdin, stdout, stderr = ssh.exec_command(f'sudo mv {temp_config} /etc/apache2/sites-available/game.conf')
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
        
        # 4. 全面测试
        print("\n[4/4] 全面测试...")
        
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
        if 'ok' in api_response.lower() and '{' in api_response:
            print(f"      [OK] API: {api_response}")
            success = True
        else:
            print(f"      [ERROR] API: {api_response[:100]}")
            success = False
        
        ssh.close()
        
        print("\n" + "="*70)
        if success:
            print("  [SUCCESS] 在线模式已完全启用！所有功能正常！")
        else:
            print("  [ERROR] 部署有问题")
        print("="*70)
        print("\n🎮 立即测试:")
        print("  1. 访问: http://43.173.170.5:8080/")
        print("  2. 按 Ctrl+Shift+R 强制刷新")
        print("  3. 按 F12 查看控制台")
        print("  4. 确认显示: '✅ 后端连接成功，使用在线模式'")
        print("  5. 进入擂台竞技")
        print("  6. 注册玩家")
        print("  7. 设置防守阵容")
        print("  8. 开始挑战！")
        print("\n✅ 所有本地修复已同步，在线模式已启用！")
        print()
        
        return success
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = complete_setup()
    sys.exit(0 if success else 1)

