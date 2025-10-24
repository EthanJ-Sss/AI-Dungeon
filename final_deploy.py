#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final deployment script with git pull
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

def execute_and_print(ssh, command, desc):
    """Execute command and print output"""
    print(f"\n{desc}...")
    print("-" * 60)
    
    channel = ssh.get_transport().open_session()
    channel.get_pty()
    channel.exec_command(command)
    
    if "sudo" in command:
        time.sleep(0.3)
        channel.send(PASSWORD + '\n')
    
    output = ""
    while True:
        if channel.recv_ready():
            chunk = channel.recv(4096).decode('utf-8', errors='ignore')
            output += chunk
            sys.stdout.write(chunk)
            sys.stdout.flush()
        
        if channel.exit_status_ready():
            break
        
        time.sleep(0.1)
    
    exit_status = channel.recv_exit_status()
    channel.close()
    
    print(f"\n{'✅' if exit_status == 0 else '⚠️'} {desc} - Exit code: {exit_status}")
    return exit_status

def main():
    print("\n" + "=" * 70)
    print("🚀 AI-Dungeon Final Deployment")
    print("=" * 70 + "\n")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"📡 Connecting to {USERNAME}@{SERVER_IP}...")
        ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
        print("✅ Connected!\n")
        
        steps = [
            ("cd /var/www/ai-dungeon && git pull origin main", "Pull latest code from GitHub"),
            ("cd /var/www/ai-dungeon/astrocade && npm install --legacy-peer-deps", "Install dependencies"),
            ("cd /var/www/ai-dungeon/astrocade && npm run build", "Build project"),
            ("ls -la /var/www/ai-dungeon/astrocade/dist/", "Check build output"),
            ("sudo systemctl restart nginx", "Restart Nginx"),
            ("curl -I http://localhost", "Test local access"),
        ]
        
        all_success = True
        for cmd, desc in steps:
            exit_code = execute_and_print(ssh, cmd, desc)
            if exit_code != 0 and "restart nginx" not in desc.lower():
                print(f"\n⚠️ Warning: {desc} failed but continuing...")
            time.sleep(1)
        
        print("\n" + "=" * 70)
        print("✅ Deployment Complete!")
        print("=" * 70)
        print("\n🌐 Your application should now be available at:")
        print("   http://43.173.170.5")
        print("\n⚠️  IMPORTANT SECURITY REMINDERS:")
        print("   1. Change server password immediately: passwd")
        print("   2. Set up SSH key authentication")
        print("   3. Enable firewall: sudo ufw enable")
        print("\n" + "=" * 70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1
    finally:
        ssh.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())


