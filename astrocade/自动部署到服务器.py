#!/usr/bin/env python3
"""
自动部署到服务器脚本
一键将构建好的 dist/ 上传到服务器
"""

import os
import sys
import subprocess
import getpass

# 服务器配置
SERVER_IP = "43.173.170.5"
SERVER_PORT = "22"
SERVER_USER = "root"  # 或你的用户名
SERVER_PATH = "/var/www/astrocade/"  # 服务器上的部署路径

def print_banner():
    print("=" * 60)
    print("  异步对战在线系统 - 自动部署到服务器")
    print("=" * 60)
    print()

def check_dist():
    """检查 dist/ 文件夹是否存在"""
    if not os.path.exists("dist"):
        print("❌ dist/ 文件夹不存在")
        print("   请先运行: npm run build")
        return False
    print("✅ 找到 dist/ 文件夹")
    return True

def deploy_via_scp():
    """使用 SCP 上传到服务器"""
    print()
    print("[1/2] 准备上传到服务器...")
    print(f"      服务器: {SERVER_IP}")
    print(f"      路径: {SERVER_PATH}")
    print()
    
    # 询问密码
    password = getpass.getpass("请输入服务器密码: ")
    
    print()
    print("[2/2] 上传中...")
    
    # 使用 rsync 或 scp 上传
    try:
        # 尝试使用 rsync（更快）
        cmd = [
            "sshpass", "-p", password,
            "rsync", "-avz", "--delete",
            "dist/",
            f"{SERVER_USER}@{SERVER_IP}:{SERVER_PATH}"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            # 如果 rsync 失败，尝试 scp
            cmd = [
                "sshpass", "-p", password,
                "scp", "-r",
                "dist/*",
                f"{SERVER_USER}@{SERVER_IP}:{SERVER_PATH}"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ 上传成功！")
            return True
        else:
            print(f"❌ 上传失败: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ 未安装 sshpass 或 rsync")
        print("   请手动上传 dist/ 文件夹到服务器")
        return False

def deploy_manual():
    """手动部署说明"""
    print()
    print("=" * 60)
    print("  手动部署步骤")
    print("=" * 60)
    print()
    print("1. 打开 FTP 客户端（如 FileZilla）")
    print(f"2. 连接到: {SERVER_IP}")
    print(f"3. 用户名: {SERVER_USER}")
    print(f"4. 上传 dist/ 文件夹到: {SERVER_PATH}")
    print()
    print("或使用命令行：")
    print(f"   scp -r dist/* {SERVER_USER}@{SERVER_IP}:{SERVER_PATH}")
    print()

def main():
    print_banner()
    
    # 检查 dist/ 文件夹
    if not check_dist():
        sys.exit(1)
    
    # 询问部署方式
    print()
    print("选择部署方式:")
    print("1. 自动上传（需要 SSH 密码）")
    print("2. 手动上传说明")
    print()
    choice = input("请选择 [1/2]: ").strip()
    
    if choice == "1":
        if deploy_via_scp():
            print()
            print("=" * 60)
            print("  🎉 部署完成！")
            print("=" * 60)
            print()
            print(f"访问: http://{SERVER_IP}:8080/")
            print()
            print("告诉朋友访问这个地址，一起开始游戏吧！ 🎮")
            print()
    else:
        deploy_manual()

if __name__ == "__main__":
    main()


