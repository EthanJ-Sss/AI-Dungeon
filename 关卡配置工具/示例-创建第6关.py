#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
示例：创建第6关 - 冰霜峡谷

这个示例展示如何使用 LevelBuilder 快速创建一个新关卡
"""

from quick_config import LevelBuilder
import json


def create_level_6():
    """
    创建第6关：冰霜峡谷
    
    设计思路:
    - 难度：困难
    - 主题：冰霜+火焰混合
    - 敌人组合：2个坦克 + 1个治疗
    - 战术：需要优先击杀治疗
    """
    
    level = (LevelBuilder(6)
        # 基础信息
        .set_name("冰霜峡谷")
        .set_description("❄️冰与火的交锋❄️ 两个强大的守卫保护着治疗者。必须突破防线，击败治疗！环境燃烧每秒造成18点伤害")
        
        # 难度设置
        .set_difficulty("困难")
        .set_duration(75)
        .set_burn_damage(18)
        .set_scene("volcano")
        
        # 添加熔岩地块（增加难度）
        .add_lava_block(1, 4)
        .add_lava_block(2, 5)
        .add_lava_block(3, 4)
        
        # 添加敌人
        # 前排：2个坦克
        .add_enemy("熔岩巨兽", x=0, y=0)  # 左前
        .add_enemy("烈焰卫士", x=2, y=0)  # 右前
        
        # 后排：1个治疗（重点保护目标）
        .add_enemy("火焰祭司", x=1, y=1)  # 中后
        
        .build()
    )
    
    return level


def create_level_7():
    """
    创建第7关：烈焰突袭
    
    设计思路:
    - 难度：困难
    - 主题：全员突袭
    - 敌人组合：4个快速冲锋者
    - 战术：极限考验后排保护
    """
    
    level = (LevelBuilder(7)
        .set_name("烈焰突袭")
        .set_description("⚡极限突袭⚡ 四个烈焰冲锋者同时冲向你的后排！这是对防御的终极考验！环境燃烧每秒造成20点伤害")
        
        .set_difficulty("困难")
        .set_duration(70)
        .set_burn_damage(20)
        
        .add_lava_block(1, 5)
        .add_lava_block(3, 5)
        
        # 4个冲锋者，分散站位
        .add_enemy("烈焰冲锋者·甲", x=0, y=0)
        .add_enemy("烈焰冲锋者·乙", x=2, y=0)
        .add_enemy("烈焰冲锋者·丙", x=0, y=2)
        .add_enemy("烈焰冲锋者·甲", x=2, y=2)  # 复用ID
        
        .build()
    )
    
    return level


def create_level_8():
    """
    创建第8关：精英小队
    
    设计思路:
    - 难度：Boss
    - 主题：完美配合的精英队伍
    - 敌人组合：坦克+治疗+2法师
    - 战术：需要完美的策略
    """
    
    level = (LevelBuilder(8)
        .set_name("精英小队")
        .set_description("👑精英挑战👑 一个完美配合的精英小队！坦克保护，治疗支援，双法师输出。这是真正的挑战！环境燃烧每秒造成22点伤害")
        
        .set_difficulty("Boss")
        .set_duration(80)
        .set_burn_damage(22)
        .set_scene("volcano")
        
        # 十字形熔岩地块
        .add_lava_block(2, 4)
        .add_lava_block(1, 5)
        .add_lava_block(2, 5)
        .add_lava_block(3, 5)
        .add_lava_block(2, 6)
        
        # 前排坦克
        .add_enemy("熔岩巨兽", x=1, y=0)
        
        # 后排：治疗+双法师
        .add_enemy("火焰祭司", x=1, y=1)  # 中后（治疗）
        .add_enemy("火焰法师", x=0, y=1)  # 左后（法师）
        .add_enemy("火焰法师", x=2, y=1)  # 右后（法师）
        
        .build()
    )
    
    return level


def display_level(level):
    """显示关卡信息"""
    print(f"\n{'='*60}")
    print(f"【第{level['id']}关】{level['name']}")
    print(f"{'='*60}")
    print(f"难度: {level['difficulty']}")
    print(f"描述: {level['description']}")
    print(f"时长: {level['duration']}秒")
    print(f"环境伤害: {level['burnDamage']}/秒")
    print(f"熔岩地块: {len(level['lavaBlocks'])}个")
    print(f"\n敌人配置:")
    for i, enemy in enumerate(level['enemies'], 1):
        pos = enemy['position']
        print(f"  {i}. {enemy['characterId']} - 位置({pos['x']}, {pos['y']})")
    print(f"{'='*60}\n")


def main():
    """主函数"""
    print("\n🎮 创建新关卡示例")
    print("="*60)
    
    # 创建3个新关卡
    level6 = create_level_6()
    level7 = create_level_7()
    level8 = create_level_8()
    
    # 显示信息
    display_level(level6)
    display_level(level7)
    display_level(level8)
    
    # 组合成数组
    new_levels = [level6, level7, level8]
    
    # 保存到文件
    output_file = "new_levels_6-8.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(new_levels, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 已生成{len(new_levels)}个新关卡")
    print(f"📁 保存到: {output_file}")
    print(f"\n💡 使用方法:")
    print(f"   1. 查看 {output_file} 中的配置")
    print(f"   2. 复制到 astrocade/src/config/levels.json")
    print(f"   3. 追加到现有关卡数组中")
    print(f"   4. npm run build && 部署")
    
    # 显示JSON预览
    print(f"\n📋 JSON预览（第6关）:")
    print("-"*60)
    print(json.dumps(level6, ensure_ascii=False, indent=2))
    print("-"*60)


if __name__ == "__main__":
    main()

