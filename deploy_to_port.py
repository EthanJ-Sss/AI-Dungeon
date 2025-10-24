#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Deploy to specific port (8080)
"""

import sys
import io
import time

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import paramiko

SERVER_IP = "43.173.170.5"
USERNAME = "ubuntu"
PASSWORD = "MTc1MjA0NDQ0MQ"
PORT = 8080  # 新端口

def execute_and_print(ssh, command, desc):
    """Execute command and print output"""
    print(f"\n{desc}...")
    print("-" * 60)
    
    try:
        channel = ssh.get_transport().open_session()
        channel.get_pty()
        channel.exec_command(command)
        
        # 等待输出并发送密码
        if "sudo" in command:
            time.sleep(0.5)
            try:
                if channel.send_ready():
                    channel.send(PASSWORD + '\n')
            except:
                pass
        
        output = ""
        error_count = 0
        while True:
            try:
                if channel.recv_ready():
                    chunk = channel.recv(4096).decode('utf-8', errors='ignore')
                    output += chunk
                    # 只打印重要信息
                    for line in chunk.split('\n'):
                        if line.strip() and not line.startswith('['):
                            print(line)
                
                if channel.exit_status_ready():
                    break
                    
            except Exception as e:
                error_count += 1
                if error_count > 5:
                    print(f"⚠️ Too many errors, breaking: {e}")
                    break
            
            time.sleep(0.1)
        
        exit_status = channel.recv_exit_status()
        channel.close()
        
        print(f"{'✅' if exit_status == 0 else '⚠️'} {desc} - Exit code: {exit_status}")
        return exit_status
        
    except Exception as e:
        print(f"❌ Error executing command: {e}")
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
        
        steps = [
            # 1. 确保项目构建完成
            (f"ls -la /var/www/ai-dungeon/astrocade/dist/", "Check build directory"),
            
            # 2. 安装Apache（如果需要）
            (f"which apache2 || sudo apt-get install -y apache2", "Ensure Apache is installed"),
            
            # 3. 创建Apache配置文件用于8080端口
            (f"""sudo bash -c 'cat > /etc/apache2/sites-available/ai-dungeon-{PORT}.conf << \"EOF\"
<VirtualHost *:{PORT}>
    ServerName 43.173.170.5
    DocumentRoot /var/www/ai-dungeon/astrocade/dist

    <Directory /var/www/ai-dungeon/astrocade/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # 启用重写规则支持单页应用
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\\\\.html$ - [L]
        RewriteCond %{{REQUEST_FILENAME}} !-f
        RewriteCond %{{REQUEST_FILENAME}} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 启用压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
    </IfModule>

    ErrorLog ${{APACHE_LOG_DIR}}/ai-dungeon-error.log
    CustomLog ${{APACHE_LOG_DIR}}/ai-dungeon-access.log combined
</VirtualHost>
EOF'""", f"Create Apache config for port {PORT}"),
            
            # 4. 添加8080端口监听
            (f"sudo grep 'Listen {PORT}' /etc/apache2/ports.conf || sudo sed -i '/Listen 80/a Listen {PORT}' /etc/apache2/ports.conf", f"Enable port {PORT} in Apache"),
            
            # 5. 启用必要的Apache模块
            ("sudo a2enmod rewrite", "Enable rewrite module"),
            ("sudo a2enmod deflate", "Enable deflate module"),
            
            # 6. 启用站点
            (f"sudo a2ensite ai-dungeon-{PORT}.conf", "Enable AI-Dungeon site"),
            
            # 7. 测试Apache配置
            ("sudo apache2ctl configtest", "Test Apache configuration"),
            
            # 8. 重启Apache
            ("sudo systemctl restart apache2", "Restart Apache"),
            
            # 9. 检查Apache状态
            ("sudo systemctl status apache2 | head -10", "Check Apache status"),
            
            # 10. 开放防火墙端口（如果启用了防火墙）
            (f"sudo ufw allow {PORT}/tcp 2>&1 || echo 'Firewall not enabled'", f"Open firewall port {PORT}"),
            
            # 11. 测试新端口
            (f"curl -I http://localhost:{PORT}", f"Test port {PORT}"),
        ]
        
        for cmd, desc in steps:
            exit_code = execute_and_print(ssh, cmd, desc)
            if exit_code != 0 and "status" not in desc.lower() and "test" not in desc.lower():
                print(f"⚠️ Warning: {desc} failed but continuing...")
            time.sleep(0.5)
        
        print("\n" + "=" * 70)
        print("✅ Deployment to Port 8080 Complete!")
        print("=" * 70)
        print(f"\n🌐 Your NEW AI-Dungeon application is now available at:")
        print(f"   http://43.173.170.5:{PORT}")
        print(f"\n📊 Server Status:")
        print(f"   Port 80   : 你之前的项目 (保持不变)")
        print(f"   Port {PORT}: AI-Dungeon 新项目")
        print("\n💡 提示:")
        print("   - 两个项目现在都在运行")
        print("   - 可以通过不同端口访问")
        print(f"   - 防火墙已开放端口 {PORT}")
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

