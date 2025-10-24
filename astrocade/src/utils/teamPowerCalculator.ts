// @ts-nocheck
/**
 * 团队战力计算工具
 */

import type { Character } from '../types';

/**
 * 计算单个角色的战力
 */
export function calculateCharacterPower(character: Character): number {
  const { maxHp, attack, defense, speed, level, rarity } = character;
  
  // 基础战力 = HP * 0.5 + 攻击 * 2 + 防御 * 1.5 + 速度 * 1
  let power = Math.floor(
    maxHp * 0.5 + 
    attack * 2 + 
    defense * 1.5 + 
    speed * 1
  );
  
  // 等级加成
  power = Math.floor(power * (1 + level * 0.05));
  
  // 稀有度加成
  const rarityBonus = {
    common: 1.0,
    rare: 1.2,
    epic: 1.4,
    legendary: 1.6,
  };
  
  power = Math.floor(power * (rarityBonus[rarity] || 1.0));
  
  return power;
}

/**
 * 计算团队总战力
 */
export function calculateTeamPower(characters: Character[]): number {
  if (characters.length === 0) return 0;
  
  let totalPower = 0;
  
  for (const char of characters) {
    totalPower += calculateCharacterPower(char);
  }
  
  // 团队协同加成 (角色越多，加成越高)
  const teamSynergyBonus = 1 + (characters.length - 1) * 0.05;
  totalPower = Math.floor(totalPower * teamSynergyBonus);
  
  return totalPower;
}

/**
 * 计算两个团队的战力差距百分比
 */
export function calculatePowerDifference(team1: Character[], team2: Character[]): number {
  const power1 = calculateTeamPower(team1);
  const power2 = calculateTeamPower(team2);
  
  if (power2 === 0) return 100;
  
  return Math.round(((power1 - power2) / power2) * 100);
}

/**
 * 评估团队强度等级
 */
export function evaluateTeamStrength(power: number): {
  level: string;
  color: string;
  description: string;
} {
  if (power < 500) {
    return {
      level: '新手',
      color: 'text-gray-400',
      description: '刚刚起步的队伍',
    };
  } else if (power < 1000) {
    return {
      level: '初级',
      color: 'text-green-400',
      description: '初具实力的队伍',
    };
  } else if (power < 2000) {
    return {
      level: '中级',
      color: 'text-blue-400',
      description: '经验丰富的队伍',
    };
  } else if (power < 3500) {
    return {
      level: '高级',
      color: 'text-purple-400',
      description: '强大的精英队伍',
    };
  } else if (power < 5000) {
    return {
      level: '大师',
      color: 'text-yellow-400',
      description: '顶尖的战斗队伍',
    };
  } else {
    return {
      level: '传奇',
      color: 'text-red-400',
      description: '无与伦比的传奇队伍',
    };
  }
}

