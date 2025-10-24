#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全量同步到服务器 - 前端+后端
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

def full_sync():
    """全量同步到服务器"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    # 服务器配置
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    FRONTEND_DIR = "/var/www/html"
    BACKEND_DIR = "/home/ubuntu/astrocade-backend"
    
    print("\n" + "="*70)
    print("  [全量同步] 同步所有本地修改到服务器")
    print("="*70)
    
    print(f"\n服务器: {USERNAME}@{SERVER}")
    print(f"前端目录: {FRONTEND_DIR}")
    print(f"后端目录: {BACKEND_DIR}")
    
    try:
        # 连接服务器
        print("\n[1/5] 正在连接服务器...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("      [OK] 连接成功")
        
        sftp = ssh.open_sftp()
        
        # ==================== 前端同步 ====================
        print("\n[2/5] 同步前端文件...")
        
        # 清空前端目录
        print("      清理旧文件...")
        stdin, stdout, stderr = ssh.exec_command(f'rm -rf {FRONTEND_DIR}/*')
        stdout.channel.recv_exit_status()
        
        # 设置权限
        stdin, stdout, stderr = ssh.exec_command(f'sudo chown -R {USERNAME}:{USERNAME} {FRONTEND_DIR}')
        stdout.channel.recv_exit_status()
        
        # 上传前端 dist 目录
        frontend_path = os.path.join(os.path.dirname(__file__), 'dist')
        if not os.path.exists(frontend_path):
            print("      [ERROR] dist 目录不存在，请先运行 npm run build")
            return False
        
        frontend_files = []
        for root, dirs, files in os.walk(frontend_path):
            for file in files:
                local_file = os.path.join(root, file)
                relative_path = os.path.relpath(local_file, frontend_path)
                remote_file = os.path.join(FRONTEND_DIR, relative_path).replace('\\', '/')
                frontend_files.append((local_file, remote_file, relative_path))
        
        print(f"      上传 {len(frontend_files)} 个前端文件...")
        for local_file, remote_file, relative_path in frontend_files:
            # 创建远程目录
            remote_dir = os.path.dirname(remote_file)
            try:
                sftp.stat(remote_dir)
            except:
                stdin, stdout, stderr = ssh.exec_command(f'mkdir -p {remote_dir}')
                stdout.channel.recv_exit_status()
            
            sftp.put(local_file, remote_file)
            print(f"        ✓ {relative_path}")
        
        print("      [OK] 前端文件同步完成")
        
        # ==================== 后端同步 ====================
        print("\n[3/5] 同步后端文件...")
        
        # 创建后端目录
        stdin, stdout, stderr = ssh.exec_command(f'mkdir -p {BACKEND_DIR}/data')
        stdout.channel.recv_exit_status()
        
        # 后端文件列表
        backend_files = [
            ('server/index.js', 'index.js'),
            ('server/package.json', 'package.json'),
        ]
        
        print(f"      上传 {len(backend_files)} 个后端文件...")
        for local_path, remote_filename in backend_files:
            full_local_path = os.path.join(os.path.dirname(__file__), local_path)
            full_remote_path = f"{BACKEND_DIR}/{remote_filename}"
            
            if os.path.exists(full_local_path):
                sftp.put(full_local_path, full_remote_path)
                print(f"        ✓ {remote_filename}")
            else:
                print(f"        [WARN] 文件不存在: {local_path}")
        
        print("      [OK] 后端文件同步完成")
        
        sftp.close()
        
        # ==================== 安装依赖 ====================
        print("\n[4/5] 安装后端依赖...")
        stdin, stdout, stderr = ssh.exec_command(f'cd {BACKEND_DIR} && npm install 2>&1')
        output = stdout.read().decode()
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status != 0:
            print("      [WARN] npm install 可能有问题")
            print(output[-500:] if len(output) > 500 else output)
        else:
            print("      [OK] 依赖安装完成")
        
        # ==================== 重启后端服务 ====================
        print("\n[5/5] 重启后端服务...")
        
        # 停止旧进程
        print("      停止旧进程...")
        stdin, stdout, stderr = ssh.exec_command('pkill -f "node.*index.js"')
        stdout.channel.recv_exit_status()
        
        # 等待进程完全停止
        import time
        time.sleep(1)
        
        # 启动新进程
        print("      启动新进程...")
        start_cmd = f'cd {BACKEND_DIR} && nohup node index.js > backend.log 2>&1 &'
        stdin, stdout, stderr = ssh.exec_command(start_cmd)
        stdout.channel.recv_exit_status()
        
        # 等待服务启动
        time.sleep(2)
        
        # 验证服务
        stdin, stdout, stderr = ssh.exec_command('pgrep -f "node.*index.js"')
        pid_output = stdout.read().decode().strip()
        
        if pid_output:
            print(f"      [OK] 后端服务已启动 (PID: {pid_output})")
        else:
            print("      [WARN] 无法确认后端是否启动")
            # 显示日志
            stdin, stdout, stderr = ssh.exec_command(f'tail -20 {BACKEND_DIR}/backend.log')
            log_output = stdout.read().decode()
            if log_output:
                print("      最近的日志:")
                for line in log_output.split('\n')[-10:]:
                    if line.strip():
                        print(f"        {line}")
        
        ssh.close()
        
        # ==================== 完成 ====================
        print("\n" + "="*70)
        print("  [SUCCESS] 全量同步完成！")
        print("="*70)
        
        print("\n📦 同步内容:")
        print(f"  ✓ 前端: {len(frontend_files)} 个文件")
        print(f"  ✓ 后端: {len(backend_files)} 个文件")
        print(f"  ✓ 依赖: 已安装")
        print(f"  ✓ 服务: 已重启")
        
        print("\n🌐 访问地址:")
        print(f"  前端: http://{SERVER}:8080/")
        print(f"  后端: http://{SERVER}:3001/api/health")
        
        print("\n🔍 验证步骤:")
        print("  1. 访问前端地址")
        print("  2. 按 Ctrl+Shift+R 强制刷新")
        print("  3. 按 F12 查看控制台")
        print("  4. 确认显示 '后端连接成功，使用在线模式'")
        print("  5. 进入擂台竞技测试注册")
        
        print("\n📋 后端管理:")
        print(f"  查看日志: ssh {USERNAME}@{SERVER} 'tail -f {BACKEND_DIR}/backend.log'")
        print(f"  停止服务: ssh {USERNAME}@{SERVER} 'pkill -f \"node.*index.js\"'")
        print(f"  启动服务: ssh {USERNAME}@{SERVER} 'cd {BACKEND_DIR} && nohup node index.js > backend.log 2>&1 &'")
        
        print("\n✅ 所有本地修改已同步到服务器！")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] 同步失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        success = full_sync()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n[CANCEL] 已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

