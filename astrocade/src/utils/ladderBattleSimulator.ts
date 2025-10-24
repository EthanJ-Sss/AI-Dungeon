import type { FormationSnapshot } from '../types';

/** 战斗模拟结果 */
export interface BattleSimulationResult {
  result: 'attacker_win' | 'defender_win';
  duration: number; // 战斗时长（秒）
  attackerDamageDealt: number;
  defenderDamageDealt: number;
}

/**
 * 简化的战斗模拟器
 * 基于战力差距计算胜率，不运行真实Phaser战斗
 */
export function simulateLadderBattle(
  attackerFormation: FormationSnapshot,
  defenderFormation: FormationSnapshot
): BattleSimulationResult {
  const attackerPower = attackerFormation.totalPower;
  const defenderPower = defenderFormation.totalPower;
  
  // 计算战力比
  const powerRatio = attackerPower / defenderPower;
  
  // 基于战力比计算胜率
  // powerRatio > 1.5: 90%胜率
  // powerRatio = 1.0: 50%胜率
  // powerRatio < 0.67: 10%胜率
  let baseWinRate: number;
  
  if (powerRatio >= 1.5) {
    baseWinRate = 0.9;
  } else if (powerRatio <= 0.67) {
    baseWinRate = 0.1;
  } else {
    // 线性插值：0.67-1.5 映射到 0.1-0.9
    const normalizedRatio = (powerRatio - 0.67) / (1.5 - 0.67);
    baseWinRate = 0.1 + normalizedRatio * 0.8;
  }
  
  // 添加随机性（±5%）
  const randomFactor = (Math.random() - 0.5) * 0.1;
  const finalWinRate = Math.max(0.05, Math.min(0.95, baseWinRate + randomFactor));
  
  // 判定战斗结果
  const random = Math.random();
  const result = random < finalWinRate ? 'attacker_win' : 'defender_win';
  
  // 生成战斗时长（30-60秒）
  const duration = Math.floor(30 + Math.random() * 30);
  
  // 生成伤害数据（基于战力）
  const attackerDamageDealt = Math.floor(attackerPower * (0.5 + Math.random() * 0.5));
  const defenderDamageDealt = Math.floor(defenderPower * (0.5 + Math.random() * 0.5));
  
  return {
    result,
    duration,
    attackerDamageDealt,
    defenderDamageDealt
  };
}

/**
 * 根据战力差距获取难度提示
 */
export function getDifficultyHint(powerDiff: number): {
  level: 'easy' | 'medium' | 'hard';
  text: string;
  color: string;
} {
  if (powerDiff > 500) {
    return {
      level: 'easy',
      text: '✓ 战力优势明显，胜算很大',
      color: 'text-green-400'
    };
  } else if (powerDiff > 200) {
    return {
      level: 'easy',
      text: '✓ 战力略有优势',
      color: 'text-green-300'
    };
  } else if (powerDiff > -200) {
    return {
      level: 'medium',
      text: '⚠️ 战力接近，需谨慎应对',
      color: 'text-yellow-400'
    };
  } else if (powerDiff > -500) {
    return {
      level: 'hard',
      text: '⚠️ 对手战力较高，挑战有难度',
      color: 'text-orange-400'
    };
  } else {
    return {
      level: 'hard',
      text: '⚠️ 对手战力远高于你，挑战难度极高！',
      color: 'text-red-400'
    };
  }
}



