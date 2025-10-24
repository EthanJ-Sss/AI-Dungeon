#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix deployment issues
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

def execute_long_command(ssh, command, desc, timeout=900):
    """Execute long-running command with output"""
    print(f"\n{desc}...")
    print("-" * 50)
    
    channel = ssh.get_transport().open_session()
    channel.get_pty()
    channel.exec_command(command)
    
    # Send sudo password if needed
    if "sudo" in command:
        time.sleep(0.5)
        channel.send(PASSWORD + '\n')
    
    # Read output in real-time
    output_buffer = ""
    while True:
        if channel.recv_ready():
            chunk = channel.recv(4096).decode('utf-8', errors='ignore')
            output_buffer += chunk
            # Print last line
            lines = output_buffer.split('\n')
            if len(lines) > 0:
                print(f"  {lines[-2] if len(lines) > 1 else lines[-1]}")
        
        if channel.exit_status_ready():
            break
        
        time.sleep(0.2)
    
    exit_status = channel.recv_exit_status()
    channel.close()
    
    if exit_status == 0:
        print(f"✅ {desc} - Success")
    else:
        print(f"⚠️ {desc} - Exit code: {exit_status}")
    
    return exit_status

def fix_deployment():
    """Fix deployment issues"""
    print("\n" + "=" * 60)
    print("🔧 Fixing Deployment Issues")
    print("=" * 60 + "\n")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("Connecting to server...")
        ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
        print("✅ Connected!\n")
        
        # Fix steps
        steps = [
            ("cd /var/www/ai-dungeon/astrocade && pwd", "Verify directory"),
            ("cd /var/www/ai-dungeon/astrocade && npm install --legacy-peer-deps", "Install dependencies"),
            ("cd /var/www/ai-dungeon/astrocade && npm run build", "Build project"),
            ("sudo systemctl restart nginx", "Restart Nginx"),
            ("sudo systemctl status nginx", "Check Nginx status"),
        ]
        
        for command, desc in steps:
            execute_long_command(ssh, command, desc, timeout=900)
            time.sleep(1)
        
        # Final check
        print("\n" + "=" * 60)
        print("🌐 Checking deployment...")
        print("=" * 60)
        
        stdin, stdout, stderr = ssh.exec_command("ls -la /var/www/ai-dungeon/astrocade/dist/", get_pty=True, timeout=10)
        output = stdout.read().decode('utf-8', errors='ignore')
        
        if "index.html" in output:
            print("\n✅ Deployment Fixed Successfully!")
            print("\n🌐 Visit: http://43.173.170.5")
        else:
            print("\n⚠️ Build directory not found. Please check logs above.")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    fix_deployment()



