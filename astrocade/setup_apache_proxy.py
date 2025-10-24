#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置Apache2反向代理
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

def setup_apache():
    """配置Apache2反向代理"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [配置] Apache2反向代理")
    print("="*60)
    
    # Apache配置
    apache_config = """<VirtualHost *:8080>
    DocumentRoot /var/www/html
    
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
    
    # API代理到后端
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
    
    # 错误日志
    ErrorLog ${APACHE_LOG_DIR}/game_error.log
    CustomLog ${APACHE_LOG_DIR}/game_access.log combined
</VirtualHost>"""
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 启用必要的Apache模块
        print("\n[1] 启用Apache模块...")
        modules = ['proxy', 'proxy_http', 'rewrite']
        for mod in modules:
            stdin, stdout, stderr = ssh.exec_command(f'sudo a2enmod {mod} 2>&1')
            output = stdout.read().decode()
            print(f"    {mod}: {output.strip()[:50]}")
        
        # 写入配置文件
        print("\n[2] 配置Apache...")
        
        sftp = ssh.open_sftp()
        temp_config = '/tmp/game.conf'
        with sftp.file(temp_config, 'w') as f:
            f.write(apache_config)
        sftp.close()
        
        # 移动到Apache配置目录
        stdin, stdout, stderr = ssh.exec_command(f'sudo mv {temp_config} /etc/apache2/sites-available/game.conf')
        stdout.channel.recv_exit_status()
        
        # 启用站点
        stdin, stdout, stderr = ssh.exec_command('sudo a2ensite game.conf')
        stdout.channel.recv_exit_status()
        
        # 禁用默认站点
        stdin, stdout, stderr = ssh.exec_command('sudo a2dissite 000-default.conf 2>/dev/null || true')
        stdout.channel.recv_exit_status()
        
        print("    [OK] 配置文件已创建")
        
        # 测试配置
        print("\n[3] 测试Apache配置...")
        stdin, stdout, stderr = ssh.exec_command('sudo apache2ctl configtest 2>&1')
        test_output = stdout.read().decode()
        print(f"    {test_output.strip()[-100:]}")
        
        # 重启Apache
        print("\n[4] 重启Apache...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl restart apache2')
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("    [OK] Apache已重启")
        else:
            print("    [ERROR] Apache重启失败")
            error_output = stderr.read().decode()
            print(f"    {error_output}")
            return False
        
        import time
        time.sleep(2)
        
        # 检查Apache状态
        print("\n[5] 检查Apache状态...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl is-active apache2')
        status = stdout.read().decode().strip()
        print(f"    状态: {status}")
        
        if status == 'active':
            print("    [OK] Apache运行中")
        
        # 测试API代理
        print("\n[6] 测试API代理...")
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:8080/api/health')
        api_response = stdout.read().decode()
        print(f"    响应: {api_response}")
        
        if api_response and 'ok' in api_response.lower():
            print("    [OK] API代理工作正常！")
            success = True
        else:
            print("    [WARN] API代理可能有问题")
            success = False
        
        ssh.close()
        
        print("\n" + "="*60)
        if success:
            print("  [SUCCESS] Apache代理配置完成！")
        else:
            print("  [WARN] 配置完成但需要验证")
        print("="*60)
        print("\n访问地址:")
        print("  前端: http://43.173.170.5:8080/")
        print("  API:  http://43.173.170.5:8080/api/health")
        print("\n现在前端可以通过 /api 访问后端！")
        print()
        
        return success
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = setup_apache()
    sys.exit(0 if success else 1)


