#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
调试排名问题
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

def debug_ranking():
    """调试排名"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [调试] 排名系统")
    print("="*60)
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 检查后端数据
        print("\n[1] 检查后端玩家数据...")
        stdin, stdout, stderr = ssh.exec_command('cat /home/ubuntu/astrocade-backend/data/players.json 2>/dev/null || echo "[]"')
        players_data = stdout.read().decode()
        
        if players_data and players_data.strip() != "[]":
            print("    后端玩家数据:")
            import json
            try:
                players = json.loads(players_data)
                print(f"    总玩家数: {len(players)}")
                for p in players[:5]:  # 只显示前5个
                    print(f"    - {p.get('playerName', 'Unknown')}: 排名 {p.get('currentRank', 'null')}, 胜场 {p.get('totalWins', 0)}")
            except:
                print("    [ERROR] JSON解析失败")
                print(players_data[:500])
        else:
            print("    [WARN] 没有玩家数据")
        
        # 检查后端日志
        print("\n[2] 检查后端最近日志...")
        stdin, stdout, stderr = ssh.exec_command('tail -30 /home/ubuntu/astrocade-backend/backend.log 2>/dev/null || echo "无日志"')
        log = stdout.read().decode()
        print("    最近日志:")
        for line in log.split('\n')[-10:]:
            if line.strip():
                print(f"    {line}")
        
        # 测试API
        print("\n[3] 测试API端点...")
        
        # 测试health
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:3001/api/health')
        health = stdout.read().decode()
        print(f"    /api/health: {health[:100]}")
        
        # 测试leaderboard
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:3001/api/leaderboard')
        leaderboard = stdout.read().decode()
        print(f"    /api/leaderboard: {leaderboard[:200]}...")
        
        # 通过代理测试
        print("\n[4] 测试Apache代理...")
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:8080/api/health')
        proxy_health = stdout.read().decode()
        print(f"    /api/health (proxy): {proxy_health[:100]}")
        
        stdin, stdout, stderr = ssh.exec_command('curl -s http://localhost:8080/api/leaderboard')
        proxy_leaderboard = stdout.read().decode()
        print(f"    /api/leaderboard (proxy): {proxy_leaderboard[:200]}...")
        
        ssh.close()
        
        print("\n" + "="*60)
        print("  [完成] 调试结束")
        print("="*60)
        print("\n请检查:")
        print("1. 后端数据是否更新")
        print("2. API是否返回正确数据")
        print("3. 代理是否工作正常")
        print()
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_ranking()


