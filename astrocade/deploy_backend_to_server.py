#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
部署后端到服务器
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

def deploy_backend():
    """部署后端到服务器"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    # 服务器配置
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    REMOTE_DIR = "/home/ubuntu/astrocade-backend"
    
    print("\n" + "="*60)
    print("  [DEPLOY] 部署后端到服务器")
    print("="*60)
    
    print(f"\n服务器: {USERNAME}@{SERVER}")
    print(f"目标路径: {REMOTE_DIR}")
    
    # 后端文件列表
    backend_files = {
        'server/index.js': 'index.js',
        'server/package.json': 'package.json',
    }
    
    try:
        # 连接服务器
        print("\n正在连接服务器...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] 连接成功")
        
        # 创建远程目录
        print(f"\n创建目录: {REMOTE_DIR}")
        stdin, stdout, stderr = ssh.exec_command(f'mkdir -p {REMOTE_DIR}/data')
        stdout.channel.recv_exit_status()
        
        # 上传文件
        sftp = ssh.open_sftp()
        
        print("\n上传后端文件...")
        for local_path, remote_filename in backend_files.items():
            full_local_path = os.path.join(os.path.dirname(__file__), local_path)
            full_remote_path = f"{REMOTE_DIR}/{remote_filename}"
            
            if os.path.exists(full_local_path):
                print(f"  上传: {remote_filename}")
                sftp.put(full_local_path, full_remote_path)
            else:
                print(f"  [WARN] 文件不存在: {local_path}")
        
        sftp.close()
        
        # 安装依赖
        print("\n安装 Node.js 依赖...")
        stdin, stdout, stderr = ssh.exec_command(f'cd {REMOTE_DIR} && npm install')
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            print("[WARN] npm install 失败，可能需要手动安装")
        else:
            print("[OK] 依赖安装完成")
        
        # 停止旧进程
        print("\n停止旧的后端进程...")
        stdin, stdout, stderr = ssh.exec_command('pkill -f "node.*index.js"')
        stdout.channel.recv_exit_status()
        
        # 启动后端服务（使用 nohup 在后台运行）
        print("\n启动后端服务...")
        start_cmd = f'cd {REMOTE_DIR} && nohup node index.js > backend.log 2>&1 &'
        stdin, stdout, stderr = ssh.exec_command(start_cmd)
        stdout.channel.recv_exit_status()
        
        # 等待一下确保服务启动
        import time
        time.sleep(2)
        
        # 检查服务是否运行
        stdin, stdout, stderr = ssh.exec_command('pgrep -f "node.*index.js"')
        output = stdout.read().decode().strip()
        if output:
            print(f"[OK] 后端服务已启动 (PID: {output})")
        else:
            print("[WARN] 无法确认后端是否启动，请手动检查")
        
        ssh.close()
        
        print("\n" + "="*60)
        print("  [SUCCESS] 后端部署完成！")
        print("="*60)
        print(f"\n后端API地址: http://{SERVER}:3001/api/health")
        print(f"日志位置: {REMOTE_DIR}/backend.log")
        print("\n手动管理命令:")
        print(f"  查看日志: ssh {USERNAME}@{SERVER} 'tail -f {REMOTE_DIR}/backend.log'")
        print(f"  停止服务: ssh {USERNAME}@{SERVER} 'pkill -f \"node.*index.js\"'")
        print(f"  启动服务: ssh {USERNAME}@{SERVER} 'cd {REMOTE_DIR} && nohup node index.js > backend.log 2>&1 &'")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        success = deploy_backend()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n[CANCEL] 已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


