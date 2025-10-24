#!/usr/bin/env python3
"""
自动部署脚本 - 异步对战系统
将前端和后端自动部署到服务器
"""

import os
import sys
import subprocess
import shutil

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def run_command(cmd, cwd=None):
    """运行命令并实时输出"""
    print(f"💻 执行: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"❌ 命令执行失败: {cmd}")
        return False
    return True

def main():
    print_header("🚀 异步对战系统 - 自动部署")
    
    # 获取服务器信息
    print("📝 请输入服务器信息:")
    server_ip = input("服务器IP (默认: 43.173.170.5): ").strip() or "43.173.170.5"
    server_user = input("SSH用户名 (默认: root): ").strip() or "root"
    server_backend_path = input("后端部署路径 (默认: /root/astrocade-server): ").strip() or "/root/astrocade-server"
    server_frontend_path = input("前端部署路径 (默认: /var/www/html): ").strip() or "/var/www/html"
    
    print(f"\n✅ 配置:")
    print(f"   服务器: {server_user}@{server_ip}")
    print(f"   后端路径: {server_backend_path}")
    print(f"   前端路径: {server_frontend_path}")
    
    confirm = input("\n确认开始部署? (y/n): ").strip().lower()
    if confirm != 'y':
        print("❌ 已取消部署")
        return
    
    # 步骤1: 创建环境配置
    print_header("步骤1: 配置环境")
    
    env_content = f"VITE_API_URL=http://{server_ip}:3001/api\n"
    
    with open('.env.production', 'w', encoding='utf-8') as f:
        f.write(env_content)
    print("✅ 已创建 .env.production")
    
    # 步骤2: 构建前端
    print_header("步骤2: 构建前端")
    
    if not run_command("npm run build"):
        print("❌ 前端构建失败")
        return
    
    print("✅ 前端构建完成")
    
    # 步骤3: 准备部署包
    print_header("步骤3: 准备部署包")
    
    # 清理旧的部署包
    if os.path.exists('deploy'):
        shutil.rmtree('deploy')
    
    os.makedirs('deploy/frontend', exist_ok=True)
    os.makedirs('deploy/backend', exist_ok=True)
    
    # 复制前端文件
    shutil.copytree('dist', 'deploy/frontend', dirs_exist_ok=True)
    print("✅ 前端文件已准备")
    
    # 复制后端文件
    shutil.copytree('server', 'deploy/backend', dirs_exist_ok=True)
    print("✅ 后端文件已准备")
    
    # 步骤4: 上传到服务器
    print_header("步骤4: 上传到服务器")
    
    print("📤 上传后端...")
    backend_cmd = f"scp -r ./deploy/backend/* {server_user}@{server_ip}:{server_backend_path}/"
    if not run_command(backend_cmd):
        print("❌ 后端上传失败，请检查SSH连接")
        print(f"\n💡 你也可以手动上传: ")
        print(f"   scp -r ./deploy/backend/* {server_user}@{server_ip}:{server_backend_path}/")
        return
    
    print("📤 上传前端...")
    frontend_cmd = f"scp -r ./deploy/frontend/* {server_user}@{server_ip}:{server_frontend_path}/"
    if not run_command(frontend_cmd):
        print("❌ 前端上传失败")
        print(f"\n💡 你也可以手动上传: ")
        print(f"   scp -r ./deploy/frontend/* {server_user}@{server_ip}:{server_frontend_path}/")
        return
    
    # 步骤5: 在服务器上启动后端
    print_header("步骤5: 启动后端服务")
    
    print("🔧 在服务器上安装依赖并启动后端...")
    
    ssh_commands = f"""
cd {server_backend_path} && \
npm install && \
pm2 stop ladder-api 2>/dev/null || true && \
pm2 start index.js --name ladder-api && \
pm2 save
"""
    
    ssh_cmd = f"ssh {server_user}@{server_ip} '{ssh_commands}'"
    
    print(f"💻 执行SSH命令...")
    if not run_command(ssh_cmd):
        print("⚠️ 自动启动失败，请手动登录服务器执行:")
        print(f"   ssh {server_user}@{server_ip}")
        print(f"   cd {server_backend_path}")
        print(f"   npm install")
        print(f"   pm2 start index.js --name ladder-api")
    
    # 完成
    print_header("✅ 部署完成！")
    
    print(f"🎮 游戏地址: http://{server_ip}:8080/")
    print(f"🔧 后端API: http://{server_ip}:3001/api/health")
    print(f"\n💡 提示:")
    print(f"   - 确保服务器防火墙允许 3001 和 8080 端口")
    print(f"   - 查看后端日志: ssh {server_user}@{server_ip} 'pm2 logs ladder-api'")
    print(f"   - 重启后端: ssh {server_user}@{server_ip} 'pm2 restart ladder-api'")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ 部署已取消")
    except Exception as e:
        print(f"\n❌ 部署出错: {e}")
        import traceback
        traceback.print_exc()


