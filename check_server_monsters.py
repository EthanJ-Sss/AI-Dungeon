#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查服务器上的怪物配置文件
"""

import paramiko
import sys

# 设置编码
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 服务器配置
HOST = "43.173.170.5"
USERNAME = "ubuntu"
PASSWORD = "MTc1MjA0NDQ0MQ"

def execute_command(client, command, description=""):
    """执行SSH命令并打印输出"""
    print(f"\n{'='*70}")
    if description:
        print(f"📌 {description}")
    print(f"🔧 执行: {command}")
    print('='*70)
    
    stdin, stdout, stderr = client.exec_command(command, get_pty=True)
    
    # 实时读取输出
    output = ""
    while True:
        line = stdout.readline()
        if not line:
            break
        print(line, end='')
        output += line
    
    return output

def main():
    print("\n" + "="*70)
    print("🔍 检查服务器上的烈焰冲锋者配置")
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
        # 1. 检查源文件中的烈焰冲锋者配置
        print("\n" + "="*70)
        print("📄 检查源文件 monsters.json")
        print("="*70)
        execute_command(client, 
                       'cd /var/www/ai-dungeon/astrocade/src/config/characters && grep -A 8 "monster_fire_charger" monsters.json | head -n 27',
                       "查看烈焰冲锋者配置")
        
        # 2. 检查文件最后修改时间
        execute_command(client,
                       'cd /var/www/ai-dungeon/astrocade/src/config/characters && ls -lh monsters.json',
                       "检查文件修改时间")
        
        # 3. 检查Git状态
        execute_command(client,
                       'cd /var/www/ai-dungeon && git log -1 --oneline',
                       "检查最新Git提交")
        
        # 4. 检查dist目录的配置文件
        print("\n" + "="*70)
        print("📦 检查构建产物")
        print("="*70)
        
        # 查找dist目录中的js文件
        execute_command(client,
                       'cd /var/www/ai-dungeon/astrocade/dist/assets && ls -lh *.js',
                       "查看构建的JS文件")
        
        # 5. 在构建产物中搜索烈焰冲锋者的HP值
        execute_command(client,
                       'cd /var/www/ai-dungeon/astrocade/dist/assets && grep -o "monster_fire_charger.*hp.*[0-9][0-9][0-9]" *.js | head -n 5',
                       "在构建产物中搜索烈焰冲锋者HP")
        
        print("\n" + "="*70)
        print("🔍 诊断完成")
        print("="*70)
        
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


