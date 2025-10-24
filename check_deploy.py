#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check deployment status
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

def check_status():
    """Check deployment status"""
    print("\n" + "=" * 50)
    print("Checking Deployment Status")
    print("=" * 50 + "\n")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("Connecting to server...")
        ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
        print("Connected successfully!\n")
        
        checks = [
            ("Check project directory", "ls -la /var/www/ai-dungeon/"),
            ("Check astrocade directory", "ls -la /var/www/ai-dungeon/astrocade/"),
            ("Check Node.js version", "node --version"),
            ("Check npm version", "npm --version"),
            ("Check Nginx status", "sudo systemctl status nginx | head -5"),
            ("Check Nginx sites", "ls -la /etc/nginx/sites-enabled/"),
            ("Test Nginx config", "sudo nginx -t"),
        ]
        
        for check_name, command in checks:
            print(f"\n[{check_name}]")
            print("-" * 50)
            stdin, stdout, stderr = ssh.exec_command(command, get_pty=True, timeout=30)
            if "sudo" in command:
                stdin.write(PASSWORD + '\n')
                stdin.flush()
            output = stdout.read().decode('utf-8', errors='ignore')
            print(output[:500])
        
        print("\n" + "=" * 50)
        print("Status Check Complete")
        print("=" * 50)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    check_status()



