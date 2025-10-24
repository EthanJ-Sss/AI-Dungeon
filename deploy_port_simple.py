#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple deployment to port 8080
"""

import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import paramiko

SERVER_IP = "43.173.170.5"
USERNAME = "ubuntu"
PASSWORD = "MTc1MjA0NDQ0MQ"
PORT = 8080

def run_command(ssh, command, desc, use_sudo=False):
    """Run command"""
    print(f"\n{desc}...")
    print("-" * 60)
    
    if use_sudo:
        # 使用echo和管道传递密码
        full_cmd = f"echo '{PASSWORD}' | sudo -S {command}"
    else:
        full_cmd = command
    
    try:
        stdin, stdout, stderr = ssh.exec_command(full_cmd, get_pty=True, timeout=60)
        
        output = stdout.read().decode('utf-8', errors='ignore')
        error = stderr.read().decode('utf-8', errors='ignore')
        exit_code = stdout.channel.recv_exit_status()
        
        # 打印重要输出
        for line in output.split('\n'):
            line = line.strip()
            if line and not line.startswith('[sudo]') and PASSWORD not in line:
                print(line)
        
        if exit_code != 0 and error:
            print(f"⚠️ Error output: {error[:200]}")
        
        print(f"{'✅' if exit_code == 0 else '⚠️'} {desc} - Exit code: {exit_code}")
        return exit_code
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

def main():
    print("\n" + "=" * 70)
    print(f"🚀 AI-Dungeon Deployment to Port {PORT}")
    print("=" * 70 + "\n")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"📡 Connecting to {USERNAME}@{SERVER_IP}...")
        ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
        print("✅ Connected!\n")
        
        # 步骤1: 检查构建目录
        run_command(ssh, "ls -la /var/www/ai-dungeon/astrocade/dist/", "Check build directory", False)
        
        # 步骤2: 创建Apache配置
        apache_config = f"""<VirtualHost *:{PORT}>
    ServerName 43.173.170.5
    DocumentRoot /var/www/ai-dungeon/astrocade/dist

    <Directory /var/www/ai-dungeon/astrocade/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\\.html$ - [L]
        RewriteCond %{{REQUEST_FILENAME}} !-f
        RewriteCond %{{REQUEST_FILENAME}} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog /var/log/apache2/ai-dungeon-error.log
    CustomLog /var/log/apache2/ai-dungeon-access.log combined
</VirtualHost>"""
        
        print(f"\n创建Apache配置文件...")
        print("-" * 60)
        config_cmd = f"cat > /tmp/ai-dungeon-{PORT}.conf << 'EOFCONFIG'\n{apache_config}\nEOFCONFIG"
        run_command(ssh, config_cmd, f"Create temp config file", False)
        run_command(ssh, f"cp /tmp/ai-dungeon-{PORT}.conf /etc/apache2/sites-available/", f"Copy config to Apache", True)
        
        # 步骤3: 添加端口监听
        run_command(ssh, f"grep -q 'Listen {PORT}' /etc/apache2/ports.conf || sed -i '/Listen 80/a Listen {PORT}' /etc/apache2/ports.conf", f"Add port {PORT} to Apache", True)
        
        # 步骤4: 启用必要模块
        run_command(ssh, "a2enmod rewrite", "Enable rewrite module", True)
        run_command(ssh, "a2enmod deflate", "Enable deflate module", True)
        
        # 步骤5: 启用站点
        run_command(ssh, f"a2ensite ai-dungeon-{PORT}.conf", "Enable site", True)
        
        # 步骤6: 测试配置
        run_command(ssh, "apache2ctl configtest", "Test Apache config", True)
        
        # 步骤7: 重启Apache
        run_command(ssh, "systemctl restart apache2", "Restart Apache", True)
        
        # 步骤8: 检查状态
        run_command(ssh, "systemctl status apache2 | head -5", "Check Apache status", True)
        
        # 步骤9: 开放防火墙
        run_command(ssh, f"ufw allow {PORT}/tcp || echo 'Firewall not active'", f"Open firewall port {PORT}", True)
        
        # 步骤10: 测试访问
        run_command(ssh, f"curl -I http://localhost:{PORT} 2>&1 | head -10", f"Test port {PORT}", False)
        
        print("\n" + "=" * 70)
        print("✅ Deployment Complete!")
        print("=" * 70)
        print(f"\n🌐 访问地址:")
        print(f"   http://43.173.170.5:{PORT}")
        print(f"\n📊 端口分配:")
        print(f"   80   端口: 原有项目")
        print(f"   {PORT} 端口: AI-Dungeon")
        print("\n" + "=" * 70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        ssh.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())



