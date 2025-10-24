#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试最简单的代理配置
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

def test_simple():
    """测试简单配置"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [测试] 最简单的代理配置")
    print("="*60)
    
    # 最简单的配置 - 先不管SPA路由
    apache_config = """<VirtualHost *:8080>
    DocumentRoot /var/www/html
    
    # API代理 - 注意结尾的斜杠
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
        AllowOverride None
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/game_error.log
    CustomLog ${APACHE_LOG_DIR}/game_access.log combined
</VirtualHost>"""
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 写入配置
        print("\n[1] 应用最简单的配置...")
        
        sftp = ssh.open_sftp()
        temp_config = '/tmp/game_simple.conf'
        with sftp.file(temp_config, 'w') as f:
            f.write(apache_config)
        sftp.close()
        
        stdin, stdout, stderr = ssh.exec_command(f'sudo mv {temp_config} /etc/apache2/sites-available/game.conf')
        stdout.channel.recv_exit_status()
        
        print("    [OK] 配置已更新")
        
        # 重启Apache
        print("\n[2] 重启Apache...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl restart apache2')
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("    [OK] Apache已重启")
        else:
            print("    [ERROR] Apache重启失败")
            return False
        
        import time
        time.sleep(2)
        
        # 测试API
        print("\n[3] 测试API代理...")
        stdin, stdout, stderr = ssh.exec_command('curl -v http://localhost:8080/api/health 2>&1 | grep -E "(< HTTP|status|ok)"')
        api_test = stdout.read().decode()
        print(f"    {api_test}")
        
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:8080/api/health')
        api_response = stdout.read().decode()
        print(f"    完整响应: {api_response[:200]}")
        
        if 'ok' in api_response.lower() and '{' in api_response:
            print("    [OK] API代理工作正常！")
            success = True
        else:
            print("    [ERROR] API代理仍然不工作")
            
            # 检查Apache配置
            print("\n[4] 检查生效的配置...")
            stdin, stdout, stderr = ssh.exec_command('sudo apachectl -S 2>&1 | grep -A 5 "port 8080"')
            config_info = stdout.read().decode()
            print(f"    {config_info}")
            
            # 检查是否有其他配置冲突
            print("\n[5] 检查所有启用的站点...")
            stdin, stdout, stderr = ssh.exec_command('ls -la /etc/apache2/sites-enabled/')
            sites = stdout.read().decode()
            print(f"    {sites}")
            
            success = False
        
        ssh.close()
        
        print("\n" + "="*60)
        if success:
            print("  [SUCCESS] API代理配置成功！")
        else:
            print("  [ERROR] 需要进一步诊断")
        print("="*60)
        print()
        
        return success
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_simple()
    sys.exit(0 if success else 1)

