// @ts-nocheck
/**
 * 简单后端 API 服务层
 * 连接到自己的 Node.js 后端，无需外部服务
 */

import type { PlayerLadderData, FormationSnapshot, ChallengeRecord } from '../types';

// API 基础 URL - 根据部署环境自动切换
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

console.log('[简单API] 使用后端地址:', API_BASE_URL);

/**
 * 检查后端是否可用
 */
export async function checkBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.error('[简单API] 后端不可用:', error);
    return false;
  }
}

/**
 * 检查昵称是否可用
 */
export async function checkPlayerNameAvailable(playerName: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/players/check/${encodeURIComponent(playerName)}`);
  if (!response.ok) throw new Error('检查昵称失败');
  const data = await response.json();
  return data.available;
}

/**
 * 注册新玩家
 */
export async function registerPlayer(
  playerName: string,
  defenseFormation?: FormationSnapshot
): Promise<PlayerLadderData> {
  const response = await fetch(`${API_BASE_URL}/players/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, defenseFormation }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '注册失败');
  }
  
  const data = await response.json();
  return convertToPlayerLadderData(data);
}

/**
 * 根据昵称获取玩家信息
 */
export async function getPlayerByName(playerName: string): Promise<PlayerLadderData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/players/${encodeURIComponent(playerName)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('获取玩家失败');
    
    const data = await response.json();
    return convertToPlayerLadderData(data);
  } catch (error) {
    console.error('[简单API] 获取玩家失败:', error);
    return null;
  }
}

/**
 * 获取排行榜（前30名）
 */
export async function getLeaderboard(): Promise<PlayerLadderData[]> {
  const response = await fetch(`${API_BASE_URL}/leaderboard`);
  if (!response.ok) throw new Error('获取排行榜失败');
  
  const data = await response.json();
  return data.map(convertToPlayerLadderData);
}

/**
 * 更新防守阵容
 */
export async function updateDefenseFormation(
  playerId: string,
  formation: FormationSnapshot
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/defense`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ defenseFormation: formation }),
  });
  
  if (!response.ok) throw new Error('更新防守阵容失败');
}

/**
 * 提交挑战结果并更新排名
 */
export async function submitChallengeResult(params: {
  attackerId: string;
  defenderId: string;
  result: 'attacker_win' | 'defender_win';
  battleDuration: number;
  battleStats?: any;
}): Promise<{
  attackerNewRank: number | null;
  defenderNewRank: number;
  affectedCount: number;
}> {
  const response = await fetch(`${API_BASE_URL}/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '提交挑战失败');
  }
  
  return await response.json();
}

/**
 * 获取玩家的挑战历史
 */
export async function getPlayerChallengeHistory(
  playerId: string,
  limit = 10
): Promise<ChallengeRecord[]> {
  const response = await fetch(`${API_BASE_URL}/challenges/${playerId}?limit=${limit}`);
  if (!response.ok) throw new Error('获取挑战历史失败');
  
  const data = await response.json();
  return data.map((record: any) => ({
    recordId: record.id,
    challengeTime: record.challengeTime,
    attacker: {
      playerId: record.attackerId,
      playerName: '',
      rankBefore: record.attackerRankBefore,
      teamPower: 0,
    },
    defender: {
      playerId: record.defenderId,
      playerName: '',
      rankBefore: record.defenderRankBefore,
      teamPower: 0,
    },
    battleResult: record.result,
    battleDuration: record.battleDuration,
    rankChange: {
      attackerRankAfter: record.attackerRankAfter || 0,
      defenderRankAfter: record.defenderRankAfter,
      affectedPlayers: 0,
    },
    battleStats: record.battleStats || {
      attackerDamageDealt: 0,
      defenderDamageDealt: 0,
      attackerUnitsLost: 0,
      defenderUnitsLost: 0,
    },
    rewards: {
      recruitTickets: 0,
      gold: 0,
      exp: 0,
    },
  }));
}

/**
 * 转换为前端数据格式
 */
function convertToPlayerLadderData(data: any): PlayerLadderData {
  const defenseWinRate = data.totalDefenses > 0
    ? Math.round((data.defenseWins / data.totalDefenses) * 100)
    : 0;
  
  return {
    playerId: data.id,
    playerName: data.playerName,
    avatarId: undefined,
    currentRank: data.currentRank,
    highestRank: data.highestRank,
    rankUpdatedAt: data.lastActiveTime,
    onLeaderboardSince: data.createdAt,
    consecutiveDaysAsRank1: 0,
    totalChallenges: data.totalChallenges,
    totalWins: data.totalWins,
    totalLosses: data.totalLosses,
    winRate: data.totalChallenges > 0
      ? Math.round((data.totalWins / data.totalChallenges) * 100)
      : 0,
    currentWinStreak: 0,
    maxWinStreak: 0,
    totalDefenses: data.totalDefenses,
    defenseWins: data.defenseWins,
    defenseLosses: data.defenseLosses,
    defenseWinRate,
    dailyChallengesUsed: 0,
    dailyChallengesMax: 999,
    lastChallengeResetTime: new Date().toISOString(),
    defenseFormationSnapshot: data.defenseFormation || null,
    lastActiveTime: data.lastActiveTime,
    lastFormationUpdateTime: data.lastActiveTime,
    dailyRewardClaimed: false,
    weeklyRewardClaimed: false,
  };
}

