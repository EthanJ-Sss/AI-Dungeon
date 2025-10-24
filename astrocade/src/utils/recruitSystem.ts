import type { PresetCharacter, CharacterRarity, RarityProbability, PitySystem } from '../types';
import { loadRecruitableCharacters } from './characterLoader';
import recruitProgressConfig from '../config/recruitProgressConfig.json';

const RARE_PITY = recruitProgressConfig.pitySystem.rare.count;
const EPIC_PITY = recruitProgressConfig.pitySystem.epic.count;

export class RecruitSystem {
  private allCharacters: PresetCharacter[];
  
  constructor() {
    this.allCharacters = loadRecruitableCharacters() as PresetCharacter[];
  }
  
  /**
   * 检查稀有度是否解锁
   */
  isRarityUnlocked(rarity: CharacterRarity, maxClearedLevel: number): boolean {
    const requirements = recruitProgressConfig.rarityUnlockRequirements;
    return maxClearedLevel >= requirements[rarity];
  }
  
  /**
   * 计算基础概率（基于关卡进度）
   */
  calculateBaseProbabilities(levelProgress: number): RarityProbability {
    // 查找对应的概率配置
    let probConfig = recruitProgressConfig.probabilityByProgress[0];
    
    for (const config of recruitProgressConfig.probabilityByProgress) {
      if (levelProgress >= config.maxClearedLevel) {
        probConfig = config;
      } else {
        break;
      }
    }
    
    return {
      common: probConfig.common,
      rare: probConfig.rare,
      epic: probConfig.epic,
    };
  }
  
  /**
   * 应用保底系统（考虑解锁状态）
   */
  applyPitySystem(baseProb: RarityProbability, pity: PitySystem, maxClearedLevel: number): RarityProbability {
    // 精英保底触发（需要先解锁精英）
    if (pity.epicCounter >= EPIC_PITY && this.isRarityUnlocked('epic', maxClearedLevel)) {
      return { common: 0, rare: 0, epic: 100 };
    }
    
    // 稀有保底触发（需要先解锁稀有）
    if (pity.rareCounter >= RARE_PITY && this.isRarityUnlocked('rare', maxClearedLevel)) {
      // 如果精英已解锁，稀有保底也有几率出精英
      if (this.isRarityUnlocked('epic', maxClearedLevel)) {
        return { common: 0, rare: 70, epic: 30 };
      } else {
        return { common: 0, rare: 100, epic: 0 };
      }
    }
    
    // 接近保底时提升概率（只在解锁后生效）
    const adjustedProb = { ...baseProb };
    
    if (pity.rareCounter >= RARE_PITY - 3 && this.isRarityUnlocked('rare', maxClearedLevel)) {
      const bonus = (pity.rareCounter - (RARE_PITY - 4)) * 5;
      adjustedProb.rare = Math.min(adjustedProb.rare + bonus, 50);
      adjustedProb.common = Math.max(adjustedProb.common - bonus, 10);
    }
    
    if (pity.epicCounter >= EPIC_PITY - 5 && this.isRarityUnlocked('epic', maxClearedLevel)) {
      const bonus = (pity.epicCounter - (EPIC_PITY - 6)) * 2;
      adjustedProb.epic = Math.min(adjustedProb.epic + bonus, 40);
      adjustedProb.common = Math.max(adjustedProb.common - bonus, 10);
    }
    
    return adjustedProb;
  }
  
  /**
   * 抽取稀有度
   */
  rollRarity(probabilities: RarityProbability): CharacterRarity {
    const random = Math.random() * 100;
    
    if (random < probabilities.epic) {
      return 'epic';
    } else if (random < probabilities.epic + probabilities.rare) {
      return 'rare';
    } else {
      return 'common';
    }
  }
  
  /**
   * 从池中抽取角色（基于稀有度）
   */
  rollCharacter(rarity: CharacterRarity, excludeOwned: string[] = []): PresetCharacter | null {
    // 筛选符合稀有度的角色
    let pool = this.allCharacters.filter(char => {
      const charRarity = char.rarity || (char.element === 'neutral' ? 'common' : 'rare');
      return charRarity === rarity;
    });
    
    // 如果需要排除已拥有的角色
    if (excludeOwned.length > 0) {
      const availablePool = pool.filter(char => !excludeOwned.includes(String(char.id)));
      // 如果还有未拥有的角色，使用未拥有的池子
      if (availablePool.length > 0) {
        pool = availablePool;
      }
      // 否则使用全部池子（允许重复）
    }
    
    if (pool.length === 0) {
      console.warn(`[RecruitSystem] 没有找到稀有度为 ${rarity} 的角色`);
      return null;
    }
    
    // 随机选择
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }
  
  /**
   * 单次招募
   */
  recruit(
    levelProgress: number,
    pitySystem: PitySystem,
    ownedCharacterIds: string[] = []
  ): {
    character: PresetCharacter;
    rarity: CharacterRarity;
    isPity: boolean;
    probabilities: RarityProbability;
  } | null {
    // 1. 计算基础概率
    const baseProbabilities = this.calculateBaseProbabilities(levelProgress);
    
    // 2. 应用保底系统（传入通关进度）
    const finalProbabilities = this.applyPitySystem(baseProbabilities, pitySystem, levelProgress);
    
    // 3. 抽取稀有度
    const rarity = this.rollRarity(finalProbabilities);
    
    // 4. 从对应稀有度池中抽取角色
    const character = this.rollCharacter(rarity, ownedCharacterIds);
    
    if (!character) {
      return null;
    }
    
    // 5. 判断是否触发保底
    const isPity = (rarity === 'epic' && pitySystem.epicCounter >= EPIC_PITY) ||
                   (rarity === 'rare' && pitySystem.rareCounter >= RARE_PITY);
    
    return {
      character,
      rarity,
      isPity,
      probabilities: finalProbabilities,
    };
  }
}

// 导出单例
export const recruitSystem = new RecruitSystem();

