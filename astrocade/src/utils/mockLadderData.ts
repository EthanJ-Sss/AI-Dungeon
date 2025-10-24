import type { PlayerLadderData, FormationSnapshot, SnapshotUnit, ElementType, RoleType } from '../types';

/** 模拟玩家名称列表 */
const MOCK_PLAYER_NAMES = [
  '剑圣无敌', '冰霜女王', '烈焰战神', '雷电法王', '大地守护者',
  '神射手', '暗影刺客', '圣光治疗', '风暴法师', '钢铁战士',
  '火焰舞者', '寒冰术士', '雷霆之怒', '岩石巨人', '海洋之心',
  '暗夜猎手', '光明使者', '死亡骑士', '自然守卫', '星辰法师',
  '狂战士', '冰霜刺客', '烈焰弓手', '雷电战士', '大地祭司',
  '神圣骑士', '暗黑法师', '风行者', '铁血勇士', '水之精灵'
];

/** 生成随机战力值（基于排名） - 已极度降低难度便于测试 */
function generatePowerByRank(rank: number): number {
  // 排名越靠前，战力越高
  // 排名1: 700左右（极度降低！）
  // 排名15: 400左右
  // 排名30: 250左右
  const basePower = 750 - (rank * 15); // 极度降低基础战力
  const variance = Math.floor(Math.random() * 60) - 30; // ±30（进一步减少波动）
  return Math.max(200, basePower + variance);
}

/** 生成模拟阵容快照 - 严格限制只生成3个角色 */
function generateMockFormation(playerId: string, rank: number): FormationSnapshot {
  const power = generatePowerByRank(rank);
  
  // ⚠️ 严格限制：最多3个角色！
  const MAX_UNITS = 3;
  const units: SnapshotUnit[] = [];
  
  const elements: ElementType[] = ['fire', 'ice', 'earth', 'water', 'neutral'];
  const roles: RoleType[] = ['warrior', 'archer', 'assassin', 'healer'];
  
  // 强制循环只执行3次
  for (let i = 0; i < MAX_UNITS; i++) {
    const col = i; // 0, 1, 2 - 一字排开
    const row = 0;  // 固定第一行
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    // 根据职业确定攻击类型和移动速度
    let attackType: 'melee' | 'ranged' = 'melee';
    let moveSpeed = 100;
    
    switch (role) {
      case 'warrior':
        attackType = 'melee';
        moveSpeed = 80;
        break;
      case 'archer':
        attackType = 'ranged';
        moveSpeed = 100;
        break;
      case 'assassin':
        attackType = 'melee';
        moveSpeed = 150;
        break;
      case 'healer':
        attackType = 'ranged';
        moveSpeed = 90;
        break;
    }
    
    units.push({
      position: { col, row },
      characterId: `char_${playerId}_${i}`,
      characterName: `角色${i + 1}`,
      element: elements[Math.floor(Math.random() * elements.length)],
      role: role,
      level: 1, // 固定1级（极度降低难度）
      maxHp: Math.floor(power / MAX_UNITS * 0.4), // 降低血量
      currentAtk: Math.floor(power / MAX_UNITS * 0.25), // 降低攻击
      moveSpeed: moveSpeed,
      attackType: attackType,
      skills: [], // 模拟数据暂不配置技能
      passiveSkills: []
    });
  }
  
  // 🔒 二次检查：确保绝对不超过3个角色
  const finalUnits = units.slice(0, MAX_UNITS);
  
  console.log(`[生成阵容] 玩家${playerId}, 排名${rank}, 战力${power}, 角色数: ${finalUnits.length}`);
  
  return {
    snapshotId: `snapshot_${playerId}_${Date.now()}`,
    playerId,
    createTime: new Date().toISOString(),
    totalPower: power,
    units: finalUnits
  };
}

/** 生成30个模拟擂台玩家数据 */
export function generateMockLadderPlayers(): PlayerLadderData[] {
  return Array.from({ length: 30 }, (_, i) => {
    const rank = i + 1;
    const playerId = `mock_player_${rank}`;
    const playerName = MOCK_PLAYER_NAMES[i];
    
    // 基于排名生成战绩
    const totalDefenses = Math.floor(Math.random() * 30) + 10;
    const defenseWinRate = Math.max(0.2, Math.min(0.9, 0.85 - (rank * 0.02)));
    const defenseWins = Math.floor(totalDefenses * defenseWinRate);
    const defenseLosses = totalDefenses - defenseWins;
    
    const totalChallenges = Math.floor(Math.random() * 40) + 10;
    const challengeWinRate = Math.max(0.3, Math.min(0.8, 0.7 - (rank * 0.015)));
    const totalWins = Math.floor(totalChallenges * challengeWinRate);
    const totalLosses = totalChallenges - totalWins;
    
    return {
      playerId,
      playerName,
      currentRank: rank,
      highestRank: rank,
      totalChallenges,
      totalWins,
      totalLosses,
      totalDefenses,
      defenseWins,
      defenseLosses,
      dailyChallengesUsed: 0,
      dailyChallengesMax: 5,
      lastChallengeResetTime: new Date().toISOString(),
      defenseFormationSnapshot: generateMockFormation(playerId, rank),
      lastActiveTime: new Date(Date.now() - Math.random() * 86400000).toISOString() // 最近24小时内
    };
  });
}

/** 生成当前玩家的初始擂台数据（未上榜） */
export function generateMyInitialLadderData(playerName: string = '我'): PlayerLadderData {
  return {
    playerId: 'current_player',
    playerName,
    currentRank: null, // 未上榜
    highestRank: null,
    totalChallenges: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDefenses: 0,
    defenseWins: 0,
    defenseLosses: 0,
    dailyChallengesUsed: 0,
    dailyChallengesMax: 5,
    lastChallengeResetTime: new Date().toISOString(),
    defenseFormationSnapshot: null, // 初始未设置防守阵容
    lastActiveTime: new Date().toISOString()
  };
}

/** 生成完整的模拟擂台数据（包含排行榜和玩家数据） */
export function generateMockLadderData() {
  return {
    leaderboard: generateMockLadderPlayers(),
    myLadderData: generateMyInitialLadderData('我')
  };
}


