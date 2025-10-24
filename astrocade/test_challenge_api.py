#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试挑战API
"""

import os
import sys
import io
import json

# 设置UTF-8输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def install_paramiko():
    """安装paramiko库"""
    print("正在安装 paramiko 库...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "-q"])
    print("[OK] paramiko 安装完成")

def test_challenge():
    """测试挑战API"""
    try:
        import paramiko
    except ImportError:
        install_paramiko()
        import paramiko
    
    SERVER = "43.173.170.5"
    USERNAME = "ubuntu"
    PASSWORD = "MTc1MjA0NDQ0MQ"
    
    print("\n" + "="*60)
    print("  [测试] 挑战API")
    print("="*60)
    
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SERVER, username=USERNAME, password=PASSWORD)
        print("[OK] SSH连接成功")
        
        # 读取玩家数据
        print("\n[1] 读取玩家数据...")
        stdin, stdout, stderr = ssh.exec_command('cat /home/ubuntu/astrocade-backend/data/players.json')
        players_data = stdout.read().decode()
        players = json.loads(players_data) if players_data.strip() else []
        
        print(f"    总玩家数: {len(players)}")
        for p in players:
            print(f"    - ID: {p['id'][:30]}...")
            print(f"      名字: {p['playerName']}")
            print(f"      排名: {p.get('currentRank', 'None')}")
        
        # 检查是否有预设NPC
        print("\n[2] 检查预设NPC...")
        npc_count = sum(1 for p in players if 'preset_npc' in p['id'])
        real_player_count = len(players) - npc_count
        print(f"    预设NPC: {npc_count}")
        print(f"    真实玩家: {real_player_count}")
        
        if npc_count == 0:
            print("    [WARN] 没有预设NPC！这是问题所在！")
            print("    玩家挑战的是前端预设的NPC，但后端没有这些NPC数据！")
        
        # 检查挑战记录
        print("\n[3] 检查挑战记录...")
        stdin, stdout, stderr = ssh.exec_command('cat /home/ubuntu/astrocade-backend/data/challenges.json 2>/dev/null || echo "[]"')
        challenges_data = stdout.read().decode()
        challenges = json.loads(challenges_data) if challenges_data.strip() else []
        
        print(f"    挑战记录数: {len(challenges)}")
        if len(challenges) > 0:
            print("    最近的挑战:")
            for c in challenges[-3:]:
                print(f"    - 攻击者: {c.get('attackerId', 'Unknown')[:30]}...")
                print(f"      防守者: {c.get('defenderId', 'Unknown')[:30]}...")
                print(f"      结果: {c.get('result', 'Unknown')}")
                print(f"      攻击者排名变化: {c.get('attackerRankBefore')} -> {c.get('attackerRankAfter')}")
        else:
            print("    [WARN] 没有挑战记录！")
        
        ssh.close()
        
        print("\n" + "="*60)
        print("  [诊断结果]")
        print("="*60)
        
        if npc_count == 0:
            print("\n⚠️ 问题确认：")
            print("1. 后端没有预设NPC数据")
            print("2. 玩家挑战的是前端生成的模拟NPC")
            print("3. 但这些NPC在后端不存在")
            print("4. 导致挑战请求失败或被拒绝")
            print("\n解决方案：")
            print("A. 在后端初始化30个预设NPC")
            print("B. 或者确保前端在在线模式下只显示后端的玩家")
        
        print()
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_challenge()

