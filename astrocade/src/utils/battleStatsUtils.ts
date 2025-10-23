import type { BattleUnit, BattleResultData, CharacterBattleStats, DamageSource } from '../types';

/**
 * 计算MVP
 */
export function calculateMVP(units: BattleUnit[]): BattleUnit | null {
  if (units.length === 0) return null;
  
  const sorted = [...units].sort((a, b) => {
    const aStats = a.stats || { totalDamageDealt: 0, killCount: 0, skillUsedCount: 0, totalDamageTaken: 0, totalHealDone: 0, surviveTime: 0 };
    const bStats = b.stats || { totalDamageDealt: 0, killCount: 0, skillUsedCount: 0, totalDamageTaken: 0, totalHealDone: 0, surviveTime: 0 };
    
    // 按伤害排序
    if (bStats.totalDamageDealt !== aStats.totalDamageDealt) {
      return bStats.totalDamageDealt - aStats.totalDamageDealt;
    }
    // 伤害相同，比较击杀数
    if (bStats.killCount !== aStats.killCount) {
      return bStats.killCount - aStats.killCount;
    }
    // 击杀数相同，比较技能释放次数
    return bStats.skillUsedCount - aStats.skillUsedCount;
  });
  
  return sorted[0];
}

/**
 * 生成胜利统计
 */
export function generateVictoryStats(
  playerUnits: BattleUnit[],
  battleTime: number,
  levelId: number
): BattleResultData {
  const totalDamage = playerUnits.reduce((sum, u) => {
    const stats = u.stats || { totalDamageDealt: 0, killCount: 0, skillUsedCount: 0, totalDamageTaken: 0, totalHealDone: 0, surviveTime: 0 };
    return sum + stats.totalDamageDealt;
  }, 0);
  
  const characters: CharacterBattleStats[] = playerUnits.map(unit => {
    const stats = unit.stats || { totalDamageDealt: 0, killCount: 0, skillUsedCount: 0, totalDamageTaken: 0, totalHealDone: 0, surviveTime: 0 };
    
    return {
      characterId: unit.character.id,
      characterName: unit.character.name,
      element: unit.character.element || 'neutral',
      role: unit.character.role,
      totalDamageDealt: Math.round(stats.totalDamageDealt),
      damagePercent: totalDamage > 0 ? Math.round((stats.totalDamageDealt / totalDamage) * 100) : 0,
      killCount: stats.killCount,
      skillUsedCount: stats.skillUsedCount,
      surviveTime: battleTime,
      totalHealDone: Math.round(stats.totalHealDone || 0),
      totalDamageTaken: Math.round(stats.totalDamageTaken || 0),
    };
  }).sort((a, b) => b.totalDamageDealt - a.totalDamageDealt);
  
  const mvp = characters[0];
  const teamHpPercent = Math.round(
    (playerUnits.reduce((sum, u) => sum + u.currentHp, 0) /
     playerUnits.reduce((sum, u) => sum + u.character.maxHp, 0)) * 100
  );
  
  return {
    battleResult: 'victory',
    battleTime,
    levelId,
    playerStats: {
      characters,
      mvp,
      totalDamage: Math.round(totalDamage),
      teamHpPercent,
    },
    rewards: {
      recruitTickets: 1,
      exp: 50,
    },
  };
}

/**
 * 生成失败统计
 */
export function generateDefeatStats(
  damageSources: Map<string, DamageSource>,
  battleTime: number,
  levelId: number,
  remainingEnemies: number
): BattleResultData {
  const sources = Array.from(damageSources.values());
  const totalDamage = sources.reduce((sum, s) => sum + s.totalDamageDealt, 0);
  
  sources.forEach(s => {
    s.damagePercent = totalDamage > 0 ? Math.round((s.totalDamageDealt / totalDamage) * 100) : 0;
    s.totalDamageDealt = Math.round(s.totalDamageDealt);
  });
  
  sources.sort((a, b) => b.totalDamageDealt - a.totalDamageDealt);
  
  const suggestions = generateSuggestions(sources, battleTime);
  
  return {
    battleResult: 'defeat',
    battleTime,
    levelId,
    defeatStats: {
      damageSources: sources,
      primaryCause: sources[0] || {
        sourceId: 'unknown',
        sourceName: '未知',
        sourceType: 'enemy',
        totalDamageDealt: 0,
        damagePercent: 0,
        killCount: 0,
        killedCharacters: [],
      },
      suggestions,
      surviveTime: battleTime,
      remainingEnemies,
    },
    rewards: {
      recruitTickets: 0,
      exp: 0,
    },
  };
}

/**
 * 生成战术建议
 */
function generateSuggestions(sources: DamageSource[], battleTime: number): string[] {
  const suggestions: string[] = [];
  
  // 环境伤害占比过高
  const envDamage = sources.filter(s => s.sourceType === 'environment')
    .reduce((sum, s) => sum + s.damagePercent, 0);
  if (envDamage > 30) {
    suggestions.push('🔥 环境伤害占比过高，建议增加火系角色免疫燃烧');
  }
  
  // 某个敌人伤害占比过高
  if (sources[0] && sources[0].damagePercent > 40) {
    if (sources[0].sourceType === 'enemy' || sources[0].sourceType === 'boss_skill') {
      suggestions.push(`⚔️ ${sources[0].sourceName}输出极高，优先集火击杀`);
    }
  }
  
  // 快速团灭
  if (battleTime < 30) {
    suggestions.push('💚 团队存活时间过短，考虑带治疗角色提升续航');
  }
  
  // 通用建议
  if (suggestions.length < 3) {
    suggestions.push('🛡️ 调整阵容配置，平衡输出与生存能力');
  }
  
  return suggestions.slice(0, 3);
}

