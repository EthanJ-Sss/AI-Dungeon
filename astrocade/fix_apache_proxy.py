#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复Apache2反向代理配置
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

def fix_apache():
    """修复Apache配置"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [修复] Apache反向代理")
    print("="*60)
    
    # 修复后的Apache配置
    apache_config = """<VirtualHost *:8080>
    DocumentRoot /var/www/html
    
    # API代理 - 必须在 Directory 配置之前
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
    
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA路由支持
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/api
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
        
        # 写入新配置
        print("\n[1] 更新Apache配置...")
        
        sftp = ssh.open_sftp()
        temp_config = '/tmp/game_fixed.conf'
        with sftp.file(temp_config, 'w') as f:
            f.write(apache_config)
        sftp.close()
        
        stdin, stdout, stderr = ssh.exec_command(f'sudo mv {temp_config} /etc/apache2/sites-available/game.conf')
        stdout.channel.recv_exit_status()
        
        print("    [OK] 配置已更新")
        
        # 测试配置
        print("\n[2] 测试配置...")
        stdin, stdout, stderr = ssh.exec_command('sudo apache2ctl configtest 2>&1')
        test_output = stdout.read().decode()
        print(f"    {test_output.strip()[-50:]}")
        
        # 重新加载Apache
        print("\n[3] 重新加载Apache...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl reload apache2')
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("    [OK] Apache已重新加载")
        else:
            print("    [WARN] 重新加载失败，尝试重启...")
            stdin, stdout, stderr = ssh.exec_command('sudo systemctl restart apache2')
            stdout.channel.recv_exit_status()
            print("    [OK] Apache已重启")
        
        import time
        time.sleep(2)
        
        # 测试API代理
        print("\n[4] 测试API代理...")
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:8080/api/health')
        api_response = stdout.read().decode()
        print(f"    响应: {api_response[:200]}")
        
        if api_response and 'ok' in api_response.lower() and '{' in api_response:
            print("    [OK] API代理工作正常！")
            success = True
        else:
            print("    [WARN] API代理仍有问题")
            
            # 检查代理日志
            print("\n[5] 检查错误日志...")
            stdin, stdout, stderr = ssh.exec_command('sudo tail -20 /var/log/apache2/game_error.log 2>/dev/null || sudo tail -20 /var/log/apache2/error.log')
            log = stdout.read().decode()
            for line in log.split('\n')[-10:]:
                if line.strip():
                    print(f"    {line}")
            
            success = False
        
        ssh.close()
        
        print("\n" + "="*60)
        if success:
            print("  [SUCCESS] API代理修复完成！")
        else:
            print("  [WARN] 仍需要进一步检查")
        print("="*60)
        print("\n测试命令:")
        print("  curl http://43.173.170.5:8080/api/health")
        print()
        
        return success
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = fix_apache()
    sys.exit(0 if success else 1)

