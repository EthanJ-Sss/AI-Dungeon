// @ts-nocheck
/**
 * 异步对战系统 API 服务层
 * 封装所有与 Supabase 的交互
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { PlayerLadderData, FormationSnapshot, ChallengeRecord } from '../types';

/**
 * 检查昵称是否可用
 */
export async function checkPlayerNameAvailable(playerName: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 未配置');
  }
  
  const { data, error } = await supabase
    .from('ladder_players')
    .select('id')
    .eq('player_name', playerName)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') {
    console.error('[API] 检查昵称失败:', error);
    throw error;
  }
  
  return !data; // 没有数据表示可用
}

/**
 * 注册新玩家
 */
export async function registerPlayer(
  playerName: string,
  defenseFormation?: FormationSnapshot
): Promise<PlayerLadderData> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 未配置');
  }
  
  const { data, error } = await supabase
    .from('ladder_players')
    .insert({
      player_name: playerName,
      current_rank: null, // 初始未上榜
      highest_rank: null,
      defense_formation: defenseFormation || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error('[API] 注册玩家失败:', error);
    throw error;
  }
  
  return convertDbPlayerToLadderData(data);
}

/**
 * 根据昵称获取玩家信息
 */
export async function getPlayerByName(playerName: string): Promise<PlayerLadderData | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 未配置');
  }
  
  const { data, error } = await supabase
    .from('ladder_players')
    .select('*')
    .eq('player_name', playerName)
    .maybeSingle();
  
  if (error) {
    console.error('[API] 获取玩家失败:', error);
    throw error;
  }
  
  return data ? convertDbPlayerToLadderData(data) : null;
}

/**
 * 获取排行榜（前30名）
 */
export async function getLeaderboard(): Promise<PlayerLadderData[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 未配置');
  }
  
  const { data, error } = await supabase
    .from('ladder_players')
    .select('*')
    .not('current_rank', 'is', null)
    .lte('current_rank', 30)
    .order('current_rank', { ascending: true });
  
  if (error) {
    console.error('[API] 获取排行榜失败:', error);
    throw error;
  }
  
  return data.map(convertDbPlayerToLadderData);
}

/**
 * 更新防守阵容
 */
export async function updateDefenseFormation(
  playerId: string,
  formation: FormationSnapshot
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 未配置');
  }
  
  const { error } = await supabase
    .from('ladder_players')
    .update({
      defense_formation: formation,
      last_active_time: new Date().toISOString(),
    })
    .eq('id', playerId);
  
  if (error) {
    console.error('[API] 更新防守阵容失败:', error);
    throw error;
  }
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
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 未配置');
  }
  
  const { attackerId, defenderId, result, battleDuration, battleStats } = params;
  
  // 1. 获取挑战前的排名
  const [attacker, defender] = await Promise.all([
    supabase.from('ladder_players').select('current_rank').eq('id', attackerId).single(),
    supabase.from('ladder_players').select('current_rank').eq('id', defenderId).single(),
  ]);
  
  const attackerRankBefore = attacker.data?.current_rank || null;
  const defenderRankBefore = defender.data?.current_rank || null;
  
  if (defenderRankBefore === null) {
    throw new Error('被挑战者不在榜单上');
  }
  
  // 2. 更新排名（使用数据库函数）
  const { data: rankUpdate, error: rankError } = await supabase
    .rpc('update_rankings_after_challenge', {
      p_attacker_id: attackerId,
      p_defender_id: defenderId,
      p_result: result,
    });
  
  if (rankError) {
    console.error('[API] 更新排名失败:', rankError);
    throw rankError;
  }
  
  const { attacker_new_rank, defender_new_rank, affected_count } = rankUpdate[0];
  
  // 3. 更新战绩统计
  if (result === 'attacker_win') {
    // 挑战者胜利
    await Promise.all([
      supabase
        .from('ladder_players')
        .update({
          total_challenges: supabase.from('ladder_players').select('total_challenges').single(),
          total_wins: supabase.from('ladder_players').select('total_wins').single(),
        })
        .eq('id', attackerId),
      supabase
        .from('ladder_players')
        .update({
          total_defenses: supabase.from('ladder_players').select('total_defenses').single(),
          defense_losses: supabase.from('ladder_players').select('defense_losses').single(),
        })
        .eq('id', defenderId),
    ]);
  } else {
    // 挑战者失败
    await Promise.all([
      supabase
        .from('ladder_players')
        .update({
          total_challenges: supabase.from('ladder_players').select('total_challenges').single(),
          total_losses: supabase.from('ladder_players').select('total_losses').single(),
        })
        .eq('id', attackerId),
      supabase
        .from('ladder_players')
        .update({
          total_defenses: supabase.from('ladder_players').select('total_defenses').single(),
          defense_wins: supabase.from('ladder_players').select('defense_wins').single(),
        })
        .eq('id', defenderId),
    ]);
  }
  
  // 4. 记录挑战历史
  await supabase.from('challenge_records').insert({
    attacker_id: attackerId,
    defender_id: defenderId,
    result,
    attacker_rank_before: attackerRankBefore,
    attacker_rank_after: attacker_new_rank,
    defender_rank_before: defenderRankBefore,
    defender_rank_after: defender_new_rank,
    battle_duration: battleDuration,
    battle_stats: battleStats,
  });
  
  return {
    attackerNewRank: attacker_new_rank,
    defenderNewRank: defender_new_rank,
    affectedCount: affected_count,
  };
}

/**
 * 获取玩家的挑战历史
 */
export async function getPlayerChallengeHistory(
  playerId: string,
  limit = 10
): Promise<ChallengeRecord[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 未配置');
  }
  
  const { data, error } = await supabase
    .from('challenge_records')
    .select('*')
    .or(`attacker_id.eq.${playerId},defender_id.eq.${playerId}`)
    .order('challenge_time', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('[API] 获取挑战历史失败:', error);
    throw error;
  }
  
  // 转换为前端数据格式
  return data.map(record => ({
    recordId: record.id,
    challengeTime: record.challenge_time,
    attacker: {
      playerId: record.attacker_id,
      playerName: '', // 需要join查询才能获取
      rankBefore: record.attacker_rank_before,
      teamPower: 0,
    },
    defender: {
      playerId: record.defender_id,
      playerName: '',
      rankBefore: record.defender_rank_before,
      teamPower: 0,
    },
    battleResult: record.result,
    battleDuration: record.battle_duration,
    rankChange: {
      attackerRankAfter: record.attacker_rank_after || 0,
      defenderRankAfter: record.defender_rank_after,
      affectedPlayers: 0,
    },
    battleStats: record.battle_stats || {
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
 * 将数据库玩家数据转换为前端 PlayerLadderData 格式
 */
function convertDbPlayerToLadderData(dbPlayer: any): PlayerLadderData {
  const defenseWinRate =
    dbPlayer.total_defenses > 0
      ? Math.round((dbPlayer.defense_wins / dbPlayer.total_defenses) * 100)
      : 0;
  
  return {
    playerId: dbPlayer.id,
    playerName: dbPlayer.player_name,
    avatarId: undefined,
    currentRank: dbPlayer.current_rank,
    highestRank: dbPlayer.highest_rank,
    rankUpdatedAt: dbPlayer.rank_updated_at,
    onLeaderboardSince: dbPlayer.created_at, // 简化：使用创建时间
    consecutiveDaysAsRank1: 0, // TODO: 需要额外计算
    totalChallenges: dbPlayer.total_challenges,
    totalWins: dbPlayer.total_wins,
    totalLosses: dbPlayer.total_losses,
    winRate: dbPlayer.total_challenges > 0
      ? Math.round((dbPlayer.total_wins / dbPlayer.total_challenges) * 100)
      : 0,
    currentWinStreak: 0, // TODO: 需要从挑战历史计算
    maxWinStreak: 0, // TODO: 需要从挑战历史计算
    totalDefenses: dbPlayer.total_defenses,
    defenseWins: dbPlayer.defense_wins,
    defenseLosses: dbPlayer.defense_losses,
    defenseWinRate,
    dailyChallengesUsed: 0, // 无限挑战模式
    dailyChallengesMax: 999, // 无限挑战模式
    lastChallengeResetTime: new Date().toISOString(),
    defenseFormationSnapshot: dbPlayer.defense_formation || null,
    lastActiveTime: dbPlayer.last_active_time,
    lastFormationUpdateTime: dbPlayer.last_active_time,
    dailyRewardClaimed: false,
    weeklyRewardClaimed: false,
  };
}

