#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
关卡快速配置脚本 - AI Dungeon
使用简化的Python代码快速配置关卡
"""

import json
import os

# 可用的怪物列表
MONSTERS = {
    "训练假人·攻击型": "monster_training_dummy_attack",
    "训练假人·防御型": "monster_training_dummy_defense",
    "训练假人·突袭型": "monster_training_dummy_control",
    "熔岩巨兽": "monster_magma_brute",
    "火焰哨兵": "monster_flame_sentinel",
    "火山投石手": "monster_rock_thrower_001",
    "烈焰卫士": "monster_fire_tank",
    "火焰祭司": "monster_fire_healer",
    "火焰法师": "monster_fire_mage",
    "烈焰冲锋者·甲": "monster_fire_charger_001",
    "烈焰冲锋者·乙": "monster_fire_charger_002",
    "烈焰冲锋者·丙": "monster_fire_charger_003",
    "Boss火山领主": "boss_volcano_lord"
}


class LevelBuilder:
    """关卡构建器"""
    
    def __init__(self, level_id):
        self.config = {
            "id": level_id,
            "name": f"第{level_id}关",
            "description": "",
            "difficulty": "新手",
            "scene": "volcano",
            "unlocked": level_id == 1,
            "duration": 60,
            "burnDamage": 5,
            "lavaBlocks": [],
            "enemies": []
        }
    
    def set_name(self, name):
        """设置关卡名称"""
        self.config["name"] = name
        return self
    
    def set_description(self, description):
        """设置关卡描述"""
        self.config["description"] = description
        return self
    
    def set_difficulty(self, difficulty):
        """设置难度: 新手, 简单, 中等, 困难, Boss"""
        self.config["difficulty"] = difficulty
        return self
    
    def set_duration(self, duration):
        """设置时长（秒）"""
        self.config["duration"] = duration
        return self
    
    def set_burn_damage(self, damage):
        """设置环境燃烧伤害（每秒）"""
        self.config["burnDamage"] = damage
        return self
    
    def set_scene(self, scene):
        """设置场景: volcano, ice, forest, desert"""
        self.config["scene"] = scene
        return self
    
    def add_enemy(self, monster_name, x=0, y=0):
        """
        添加敌人
        monster_name: 怪物名称（中文）
        x, y: 位置坐标 (0-2)
        """
        monster_id = MONSTERS.get(monster_name)
        if not monster_id:
            print(f"⚠️ 警告: 未找到怪物 '{monster_name}'")
            return self
        
        self.config["enemies"].append({
            "characterId": monster_id,
            "position": {"x": x, "y": y}
        })
        return self
    
    def add_lava_block(self, row, col):
        """添加熔岩地块"""
        self.config["lavaBlocks"].append({"row": row, "col": col})
        return self
    
    def build(self):
        """构建并返回配置"""
        return self.config


def create_level_1():
    """第1关：训练场"""
    return (LevelBuilder(1)
        .set_name("火山入口·训练场")
        .set_description("遭遇训练假人！三个不同类型的假人展示不同技能：攻击型（输出）、防御型（护盾）、突袭型（控制）。击败它们学习基础战术！环境燃烧每秒造成3点伤害")
        .set_difficulty("新手")
        .set_duration(55)
        .set_burn_damage(3)
        .add_enemy("训练假人·攻击型", 0, 0)
        .add_enemy("训练假人·防御型", 1, 1)
        .add_enemy("训练假人·突袭型", 2, 2)
        .build()
    )


def create_level_2():
    """第2关：熔岩小径"""
    return (LevelBuilder(2)
        .set_name("熔岩小径")
        .set_description("遭遇熔岩巨兽！它有强大的护盾，配合两个远程射手。注意优先击杀后排！环境燃烧每秒造成8点伤害")
        .set_difficulty("简单")
        .set_duration(60)
        .set_burn_damage(8)
        .add_lava_block(2, 5)
        .add_enemy("熔岩巨兽", 1, 0)
        .add_enemy("火焰哨兵", 0, 1)
        .add_enemy("火山投石手", 2, 1)
        .build()
    )


def create_level_3():
    """第3关：火山通道"""
    return (LevelBuilder(3)
        .set_name("火山通道")
        .set_description("🔥全火元素队伍🔥 烈焰卫士（肉盾）保护着火焰祭司（治疗）和火焰法师（AOE）。他们会互相配合！环境燃烧每秒造成12点伤害")
        .set_difficulty("中等")
        .set_duration(70)
        .set_burn_damage(12)
        .add_lava_block(1, 4)
        .add_lava_block(3, 6)
        .add_enemy("烈焰卫士", 1, 0)
        .add_enemy("火焰祭司", 0, 1)
        .add_enemy("火焰法师", 2, 1)
        .build()
    )


def create_level_4():
    """第4关：熔岩核心"""
    return (LevelBuilder(4)
        .set_name("熔岩核心")
        .set_description("⚡突袭关卡⚡ 三个烈焰冲锋者会快速突进到你的后排！必须做好防御准备，保护脆皮！环境燃烧每秒造成15点伤害")
        .set_difficulty("困难")
        .set_duration(70)
        .set_burn_damage(15)
        .add_lava_block(1, 4)
        .add_lava_block(3, 6)
        .add_enemy("烈焰冲锋者·甲", 0, 0)
        .add_enemy("烈焰冲锋者·乙", 1, 1)
        .add_enemy("烈焰冲锋者·丙", 2, 2)
        .build()
    )


def create_level_5():
    """第5关：火山领主的挑战"""
    return (LevelBuilder(5)
        .set_name("火山领主的挑战")
        .set_description("👑终极Boss战👑 火山领主·伊格尼斯拥有炼狱波动和熔岩柱两大毁灭技能！带上最强队伍，击败他！环境燃烧每秒造成15点伤害")
        .set_difficulty("Boss")
        .set_duration(70)
        .set_burn_damage(15)
        .add_lava_block(1, 5)
        .add_lava_block(2, 4)
        .add_lava_block(2, 6)
        .add_lava_block(3, 5)
        .add_enemy("Boss火山领主", 1, 1)
        .build()
    )


def generate_levels():
    """生成所有关卡配置"""
    levels = [
        create_level_1(),
        create_level_2(),
        create_level_3(),
        create_level_4(),
        create_level_5()
    ]
    return levels


def save_to_file(levels, filename="levels.json"):
    """保存到文件"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(levels, f, ensure_ascii=False, indent=2)
    print(f"✅ 配置已保存到: {filename}")


def display_summary(levels):
    """显示关卡摘要"""
    print("\n" + "="*60)
    print("📋 关卡配置摘要")
    print("="*60)
    
    for level in levels:
        print(f"\n【第{level['id']}关】{level['name']}")
        print(f"  难度: {level['difficulty']}")
        print(f"  时长: {level['duration']}秒")
        print(f"  环境伤害: {level['burnDamage']}/秒")
        print(f"  敌人数量: {len(level['enemies'])}")
        print(f"  熔岩地块: {len(level['lavaBlocks'])}个")
        
        if level['enemies']:
            print(f"  敌人列表:")
            for i, enemy in enumerate(level['enemies'], 1):
                # 查找怪物名称
                monster_name = next((k for k, v in MONSTERS.items() if v == enemy['characterId']), "未知")
                pos = enemy['position']
                print(f"    {i}. {monster_name} - 位置({pos['x']}, {pos['y']})")
    
    print("\n" + "="*60)


def print_monster_list():
    """打印可用的怪物列表"""
    print("\n📋 可用怪物列表:")
    print("="*60)
    for name, id in MONSTERS.items():
        print(f"  - {name} ({id})")
    print("="*60)


def quick_config():
    """快速配置向导"""
    print("\n" + "="*60)
    print("🎮 关卡快速配置向导")
    print("="*60)
    
    level_id = int(input("\n请输入关卡ID (1-10): "))
    
    builder = LevelBuilder(level_id)
    
    name = input("关卡名称: ")
    if name:
        builder.set_name(name)
    
    description = input("关卡描述: ")
    if description:
        builder.set_description(description)
    
    difficulty = input("难度 (新手/简单/中等/困难/Boss) [默认: 新手]: ") or "新手"
    builder.set_difficulty(difficulty)
    
    duration = input("时长（秒）[默认: 60]: ")
    if duration:
        builder.set_duration(int(duration))
    
    burn_damage = input("环境燃烧伤害/秒 [默认: 5]: ")
    if burn_damage:
        builder.set_burn_damage(int(burn_damage))
    
    print("\n添加敌人 (输入空行结束):")
    print_monster_list()
    
    while True:
        monster_name = input("\n怪物名称: ")
        if not monster_name:
            break
        
        x = int(input("位置 X (0-2): "))
        y = int(input("位置 Y (0-2): "))
        
        builder.add_enemy(monster_name, x, y)
        print(f"✅ 已添加: {monster_name} at ({x}, {y})")
    
    print("\n添加熔岩地块 (输入空行结束):")
    while True:
        row = input("行 (输入空行结束): ")
        if not row:
            break
        col = input("列: ")
        builder.add_lava_block(int(row), int(col))
        print(f"✅ 已添加熔岩地块: ({row}, {col})")
    
    level = builder.build()
    print("\n✅ 关卡配置完成！")
    print(json.dumps(level, ensure_ascii=False, indent=2))
    
    save = input("\n是否保存到文件? (y/n): ")
    if save.lower() == 'y':
        filename = f"level_{level_id}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(level, f, ensure_ascii=False, indent=2)
        print(f"✅ 已保存到: {filename}")


def main():
    """主函数"""
    print("\n" + "="*60)
    print("🎮 AI Dungeon - 关卡配置工具")
    print("="*60)
    print("\n选择操作:")
    print("  1. 生成默认5关配置")
    print("  2. 快速配置向导")
    print("  3. 查看可用怪物列表")
    print("  4. 退出")
    
    choice = input("\n请选择 (1-4): ")
    
    if choice == '1':
        levels = generate_levels()
        display_summary(levels)
        save = input("\n是否保存到 levels.json? (y/n): ")
        if save.lower() == 'y':
            save_to_file(levels)
            print("\n💡 提示: 将生成的 levels.json 复制到 astrocade/src/config/ 目录")
    
    elif choice == '2':
        quick_config()
    
    elif choice == '3':
        print_monster_list()
    
    elif choice == '4':
        print("👋 再见！")
        return
    
    else:
        print("❌ 无效选择")


if __name__ == "__main__":
    main()

