import {
  BondConfig,
  BondLevel,
  ActivatedBond,
  Character,
  AppliedBondEffect,
  BondBuff,
  BondEffectType,
} from '../types';
import bondsConfig from '../config/bonds.json';

/**
 * 羁绊系统核心类
 * 负责检测和应用羁绊效果
 */
export class BondSystem {
  private bonds: BondConfig[];
  private activatedBonds: ActivatedBond[] = [];

  constructor() {
    this.bonds = bondsConfig as BondConfig[];
  }

  /**
   * 检测并激活羁绊
   * @param team 队伍角色列表
   * @returns 激活的羁绊列表
   */
  public checkAndActivateBonds(team: Character[]): ActivatedBond[] {
    this.activatedBonds = [];

    // 1. 检查所有羁绊
    for (const bond of this.bonds) {
      const activation = this.checkBondActivation(bond, team);

      if (activation) {
        this.activatedBonds.push(activation);
      }
    }

    // 2. 按优先级排序
    this.activatedBonds.sort((a, b) => b.bond.ui.priority - a.bond.ui.priority);

    // 3. 应用羁绊效果
    this.applyBondEffects(team);

    return this.activatedBonds;
  }

  /**
   * 检查单个羁绊是否激活
   */
  private checkBondActivation(bond: BondConfig, team: Character[]): ActivatedBond | null {
    // 故事羁绊：检查指定角色
    if (bond.activation.exactCharacters && bond.activation.exactCharacters.length > 0) {
      const hasAll = bond.activation.exactCharacters.every((charId) =>
        team.some((char) => char.id === charId)
      );

      if (!hasAll) return null;

      const triggeredChars = team.filter((char) =>
        bond.activation.exactCharacters!.includes(char.id)
      );

      return this.createActivatedBond(bond, triggeredChars, 1);
    }

    // 标签羁绊：统计匹配数量
    const matchedChars = team.filter((char) =>
      bond.activation.requiredTags.some((tag) => char.bondTags?.includes(tag))
    );

    if (matchedChars.length < bond.activation.minCount) {
      return null;
    }

    // 确定激活等级
    const level = this.calculateBondLevel(bond, matchedChars.length);

    if (level === 0) return null;

    return this.createActivatedBond(bond, matchedChars, level);
  }

  /**
   * 计算羁绊等级
   */
  private calculateBondLevel(bond: BondConfig, count: number): number {
    let level = 0;

    for (const bondLevel of bond.levels) {
      if (count >= bondLevel.requiredCount) {
        level = bondLevel.level;
      }
    }

    return level;
  }

  /**
   * 创建激活的羁绊对象
   */
  private createActivatedBond(
    bond: BondConfig,
    characters: Character[],
    level: number
  ): ActivatedBond {
    const bondLevel = bond.levels.find((l) => l.level === level)!;

    return {
      bond,
      level,
      triggeredCharacters: characters,
      effects: bondLevel.effects.map((effect) => ({
        effect,
        targets: this.getEffectTargets(effect, characters, characters),
        value: effect.value,
      })),
    };
  }

  /**
   * 获取效果目标
   */
  private getEffectTargets(
    effect: any,
    triggeredChars: Character[],
    allTeam: Character[]
  ): Character[] {
    switch (effect.target) {
      case 'all':
        return allTeam;
      case 'tagged':
        return triggeredChars;
      case 'specific':
        // 根据条件筛选（预留）
        return allTeam;
      default:
        return [];
    }
  }

  /**
   * 应用羁绊效果到角色
   */
  private applyBondEffects(team: Character[]): void {
    // 重置所有羁绊buff
    team.forEach((char) => {
      char.bondBuffs = [];
    });

    // 应用激活的羁绊
    for (const activated of this.activatedBonds) {
      for (const appliedEffect of activated.effects) {
        for (const target of appliedEffect.targets) {
          this.applyEffectToCharacter(target, appliedEffect.effect, appliedEffect.value, activated.bond);
        }
      }
    }
  }

  /**
   * 应用效果到单个角色
   */
  private applyEffectToCharacter(
    character: Character,
    effect: any,
    value: number,
    bond: BondConfig
  ): void {
    const buff: BondBuff = {
      bondId: bond.id,
      bondName: bond.name,
      effectType: effect.type as BondEffectType,
      value: value,
      description: effect.description,
    };

    if (!character.bondBuffs) {
      character.bondBuffs = [];
    }
    character.bondBuffs.push(buff);

    // 根据效果类型修改角色属性
    switch (effect.type) {
      case BondEffectType.HP_PERCENT:
        character.maxHp = Math.floor(character.maxHp * (1 + value / 100));
        character.hp = Math.floor(character.hp * (1 + value / 100));
        break;
      case BondEffectType.ATTACK_PERCENT:
        character.damage = Math.floor(character.damage * (1 + value / 100));
        break;
      case BondEffectType.MOVE_SPEED:
        if (value < 0) {
          // 这个效果应该应用到敌人，但这里我们先记录
          console.log(`羁绊效果：敌方移动速度${value}%`);
        } else {
          character.moveSpeed = Math.floor(character.moveSpeed * (1 + value / 100));
        }
        break;
      // 其他效果类型将在战斗中实时应用
      default:
        // 非直接属性修改的效果（如暴击率、技能CD等）记录在bondBuffs中
        // 将在战斗系统中读取并应用
        break;
    }
  }

  /**
   * 获取角色的羁绊buff说明
   */
  public getCharacterBondBuffs(character: Character): string[] {
    if (!character.bondBuffs) return [];
    return character.bondBuffs.map((buff) => `[${buff.bondName}] ${buff.description}`);
  }

  /**
   * 获取当前激活的羁绊列表
   */
  public getActivatedBonds(): ActivatedBond[] {
    return this.activatedBonds;
  }

  /**
   * 获取所有羁绊配置
   */
  public getAllBonds(): BondConfig[] {
    return this.bonds;
  }

  /**
   * 根据ID获取羁绊配置
   */
  public getBondById(bondId: string): BondConfig | undefined {
    return this.bonds.find((bond) => bond.id === bondId);
  }
}

// 导出单例
export const bondSystem = new BondSystem();

