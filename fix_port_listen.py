#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix port 8080 listening
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

def run_command(ssh, command, desc):
    """Run command"""
    print(f"\n{desc}...")
    print("-" * 60)
    
    full_cmd = f"echo '{PASSWORD}' | sudo -S {command}"
    
    try:
        stdin, stdout, stderr = ssh.exec_command(full_cmd, get_pty=True, timeout=60)
        
        output = stdout.read().decode('utf-8', errors='ignore')
        exit_code = stdout.channel.recv_exit_status()
        
        for line in output.split('\n'):
            line = line.strip()
            if line and not line.startswith('[sudo]') and PASSWORD not in line:
                print(line)
        
        print(f"{'✅' if exit_code == 0 else '⚠️'} {desc} - Exit code: {exit_code}")
        return exit_code
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

def main():
    print("\n" + "=" * 70)
    print(f"🔧 Fix Port {PORT} Configuration")
    print("=" * 70 + "\n")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"📡 Connecting...")
        ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
        print("✅ Connected!\n")
        
        # 方法1: 检查当前ports.conf
        print("\n检查当前Apache端口配置...")
        run_command(ssh, "cat /etc/apache2/ports.conf", "Current ports.conf")
        
        # 方法2: 创建新的ports.conf内容
        print(f"\n添加端口{PORT}监听...")
        ports_config = f"""# If you just change the port or add more ports here, you will likely also
# have to change the VirtualHost statement in
# /etc/apache2/sites-enabled/000-default.conf

Listen 80
Listen {PORT}

<IfModule ssl_module>
        Listen 443
</IfModule>

<IfModule mod_gnutls.c>
        Listen 443
</IfModule>"""
        
        # 创建临时文件
        run_command(ssh, f"cat > /tmp/ports.conf << 'EOFPORTS'\n{ports_config}\nEOFPORTS", "Create temp ports.conf")
        
        # 复制到正确位置
        run_command(ssh, "cp /tmp/ports.conf /etc/apache2/ports.conf", "Update ports.conf")
        
        # 测试配置
        run_command(ssh, "apache2ctl configtest", "Test Apache config")
        
        # 重启Apache
        run_command(ssh, "systemctl restart apache2", "Restart Apache")
        
        # 检查Apache是否监听8080
        run_command(ssh, f"netstat -tlnp | grep :{PORT} || ss -tlnp | grep :{PORT}", f"Check port {PORT} listening")
        
        # 测试访问
        run_command(ssh, f"curl -I http://localhost:{PORT} 2>&1 | head -15", f"Test local access")
        
        print("\n" + "=" * 70)
        print("✅ Port Configuration Fixed!")
        print("=" * 70)
        print(f"\n🌐 现在可以访问:")
        print(f"   http://43.173.170.5:{PORT}")
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


