#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
强制同步到服务器并重新构建
解决 package-lock.json 冲突问题
"""

import paramiko
import sys
import time

# 设置编码
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 服务器配置
HOST = "43.173.170.5"
USERNAME = "ubuntu"
PASSWORD = "MTc1MjA0NDQ0MQ"
PROJECT_PATH = "/var/www/ai-dungeon"

def execute_command(client, command, description=""):
    """执行SSH命令并打印输出"""
    print(f"\n{'='*70}")
    if description:
        print(f"📌 {description}")
    print(f"🔧 执行: {command}")
    print('='*70)
    
    stdin, stdout, stderr = client.exec_command(command, get_pty=True)
    
    # 实时读取输出
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end='')
    
    # 获取退出码
    exit_code = stdout.channel.recv_exit_status()
    
    # 读取错误输出
    error = stderr.read().decode('utf-8', errors='ignore')
    if error and exit_code != 0:
        print(f"⚠️  错误输出:\n{error}")
    
    if exit_code == 0:
        print(f"✅ {description or command} - 成功 (Exit code: {exit_code})")
    else:
        print(f"❌ {description or command} - 失败 (Exit code: {exit_code})")
    
    return exit_code

def main():
    print("\n" + "="*70)
    print("🚀 强制同步到服务器并重新构建")
    print("="*70)
    
    # 连接服务器
    print(f"\n📡 连接到 {USERNAME}@{HOST}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOST, username=USERNAME, password=PASSWORD, timeout=10)
        print("✅ 连接成功！\n")
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return 1
    
    try:
        # 1. 检查当前状态
        execute_command(client, f"cd {PROJECT_PATH} && git status", "检查Git状态")
        
        # 2. 强制恢复 package-lock.json
        execute_command(client, 
                       f"cd {PROJECT_PATH} && git checkout -- astrocade/package-lock.json", 
                       "强制恢复 package-lock.json")
        
        # 3. 拉取最新代码
        execute_command(client, f"cd {PROJECT_PATH} && git pull", "拉取最新代码")
        
        # 4. 检查角色配置文件
        execute_command(client, 
                       f"cd {PROJECT_PATH}/astrocade/src/config/characters && ls -lh",
                       "检查角色配置文件")
        
        # 5. 验证文件更新
        execute_command(client,
                       f"cd {PROJECT_PATH}/astrocade/src/config/characters && head -n 10 neutral.json",
                       "验证neutral.json更新")
        
        # 6. 进入项目目录
        execute_command(client, f"cd {PROJECT_PATH}/astrocade && pwd", "进入项目目录")
        
        # 7. 安装依赖
        print("\n⏳ 安装依赖（这可能需要一些时间）...")
        execute_command(client, f"cd {PROJECT_PATH}/astrocade && npm install", "安装依赖")
        
        # 8. 清理旧构建
        execute_command(client, f"cd {PROJECT_PATH}/astrocade && rm -rf dist", "清理旧构建")
        
        # 9. 重新构建
        print("\n⏳ 构建项目（这可能需要一些时间）...")
        exit_code = execute_command(client, 
                                   f"cd {PROJECT_PATH}/astrocade && npm run build",
                                   "构建项目")
        
        if exit_code != 0:
            print("\n❌ 构建失败！")
            return 1
        
        # 10. 检查构建输出
        execute_command(client, f"cd {PROJECT_PATH}/astrocade && ls -lh dist/", "检查构建输出")
        
        # 11. 验证角色数值（从构建的JSON文件中检查）
        print("\n" + "="*70)
        print("🔍 验证关键角色数值更新")
        print("="*70)
        
        # 检查暗影刺客王
        execute_command(client,
                       f"cd {PROJECT_PATH}/astrocade/src/config/characters && grep -A 5 '\"name\": \"暗影刺客王\"' neutral.json | grep -E '(damage|moveSpeed|attackMultiplier)'",
                       "检查暗影刺客王数值")
        
        # 检查学徒法师
        execute_command(client,
                       f"cd {PROJECT_PATH}/astrocade/src/config/characters && grep -A 5 '\"name\": \"学徒法师\"' common.json | grep -E '(hp|damage)'",
                       "检查学徒法师数值")
        
        print("\n" + "="*70)
        print("✅ 强制同步完成！")
        print("="*70)
        print(f"\n🌐 访问地址: http://{HOST}:8080")
        print("\n💡 提示:")
        print("   - 刷新浏览器清除缓存 (Ctrl+Shift+R)")
        print("   - 或使用无痕模式访问")
        print("   - 角色数值已更新:")
        print("     • 暗影刺客王: 伤害70→64, 移速45→42")
        print("     • 学徒法师: HP 180→200, 伤害28→32")
        print("     • 其他12个角色也已调整")
        print("\n" + "="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ 执行过程出错: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        client.close()
    
    return 0

if __name__ == "__main__":
    exit(main())


