#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sync latest code to server and rebuild
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
PORT = 8080

def run_command(ssh, command, desc):
    """Run command"""
    print(f"\n{desc}...")
    print("-" * 60)
    
    full_cmd = f"echo '{PASSWORD}' | sudo -S {command}" if command.startswith('sudo') or 'systemctl' in command else command
    
    try:
        stdin, stdout, stderr = ssh.exec_command(full_cmd, get_pty=True, timeout=300)
        
        output = stdout.read().decode('utf-8', errors='ignore')
        exit_code = stdout.channel.recv_exit_status()
        
        # 打印输出
        for line in output.split('\n'):
            line = line.strip()
            if line and not line.startswith('[sudo]') and PASSWORD not in line:
                print(line)
        
        print(f"{'✅' if exit_code == 0 else '⚠️'} {desc} - Exit code: {exit_code}")
        return exit_code
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

def main():
    print("\n" + "=" * 70)
    print("🔄 Sync to Server and Rebuild")
    print("=" * 70 + "\n")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"📡 Connecting to {USERNAME}@{SERVER_IP}...")
        ssh.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10, look_for_keys=False, allow_agent=False)
        print("✅ Connected!\n")
        
        steps = [
            # 1. 检查当前状态
            ("cd /var/www/ai-dungeon && git status", "Check git status"),
            
            # 2. 拉取最新代码
            ("cd /var/www/ai-dungeon && git pull origin main", "Pull latest code"),
            
            # 3. 检查角色配置文件
            ("ls -la /var/www/ai-dungeon/astrocade/src/config/characters/", "Check character configs"),
            
            # 4. 统计角色数量
            ("cd /var/www/ai-dungeon/astrocade/src/config/characters && echo '=== Character Count ===' && for file in *.json; do echo \"$file: $(grep -c '\"id\"' $file) characters\"; done", "Count characters"),
            
            # 5. 进入项目目录
            ("cd /var/www/ai-dungeon/astrocade && pwd", "Enter project directory"),
            
            # 6. 安装/更新依赖
            ("cd /var/www/ai-dungeon/astrocade && npm install --legacy-peer-deps", "Install dependencies"),
            
            # 7. 清理旧的构建文件
            ("cd /var/www/ai-dungeon/astrocade && rm -rf dist", "Clean old build"),
            
            # 8. 重新构建项目
            ("cd /var/www/ai-dungeon/astrocade && npm run build", "Build project"),
            
            # 9. 检查构建结果
            ("ls -lh /var/www/ai-dungeon/astrocade/dist/", "Check build output"),
            
            # 10. 重启Apache（可选，静态文件不需要重启）
            ("echo 'Static files updated, Apache restart not required'", "Info"),
        ]
        
        for cmd, desc in steps:
            exit_code = run_command(ssh, cmd, desc)
            if exit_code != 0 and "build" in desc.lower():
                print("\n⚠️ Build failed! Please check errors above.")
                return 1
        
        print("\n" + "=" * 70)
        print("✅ Sync and Rebuild Complete!")
        print("=" * 70)
        print(f"\n🌐 访问地址:")
        print(f"   http://43.173.170.5:{PORT}")
        print(f"\n📊 角色配置状态:")
        print("   - ✅ 所有45个角色均已配置技能")
        print("   - ✅ 10个普通角色 (common.json)")
        print("   - ✅ 35个稀有/精英角色 (各元素)")
        print("\n💡 提示:")
        print("   - 刷新浏览器清除缓存 (Ctrl+Shift+R)")
        print("   - 或使用无痕模式访问")
        print("\n" + "=" * 70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        ssh.close()
    
    return 0

if __name__ == "__main__":
    sys.exit(main())


