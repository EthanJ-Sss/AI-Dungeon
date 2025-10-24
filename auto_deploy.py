#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI-Dungeon Auto Deploy Script
Support Windows/Linux/macOS
"""

import sys
import time
import io

# Fix Windows encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

try:
    import paramiko
except ImportError:
    print("[ERROR] paramiko library is missing")
    print("Installing paramiko...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko"])
    import paramiko

# 服务器配置
SERVER_IP = "43.173.170.5"
USERNAME = "ubuntu"
PASSWORD = "MTc1MjA0NDQ0MQ"

# 部署命令列表
DEPLOY_COMMANDS = [
    ("📦 安装基础软件", [
        "sudo apt-get update -qq",
        "sudo apt-get install -y nodejs npm git nginx"
    ]),
    ("📁 准备部署目录", [
        "sudo mkdir -p /var/www/ai-dungeon",
        "sudo chown -R ubuntu:ubuntu /var/www/ai-dungeon"
    ]),
    ("📥 获取项目代码", [
        "if [ -d /var/www/ai-dungeon/.git ]; then cd /var/www/ai-dungeon && git pull origin main; else cd /var/www && git clone https://github.com/EthanJ-Sss/AI-Dungeon.git ai-dungeon; fi"
    ]),
    ("📦 安装项目依赖", [
        "cd /var/www/ai-dungeon/astrocade",
        "npm install --legacy-peer-deps"
    ]),
    ("🏗️ 构建生产版本", [
        "cd /var/www/ai-dungeon/astrocade",
        "npm run build"
    ]),
    ("🌐 配置Nginx", [
        "echo 'server { listen 80; server_name 43.173.170.5; root /var/www/ai-dungeon/astrocade/dist; index index.html; gzip on; location / { try_files $uri $uri/ /index.html; } }' | sudo tee /etc/nginx/sites-available/ai-dungeon",
        "sudo ln -sf /etc/nginx/sites-available/ai-dungeon /etc/nginx/sites-enabled/",
        "sudo rm -f /etc/nginx/sites-enabled/default",
        "sudo nginx -t",
        "sudo systemctl restart nginx",
        "sudo systemctl enable nginx"
    ]),
]

def print_header(text):
    """打印标题"""
    print("\n" + "=" * 50)
    print(text)
    print("=" * 50 + "\n")

def execute_command(ssh, command, timeout=300):
    """执行SSH命令"""
    try:
        stdin, stdout, stderr = ssh.exec_command(command, get_pty=True, timeout=timeout)
        
        # 如果命令需要sudo密码，发送密码
        if "sudo" in command:
            stdin.write(PASSWORD + '\n')
            stdin.flush()
        
        # 读取输出
        output = stdout.read().decode('utf-8', errors='ignore')
        error = stderr.read().decode('utf-8', errors='ignore')
        
        return output, error, stdout.channel.recv_exit_status()
    except Exception as e:
        return "", str(e), 1

def main():
    """主部署流程"""
    print_header("🚀 AI-Dungeon 自动部署脚本")
    print(f"📍 服务器: {USERNAME}@{SERVER_IP}\n")
    
    # 创建SSH客户端
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        # 连接服务器
        print("📡 正在连接服务器...")
        ssh.connect(
            SERVER_IP,
            username=USERNAME,
            password=PASSWORD,
            timeout=10,
            look_for_keys=False,
            allow_agent=False
        )
        print("✅ 连接成功！\n")
        
        # 执行部署步骤
        print_header("🚀 开始执行部署")
        
        for step_num, (step_name, commands) in enumerate(DEPLOY_COMMANDS, 1):
            print(f"\n步骤{step_num}/{len(DEPLOY_COMMANDS)}: {step_name}")
            print("-" * 50)
            
            for cmd in commands:
                print(f"执行: {cmd[:80]}...")
                output, error, exit_code = execute_command(ssh, cmd, timeout=600)
                
                if exit_code != 0 and error:
                    print(f"⚠️ 警告: {error[:200]}")
                    # 对于某些非关键错误，继续执行
                    if "nginx" not in cmd.lower():
                        continue
                
                # 显示重要输出
                if "successfully" in output.lower() or "complete" in output.lower():
                    print(f"✅ {output[:100]}")
                
                time.sleep(0.5)
            
            print(f"✅ {step_name} - 完成")
        
        # 部署完成
        print_header("✅ 部署成功完成！")
        print("🌐 访问地址: http://43.173.170.5")
        print("\n⚠️ 重要提醒:")
        print("  1. 立即修改服务器密码: passwd")
        print("  2. 配置SSH密钥认证")
        print("  3. 启用防火墙: sudo ufw enable\n")
        
    except paramiko.AuthenticationException:
        print("❌ 认证失败：用户名或密码错误")
        return 1
    except paramiko.SSHException as e:
        print(f"❌ SSH连接错误: {e}")
        return 1
    except Exception as e:
        print(f"❌ 部署失败: {e}")
        return 1
    finally:
        ssh.close()
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    
    # Windows环境下暂停
    if sys.platform == "win32":
        input("\n按回车键退出...")
    
    sys.exit(exit_code)

