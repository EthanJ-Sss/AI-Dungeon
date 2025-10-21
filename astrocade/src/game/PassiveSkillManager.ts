import type { BattleUnit } from '../types';
import passiveSkillsData from '../config/passiveSkills.json';

export interface PassiveSkillConfig {
  id: string;
  name: string;
  type: string;
  trigger: string;
  effect: Record<string, number>;
  description: string;
}

const passiveSkillConfigsMap: Map<string, PassiveSkillConfig> = new Map();

export class PassiveSkillManager {
  static init() {
    passiveSkillConfigsMap.clear();
    passiveSkillsData.forEach((skill) => {
      passiveSkillConfigsMap.set(skill.id, skill as PassiveSkillConfig);
    });
    console.log(`[PassiveSkillManager] 初始化完成，加载了 ${passiveSkillConfigsMap.size} 个被动技能`);
  }

  static getPassiveSkillConfig(skillId: string): PassiveSkillConfig | undefined {
    return passiveSkillConfigsMap.get(skillId);
  }

  /**
   * 应用被动技能的属性加成
   * @param unit 战斗单位
   * @returns 修改后的属性
   */
  static applyPassiveStats(unit: BattleUnit): {
    damageMultiplier: number;
    hpMultiplier: number;
  } {
    let damageMultiplier = 1.0;
    let hpMultiplier = 1.0;

    if (!unit.character.passiveSkills) return { damageMultiplier, hpMultiplier };

    unit.character.passiveSkills.forEach(skillId => {
      const config = this.getPassiveSkillConfig(skillId);
      if (!config) return;

      // 攻击强化
      if (config.effect.damageBonus) {
        damageMultiplier += config.effect.damageBonus / 100;
      }

      // 生命强化
      if (config.effect.hpBonus) {
        hpMultiplier += config.effect.hpBonus / 100;
      }

      // 火焰抗性的攻击加成
      if (config.effect.damageBonus && config.type === 'resistance') {
        damageMultiplier += config.effect.damageBonus / 100;
      }
    });

    return { damageMultiplier, hpMultiplier };
  }

  /**
   * 计算BUFF伤害的减免
   * @param unit 战斗单位
   * @param buffType BUFF类型
   * @param baseDamage 基础伤害
   * @returns 实际伤害
   */
  static calculateBuffDamage(unit: BattleUnit, buffType: string, baseDamage: number): number {
    if (!unit.character.passiveSkills) return baseDamage;

    let resistance = 0;

    unit.character.passiveSkills.forEach(skillId => {
      const config = this.getPassiveSkillConfig(skillId);
      if (!config) return;

      // 火焰抗性
      if (buffType === 'burn' && config.effect.resistBurn) {
        resistance += config.effect.resistBurn;
      }

      // 沼泽适应 - 中毒抗性
      if (buffType === 'poison' && config.effect.resistPoison) {
        resistance += config.effect.resistPoison;
      }

      // 燃烧免疫光环 (简化实现，自身也受益)
      if (buffType === 'burn' && config.effect.resistBurnAura) {
        resistance += config.effect.resistBurnAura;
      }
    });

    // 最多减免90%
    resistance = Math.min(resistance, 90);
    
    return baseDamage * (1 - resistance / 100);
  }

  /**
   * 计算减速效果的减免
   * @param unit 战斗单位
   * @param slowPercent 基础减速百分比
   * @returns 实际减速百分比
   */
  static calculateSlowResistance(unit: BattleUnit, slowPercent: number): number {
    if (!unit.character.passiveSkills) return slowPercent;

    let resistance = 0;

    unit.character.passiveSkills.forEach(skillId => {
      const config = this.getPassiveSkillConfig(skillId);
      if (!config) return;

      // 沼泽适应 - 减速抗性
      if (config.effect.resistSlow) {
        resistance += config.effect.resistSlow;
      }
    });

    // 最多减免90%
    resistance = Math.min(resistance, 90);
    
    return slowPercent * (1 - resistance / 100);
  }

  /**
   * 检查单位是否有燃烧回复被动
   * @param unit 战斗单位
   * @returns 回复百分比（每秒）
   */
  static getBurnHeal(unit: BattleUnit): number {
    if (!unit.character.passiveSkills) return 0;

    let healPercent = 0;

    unit.character.passiveSkills.forEach(skillId => {
      const config = this.getPassiveSkillConfig(skillId);
      if (!config) return;

      if (config.trigger === 'on_burn' && config.effect.healPercentPerSecond) {
        healPercent += config.effect.healPercentPerSecond;
      }
    });

    return healPercent;
  }

  /**
   * 检查单位攻击是否附带减速效果
   * @param unit 战斗单位
   * @returns { slowPercent, duration } 或 null
   */
  static getAttackSlowEffect(unit: BattleUnit): { slowPercent: number; duration: number } | null {
    if (!unit.character.passiveSkills) return null;

    for (const skillId of unit.character.passiveSkills) {
      const config = this.getPassiveSkillConfig(skillId);
      if (!config) continue;

      if (config.trigger === 'on_attack' && config.effect.applySlowPercent) {
        return {
          slowPercent: config.effect.applySlowPercent,
          duration: config.effect.slowDuration || 1.5,
        };
      }
    }

    return null;
  }

  /**
   * 计算中毒伤害加成
   * @param unit 战斗单位（施加中毒的单位）
   * @param baseDamage 基础中毒伤害
   * @returns 实际中毒伤害
   */
  static calculatePoisonDamageBonus(unit: BattleUnit, baseDamage: number): number {
    if (!unit.character.passiveSkills) return baseDamage;

    let bonusPercent = 0;

    unit.character.passiveSkills.forEach(skillId => {
      const config = this.getPassiveSkillConfig(skillId);
      if (!config) return;

      if (config.effect.poisonDamageBonus) {
        bonusPercent += config.effect.poisonDamageBonus;
      }
    });

    return baseDamage * (1 + bonusPercent / 100);
  }
}

