import Phaser from 'phaser';
import {
  ActivatedBond,
  BondEffectType,
  Character,
  BondBuff,
} from '../types';
import { bondSystem } from './BondSystem';

/**
 * 战斗中的羁绊管理器
 * 负责在战斗场景中应用和管理羁绊效果
 */
export class BondManager {
  private scene: Phaser.Scene;
  private activatedBonds: ActivatedBond[] = [];
  private notificationQueue: Array<{ bondName: string; description: string }> = [];
  private isShowingNotification: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 初始化羁绊系统（战斗开始时调用）
   */
  public initialize(playerTeam: Character[]): void {
    console.log('[BondManager] 初始化羁绊系统，队伍人数:', playerTeam.length);
    
    // 检测并激活羁绊
    this.activatedBonds = bondSystem.checkAndActivateBonds(playerTeam);
    
    console.log(`[BondManager] 激活了 ${this.activatedBonds.length} 个羁绊`);
    this.activatedBonds.forEach((bond) => {
      console.log(`  - ${bond.bond.name} Lv.${bond.level}`);
    });
  }

  /**
   * 获取激活的羁绊列表
   */
  public getActivatedBonds(): ActivatedBond[] {
    return this.activatedBonds;
  }

  /**
   * 获取角色的羁绊buff效果值
   */
  public getBondEffectValue(character: Character, effectType: BondEffectType): number {
    if (!character.bondBuffs) return 0;

    let totalValue = 0;
    for (const buff of character.bondBuffs) {
      if (buff.effectType === effectType) {
        totalValue += buff.value;
      }
    }
    return totalValue;
  }

  /**
   * 检查角色是否有特定羁绊buff
   */
  public hasBondEffect(character: Character, effectType: BondEffectType): boolean {
    if (!character.bondBuffs) return false;
    return character.bondBuffs.some((buff) => buff.effectType === effectType);
  }

  /**
   * 应用伤害加成效果
   */
  public applyDamageBonus(character: Character, baseDamage: number): number {
    let finalDamage = baseDamage;

    // 1. 通用伤害加成
    const damageBonus = this.getBondEffectValue(character, BondEffectType.DAMAGE_PERCENT);
    if (damageBonus > 0) {
      finalDamage *= (1 + damageBonus / 100);
    }

    // 2. 元素伤害加成
    const elementBonus = this.getBondEffectValue(character, BondEffectType.ELEMENT_DAMAGE);
    if (elementBonus > 0 && character.element && character.element !== 'neutral') {
      finalDamage *= (1 + elementBonus / 100);
    }

    // 3. 技能伤害加成
    const skillBonus = this.getBondEffectValue(character, BondEffectType.SKILL_DAMAGE);
    if (skillBonus > 0) {
      finalDamage *= (1 + skillBonus / 100);
    }

    return Math.floor(finalDamage);
  }

  /**
   * 应用暴击判定
   */
  public checkCritical(character: Character): boolean {
    const critRate = this.getBondEffectValue(character, BondEffectType.CRIT_RATE);
    if (critRate <= 0) return false;

    return Math.random() * 100 < critRate;
  }

  /**
   * 应用暴击伤害加成
   */
  public applyCriticalDamage(character: Character, damage: number): number {
    const critDamage = this.getBondEffectValue(character, BondEffectType.CRIT_DAMAGE);
    const multiplier = 1.5 + (critDamage / 100); // 基础暴击1.5倍
    return Math.floor(damage * multiplier);
  }

  /**
   * 应用治疗效果加成
   */
  public applyHealBonus(character: Character, baseHeal: number): number {
    const healBonus = this.getBondEffectValue(character, BondEffectType.HEAL_EFFECT);
    if (healBonus <= 0) return baseHeal;

    return Math.floor(baseHeal * (1 + healBonus / 100));
  }

  /**
   * 应用伤害减免
   */
  public applyDamageReduction(character: Character, incomingDamage: number): number {
    const reduction = this.getBondEffectValue(character, BondEffectType.DAMAGE_REDUCTION);
    if (reduction <= 0) return incomingDamage;

    return Math.floor(incomingDamage * (1 - reduction / 100));
  }

  /**
   * 应用技能CD减少
   */
  public applySkillCDReduction(character: Character, baseCd: number): number {
    const cdReduction = this.getBondEffectValue(character, BondEffectType.SKILL_CD_REDUCTION);
    if (cdReduction <= 0) return baseCd;

    return baseCd * (1 - cdReduction / 100);
  }

  /**
   * 应用闪避判定
   */
  public checkDodge(character: Character): boolean {
    const dodgeRate = this.getBondEffectValue(character, BondEffectType.DODGE);
    if (dodgeRate <= 0) return false;

    return Math.random() * 100 < dodgeRate;
  }

  /**
   * 处理击杀事件（触发某些羁绊效果）
   */
  public onKillEnemy(killer: Character, victim: Character): void {
    // 检查是否有击杀回血效果
    const hpRegenOnKill = this.getBondEffectValue(killer, BondEffectType.HP_REGEN);
    if (hpRegenOnKill > 0) {
      const healAmount = Math.floor(killer.maxHp * (hpRegenOnKill / 100));
      killer.hp = Math.min(killer.maxHp, killer.hp + healAmount);
      
      this.queueNotification('击杀回复', `${killer.name} 回复了 ${healAmount} HP`);
    }

    // 检查是否有技能刷新效果
    if (this.hasBondEffect(killer, BondEffectType.SKILL_CD_REDUCTION)) {
      const cdReduction = this.getBondEffectValue(killer, BondEffectType.SKILL_CD_REDUCTION);
      if (cdReduction >= 100) {
        // 100%CD减少 = 技能刷新
        this.queueNotification('技能刷新', `${killer.name} 的技能已刷新！`);
      }
    }
  }

  /**
   * 处理角色死亡事件
   */
  public onCharacterDeath(character: Character, team: Character[]): void {
    // 检查是否有复活效果
    const reviveChance = this.getBondEffectValue(character, BondEffectType.REVIVE_CHANCE);
    if (reviveChance > 0) {
      if (Math.random() * 100 < reviveChance) {
        character.hp = Math.floor(character.maxHp * 0.4); // 复活40%HP
        this.queueNotification('奇迹复活', `${character.name} 复活了！`);
        return;
      }
    }

    // 触发队友的复仇效果（如果有）
    for (const teammate of team) {
      if (teammate.id === character.id || teammate.hp <= 0) continue;

      // 检查是否有复仇buff
      const revengeBonus = this.getBondEffectValue(teammate, BondEffectType.DAMAGE_PERCENT);
      if (revengeBonus > 0) {
        // 这里可以添加临时buff的逻辑
        this.queueNotification('复仇', `${teammate.name} 进入复仇状态！`);
      }
    }
  }

  /**
   * 获取战斗开始时的护盾值
   */
  public getBattleStartShield(character: Character): number {
    const shieldPercent = this.getBondEffectValue(character, BondEffectType.SHIELD);
    if (shieldPercent <= 0) return 0;

    return Math.floor(character.maxHp * (shieldPercent / 100));
  }

  /**
   * 应用持续回复效果（每秒）
   */
  public applyRegenEffect(character: Character, deltaTime: number): number {
    const regenPercent = this.getBondEffectValue(character, BondEffectType.HP_REGEN);
    if (regenPercent <= 0) return 0;

    // 假设是每4秒回复一次
    const regenAmount = Math.floor(character.maxHp * (regenPercent / 100));
    return regenAmount * (deltaTime / 4000); // 根据deltaTime计算
  }

  /**
   * 添加通知到队列
   */
  private queueNotification(bondName: string, description: string): void {
    this.notificationQueue.push({ bondName, description });
    
    if (!this.isShowingNotification) {
      this.showNextNotification();
    }
  }

  /**
   * 显示下一个通知
   */
  private showNextNotification(): void {
    if (this.notificationQueue.length === 0) {
      this.isShowingNotification = false;
      return;
    }

    this.isShowingNotification = true;
    const notification = this.notificationQueue.shift()!;

    console.log(`[羁绊效果触发] ${notification.bondName}: ${notification.description}`);

    // 在实际实现中，这里会触发UI通知
    // 暂时用console.log代替

    // 2秒后显示下一个通知
    this.scene.time.delayedCall(2000, () => {
      this.showNextNotification();
    });
  }

  /**
   * 获取角色的所有羁绊buff描述
   */
  public getCharacterBondBuffs(character: Character): BondBuff[] {
    return character.bondBuffs || [];
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.activatedBonds = [];
    this.notificationQueue = [];
    this.isShowingNotification = false;
  }
}

