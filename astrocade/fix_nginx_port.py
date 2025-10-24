#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复Nginx端口冲突
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

def fix_port():
    """修复端口冲突"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [修复] 端口冲突")
    print("="*60)
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 检查端口占用
        print("\n[1] 检查8080端口占用...")
        stdin, stdout, stderr = ssh.exec_command('sudo lsof -i :8080 || sudo netstat -tuln | grep :8080 || sudo ss -tuln | grep :8080')
        port_info = stdout.read().decode()
        print(port_info if port_info.strip() else "    无占用")
        
        # 检查Nginx错误日志
        print("\n[2] 检查Nginx错误日志...")
        stdin, stdout, stderr = ssh.exec_command('sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "无日志"')
        error_log = stdout.read().decode()
        print(error_log if error_log.strip() else "    无错误")
        
        # 检查systemd日志
        print("\n[3] 检查systemd日志...")
        stdin, stdout, stderr = ssh.exec_command('sudo journalctl -u nginx -n 20 --no-pager')
        journal_log = stdout.read().decode()
        for line in journal_log.split('\n')[-10:]:
            if line.strip():
                print(f"    {line}")
        
        # 尝试使用不同的配置
        print("\n[4] 尝试修复...")
        
        # 先停止Nginx
        print("    停止Nginx...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl stop nginx')
        stdout.channel.recv_exit_status()
        
        import time
        time.sleep(2)
        
        # 强制杀死占用8080的进程
        print("    清理8080端口...")
        stdin, stdout, stderr = ssh.exec_command('sudo fuser -k 8080/tcp 2>/dev/null || true')
        stdout.channel.recv_exit_status()
        
        time.sleep(1)
        
        # 重新启动Nginx
        print("    启动Nginx...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl start nginx')
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("    [OK] Nginx已启动")
        else:
            error = stderr.read().decode()
            print(f"    [ERROR] 启动失败: {error}")
        
        # 检查状态
        print("\n[5] 验证Nginx状态...")
        stdin, stdout, stderr = ssh.exec_command('sudo systemctl is-active nginx')
        status = stdout.read().decode().strip()
        print(f"    状态: {status}")
        
        if status == 'active':
            print("    [OK] Nginx运行正常")
            
            # 测试API代理
            print("\n[6] 测试API代理...")
            stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:8080/api/health')
            api_response = stdout.read().decode()
            print(f"    响应: {api_response}")
            
            if 'ok' in api_response.lower():
                print("    [OK] API代理工作正常")
                return True
            else:
                print("    [WARN] API代理可能有问题")
        
        ssh.close()
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return False

if __name__ == "__main__":
    fix_port()


