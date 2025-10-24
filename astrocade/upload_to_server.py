#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动上传文件到服务器
"""

import os
import sys
import io

# 设置UTF-8输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 服务器配置
SERVER = "43.173.170.5"
USERNAME = "ubuntu"
PASSWORD = "MTc1MjA0NDQ0MQ"
REMOTE_PATH = "/var/www/html/"
LOCAL_PATH = "dist"

def install_paramiko():
    """安装paramiko库"""
    print("正在安装 paramiko 库...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "-q"])
    print("[OK] paramiko 安装完成")

def upload_files():
    """上传文件到服务器"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    print("\n" + "="*60)
    print("  [DEPLOY] 开始上传到服务器")
    print("="*60)
    
    print(f"\n服务器: {USERNAME}@{SERVER}")
    print(f"目标路径: {REMOTE_PATH}")
    print(f"本地路径: {LOCAL_PATH}")
    
    # 检查本地文件
    if not os.path.exists(LOCAL_PATH):
        print(f"\n[ERROR] {LOCAL_PATH} 目录不存在")
        print("请先运行: npm run build")
        return False
    
    try:
        # 创建SSH客户端
        print("\n正在连接服务器...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        
        print("[OK] 连接成功")
        
        # 修改目标目录权限
        print("\n正在设置目录权限...")
        stdin, stdout, stderr = ssh.exec_command(f'sudo chown -R {USERNAME}:{USERNAME} {REMOTE_PATH}')
        stdout.channel.recv_exit_status()
        stdin, stdout, stderr = ssh.exec_command(f'sudo chmod -R 755 {REMOTE_PATH}')
        stdout.channel.recv_exit_status()
        print("[OK] 权限设置完成")
        
        # 创建SFTP客户端
        sftp = ssh.open_sftp()
        
        # 获取所有文件
        files_to_upload = []
        for root, dirs, files in os.walk(LOCAL_PATH):
            for file in files:
                local_file = os.path.join(root, file)
                relative_path = os.path.relpath(local_file, LOCAL_PATH)
                remote_file = os.path.join(REMOTE_PATH, relative_path).replace('\\', '/')
                files_to_upload.append((local_file, remote_file))
        
        print(f"\n找到 {len(files_to_upload)} 个文件需要上传")
        
        # 上传文件
        for i, (local_file, remote_file) in enumerate(files_to_upload, 1):
            try:
                # 创建远程目录
                remote_dir = os.path.dirname(remote_file)
                try:
                    sftp.stat(remote_dir)
                except:
                    # 目录不存在，创建它
                    stdin, stdout, stderr = ssh.exec_command(f'mkdir -p {remote_dir}')
                    stdout.channel.recv_exit_status()
                
                # 上传文件
                print(f"[{i}/{len(files_to_upload)}] 上传: {os.path.basename(local_file)}")
                sftp.put(local_file, remote_file)
                
            except Exception as e:
                print(f"  [WARN] {e}")
        
        # 关闭连接
        sftp.close()
        ssh.close()
        
        print("\n" + "="*60)
        print("  [SUCCESS] 部署完成！")
        print("="*60)
        print(f"\n访问: http://{SERVER}:8080/")
        print("\n测试步骤:")
        print("1. 进入擂台竞技")
        print("2. 输入昵称注册")
        print("3. 设置防守阵容")
        print("4. 开始挑战！")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        print("\n请确认:")
        print("1. 服务器地址正确")
        print("2. 用户名和密码正确")
        print("3. 网络连接正常")
        return False

if __name__ == "__main__":
    try:
        success = upload_files()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n[CANCEL] 已取消")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

