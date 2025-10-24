#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Debug build issues
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

def debug_build():
    """Debug build issues"""
    print("\n" + "=" * 60)
    print("🔍 Debugging Build Issues")
    print("=" * 60 + "\n")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("Connecting...")
        ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
        print("✅ Connected!\n")
        
        # Check build command
        print("Checking build script...")
        stdin, stdout, stderr = ssh.exec_command("cd /var/www/ai-dungeon/astrocade && cat package.json | grep -A 5 'scripts'", timeout=30)
        print(stdout.read().decode('utf-8', errors='ignore'))
        
        # Try building with detailed output
        print("\nRunning build with full output...")
        print("-" * 60)
        
        stdin, stdout, stderr = ssh.exec_command("cd /var/www/ai-dungeon/astrocade && npm run build 2>&1", get_pty=True, timeout=300)
        output = stdout.read().decode('utf-8', errors='ignore')
        
        # Print all output
        for line in output.split('\n')[-50:]:  # Last 50 lines
            print(line)
        
        # Check if dist was created
        print("\n" + "-" * 60)
        print("Checking dist directory...")
        stdin, stdout, stderr = ssh.exec_command("ls -la /var/www/ai-dungeon/astrocade/ | grep dist", timeout=10)
        dist_check = stdout.read().decode('utf-8', errors='ignore')
        
        if "dist" in dist_check:
            print("✅ dist directory exists!")
            stdin, stdout, stderr = ssh.exec_command("ls -la /var/www/ai-dungeon/astrocade/dist/", timeout=10)
            print(stdout.read().decode('utf-8', errors='ignore'))
        else:
            print("❌ dist directory not found")
        
        # Check Nginx error
        print("\n" + "-" * 60)
        print("Checking Nginx error...")
        stdin, stdout, stderr = ssh.exec_command("sudo journalctl -xeu nginx.service | tail -20", get_pty=True, timeout=30)
        stdin.write(PASSWORD + '\n')
        stdin.flush()
        output = stdout.read().decode('utf-8', errors='ignore')
        print(output[-1000:])  # Last 1000 chars
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    debug_build()


