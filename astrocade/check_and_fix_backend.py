#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查并修复后端服务
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

def check_and_fix():
    """检查并修复后端"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    BACKEND_DIR = "/home/ubuntu/astrocade-backend"
    
    print("\n" + "="*60)
    print("  [检查] 后端服务状态")
    print("="*60)
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 检查进程
        print("\n[1] 检查后端进程...")
        stdin, stdout, stderr = ssh.exec_command('pgrep -f "node.*index.js"')
        pid = stdout.read().decode().strip()
        if pid:
            print(f"    [OK] 后端进程运行中 (PID: {pid})")
        else:
            print("    [WARN] 后端进程未运行")
        
        # 检查端口
        print("\n[2] 检查端口监听...")
        stdin, stdout, stderr = ssh.exec_command('netstat -tuln | grep :3001 || ss -tuln | grep :3001')
        port_info = stdout.read().decode().strip()
        if port_info:
            print(f"    [OK] 端口3001已监听")
            print(f"    {port_info}")
        else:
            print("    [WARN] 端口3001未监听")
        
        # 检查日志
        print("\n[3] 检查后端日志...")
        stdin, stdout, stderr = ssh.exec_command(f'tail -30 {BACKEND_DIR}/backend.log 2>/dev/null || echo "日志文件不存在"')
        log = stdout.read().decode()
        print("    最近的日志:")
        for line in log.split('\n')[-15:]:
            if line.strip():
                print(f"    {line}")
        
        # 测试API
        print("\n[4] 测试API连接...")
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:3001/api/health')
        api_response = stdout.read().decode().strip()
        if api_response and 'ok' in api_response.lower():
            print(f"    [OK] API响应正常: {api_response}")
        else:
            print(f"    [WARN] API无响应或异常: {api_response}")
        
        # 如果服务未运行，重启
        if not pid or not port_info:
            print("\n[5] 重启后端服务...")
            
            # 停止旧进程
            stdin, stdout, stderr = ssh.exec_command('pkill -9 -f "node.*index.js"')
            stdout.channel.recv_exit_status()
            
            import time
            time.sleep(2)
            
            # 启动新进程
            start_cmd = f'cd {BACKEND_DIR} && nohup node index.js > backend.log 2>&1 &'
            stdin, stdout, stderr = ssh.exec_command(start_cmd)
            stdout.channel.recv_exit_status()
            
            time.sleep(3)
            
            # 再次检查
            stdin, stdout, stderr = ssh.exec_command('pgrep -f "node.*index.js"')
            new_pid = stdout.read().decode().strip()
            if new_pid:
                print(f"    [OK] 后端已重启 (PID: {new_pid})")
            else:
                print("    [ERROR] 重启失败")
                
                # 显示错误日志
                stdin, stdout, stderr = ssh.exec_command(f'tail -20 {BACKEND_DIR}/backend.log')
                error_log = stdout.read().decode()
                print("    错误日志:")
                print(error_log)
        
        # 检查防火墙
        print("\n[6] 检查防火墙规则...")
        stdin, stdout, stderr = ssh.exec_command('sudo iptables -L -n | grep 3001 || echo "无iptables规则"')
        fw_info = stdout.read().decode().strip()
        print(f"    {fw_info}")
        
        ssh.close()
        
        print("\n" + "="*60)
        print("  [完成] 检查结束")
        print("="*60)
        print("\n下一步:")
        print("1. 访问 http://43.173.170.5:3001/api/health")
        print("2. 如果无法访问，可能需要开放端口3001")
        print("3. 或修改前端使用代理")
        print()
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_and_fix()


