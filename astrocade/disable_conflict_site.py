#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
禁用冲突的站点配置
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

def disable_conflict():
    """禁用冲突的配置"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [修复] 禁用冲突的站点")
    print("="*60)
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 禁用冲突的站点
        print("\n[1] 禁用冲突站点...")
        stdin, stdout, stderr = ssh.exec_command('sudo a2dissite ai-dungeon-8080.conf chess.conf chess-pvp.conf 2>&1')
        disable_output = stdout.read().decode()
        print(f"    {disable_output}")
        
        # 确保game.conf启用
        print("\n[2] 确保 game.conf 启用...")
        stdin, stdout, stderr = ssh.exec_command('sudo a2ensite game.conf')
        stdout.channel.recv_exit_status()
        print("    [OK] game.conf 已启用")
        
        # 重启Apache
        print("\n[3] 重启Apache...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl restart apache2')
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("    [OK] Apache已重启")
        else:
            print("    [ERROR] Apache重启失败")
            error = stderr.read().decode()
            print(f"    {error}")
            return False
        
        import time
        time.sleep(2)
        
        # 测试API
        print("\n[4] 测试API代理...")
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:8080/api/health')
        api_response = stdout.read().decode()
        print(f"    响应: {api_response}")
        
        if 'ok' in api_response.lower() and '{' in api_response:
            print("    [OK] API代理工作正常！")
            success = True
        else:
            print("    [WARN] API代理可能还有问题")
            success = False
        
        # 验证配置
        print("\n[5] 验证生效的配置...")
        stdin, stdout, stderr = ssh.exec_command('sudo apachectl -S 2>&1 | grep "port 8080"')
        config_info = stdout.read().decode()
        print(f"    {config_info}")
        
        ssh.close()
        
        print("\n" + "="*60)
        if success:
            print("  [SUCCESS] 在线模式已启用！")
        else:
            print("  [WARN] 可能还需要调整")
        print("="*60)
        print("\n立即访问:")
        print("  http://43.173.170.5:8080/")
        print("\n按 Ctrl+Shift+R 强制刷新！")
        print()
        
        return success
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = disable_conflict()
    sys.exit(0 if success else 1)

