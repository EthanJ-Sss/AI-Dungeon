import type { BuffConfig, BuffInstance, BattleUnit } from '../types';
import buffsData from '../config/buffs.json';

export class BuffManager {
  private static buffConfigs: Map<string, BuffConfig> = new Map();

  /**
   * 初始化BUFF配置
   */
  static init() {
    buffsData.forEach((buff) => {
      this.buffConfigs.set(buff.id, buff as BuffConfig);
    });
    console.log(`[BuffManager] 加载了 ${this.buffConfigs.size} 个BUFF配置`);
  }

  /**
   * 获取BUFF配置
   */
  static getBuffConfig(buffId: string): BuffConfig | undefined {
    return this.buffConfigs.get(buffId);
  }

  /**
   * 给单位添加BUFF
   */
  static addBuff(unit: BattleUnit, buffId: string, currentTime: number): boolean {
    const config = this.getBuffConfig(buffId);
    if (!config) {
      console.warn(`[BuffManager] 找不到BUFF配置: ${buffId}`);
      return false;
    }

    if (!unit.buffs) {
      unit.buffs = [];
    }

    // 检查是否已有相同BUFF
    const existingBuff = unit.buffs.find(b => b.config.id === buffId);
    if (existingBuff) {
      // 刷新持续时间
      existingBuff.remainingDuration = config.duration;
      existingBuff.lastTickTime = currentTime;
      console.log(`[BuffManager] 刷新BUFF: ${config.name} on ${unit.character.name}`);
      return true;
    }

    // 添加新BUFF
    const buffInstance: BuffInstance = {
      config,
      remainingDuration: config.duration,
      lastTickTime: currentTime,
    };

    unit.buffs.push(buffInstance);
    console.log(`[BuffManager] 添加BUFF: ${config.name} to ${unit.character.name}`);
    return true;
  }

  /**
   * 更新BUFF（每帧调用）
   */
  static updateBuffs(unit: BattleUnit, currentTime: number, deltaSeconds: number): void {
    if (!unit.buffs || unit.buffs.length === 0) return;

    const expiredBuffs: BuffInstance[] = [];

    unit.buffs.forEach((buff) => {
      // 更新持续时间
      buff.remainingDuration -= deltaSeconds;

      // 处理BUFF效果（每秒tick一次）
      const timeSinceLastTick = (currentTime - buff.lastTickTime) / 1000;
      if (timeSinceLastTick >= 1) {
        this.applyBuffEffect(unit, buff);
        buff.lastTickTime = currentTime;
      }

      // 标记过期BUFF
      if (buff.remainingDuration <= 0) {
        expiredBuffs.push(buff);
      }
    });

    // 移除过期BUFF
    if (expiredBuffs.length > 0) {
      unit.buffs = unit.buffs.filter(b => !expiredBuffs.includes(b));
      expiredBuffs.forEach(buff => {
        console.log(`[BuffManager] BUFF过期: ${buff.config.name} on ${unit.character.name}`);
      });
    }
  }

  /**
   * 应用BUFF效果
   */
  private static applyBuffEffect(unit: BattleUnit, buff: BuffInstance): void {
    const config = buff.config;

    switch (config.type) {
      case 'damage':
        // 持续伤害（燃烧、中毒、流血）
        if (config.damagePerSecond && unit.isAlive) {
          const damage = config.damagePerSecond;
          unit.currentHp = Math.max(0, unit.currentHp - damage);
          console.log(`[BuffManager] ${buff.config.name} 造成 ${damage} 伤害 to ${unit.character.name} (剩余HP: ${unit.currentHp})`);
          
          // 检查死亡
          if (unit.currentHp <= 0 && unit.isAlive) {
            unit.isAlive = false;
            console.log(`[BuffManager] ${unit.character.name} 被 ${buff.config.name} 击杀！`);
          }
        }
        break;

      case 'heal':
        // 持续治疗
        if (config.healPerSecond && unit.isAlive) {
          const heal = config.healPerSecond;
          unit.currentHp = Math.min(unit.character.maxHp, unit.currentHp + heal);
          console.log(`[BuffManager] ${buff.config.name} 治疗 ${heal} to ${unit.character.name} (当前HP: ${unit.currentHp})`);
        }
        break;

      case 'combo':
        // 组合型BUFF（如沼泽瘴气：减速+中毒）
        if (config.damagePerSecond && unit.isAlive) {
          const damage = config.damagePerSecond;
          unit.currentHp = Math.max(0, unit.currentHp - damage);
          console.log(`[BuffManager] ${buff.config.name} 造成 ${damage} 伤害 to ${unit.character.name} (剩余HP: ${unit.currentHp})`);
          
          if (unit.currentHp <= 0 && unit.isAlive) {
            unit.isAlive = false;
            console.log(`[BuffManager] ${unit.character.name} 被 ${buff.config.name} 击杀！`);
          }
        }
        break;

      case 'slow':
      case 'haste':
      case 'attack_up':
      case 'attack_down':
      case 'stun':
      case 'shield':
        // 这些BUFF的效果在其他方法中处理
        break;
    }
  }

  /**
   * 获取单位的有效移动速度（考虑BUFF效果）
   */
  static getEffectiveMoveSpeed(unit: BattleUnit): number {
    let baseSpeed = unit.character.moveSpeed;

    if (!unit.buffs || unit.buffs.length === 0) {
      return baseSpeed;
    }

    let speedMultiplier = 1.0;

    unit.buffs.forEach((buff) => {
      if (buff.config.type === 'slow' && buff.config.slowPercent) {
        speedMultiplier *= (1 - buff.config.slowPercent / 100);
      } else if (buff.config.type === 'haste' && buff.config.hastePercent) {
        speedMultiplier *= (1 + buff.config.hastePercent / 100);
      } else if (buff.config.type === 'combo' && buff.config.slowPercent) {
        // 组合型BUFF的减速效果
        speedMultiplier *= (1 - buff.config.slowPercent / 100);
      }
    });

    return baseSpeed * speedMultiplier;
  }

  /**
   * 获取单位的有效攻击力（考虑BUFF效果）
   */
  static getEffectiveAttackDamage(unit: BattleUnit): number {
    let baseDamage = unit.character.damage;

    if (!unit.buffs || unit.buffs.length === 0) {
      return baseDamage;
    }

    let damageMultiplier = 1.0;

    unit.buffs.forEach((buff) => {
      if (buff.config.type === 'attack_up' && buff.config.attackBonus) {
        damageMultiplier *= (1 + buff.config.attackBonus / 100);
      } else if (buff.config.type === 'attack_down' && buff.config.attackPenalty) {
        damageMultiplier *= (1 - buff.config.attackPenalty / 100);
      }
    });

    return baseDamage * damageMultiplier;
  }

  /**
   * 检查单位是否被眩晕
   */
  static isStunned(unit: BattleUnit): boolean {
    if (!unit.buffs || unit.buffs.length === 0) {
      return false;
    }

    return unit.buffs.some(buff => buff.config.type === 'stun');
  }

  /**
   * 计算受到的伤害（考虑护盾减伤）
   */
  static calculateDamageAfterShield(unit: BattleUnit, baseDamage: number): number {
    if (!unit.buffs || unit.buffs.length === 0) {
      return baseDamage;
    }

    let damageReduction = 0;

    unit.buffs.forEach((buff) => {
      if (buff.config.type === 'shield' && buff.config.damageReduction) {
        damageReduction += buff.config.damageReduction;
      }
    });

    // 最多减免90%
    damageReduction = Math.min(damageReduction, 90);

    return baseDamage * (1 - damageReduction / 100);
  }

  /**
   * 移除所有BUFF
   */
  static clearBuffs(unit: BattleUnit): void {
    unit.buffs = [];
  }

  /**
   * 获取单位当前BUFF数量
   */
  static getBuffCount(unit: BattleUnit): number {
    return unit.buffs?.length || 0;
  }
}

