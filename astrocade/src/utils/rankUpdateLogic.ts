import type { PlayerLadderData } from '../types';

/**
 * 核心算法：挑战成功后的排名调整
 * 
 * 规则：
 * 1. 挑战者直接取代被挑战者的排名
 * 2. 被挑战者及其后所有玩家排名+1
 * 3. 如果挑战者原本在榜内，中间排名需要调整
 * 4. 榜外玩家上榜时，排名31的玩家被挤出榜单
 */
export function updateRankingsAfterChallenge(
  leaderboard: PlayerLadderData[],
  challenger: PlayerLadderData,
  defender: PlayerLadderData,
  result: 'attacker_win' | 'defender_win'
): {
  updatedLeaderboard: PlayerLadderData[];
  affectedPlayers: number;
  challengerNewRank: number | null;
  defenderNewRank: number;
} {
  // 失败不影响排名
  if (result === 'defender_win') {
    return {
      updatedLeaderboard: leaderboard,
      affectedPlayers: 0,
      challengerNewRank: challenger.currentRank,
      defenderNewRank: defender.currentRank!
    };
  }
  
  const defenderRank = defender.currentRank!;
  const challengerRank = challenger.currentRank;
  
  // 创建新的排行榜（深拷贝以避免直接修改）
  const newLeaderboard = leaderboard.map(player => ({ ...player }));
  
  // 找到挑战者和防守者在新榜单中的引用
  const challengerInBoard = newLeaderboard.find(p => p.playerId === challenger.playerId);
  const defenderInBoard = newLeaderboard.find(p => p.playerId === defender.playerId);
  
  let affectedPlayers = 0;
  
  // 场景1：榜外玩家挑战上榜
  if (challengerRank === null) {
    // 挑战者取代防守者排名
    if (challengerInBoard) {
      challengerInBoard.currentRank = defenderRank;
    } else {
      // 挑战者不在榜单中，需要添加
      const newChallenger = { ...challenger, currentRank: defenderRank };
      newLeaderboard.push(newChallenger);
    }
    
    // 防守者及其后所有玩家排名+1
    newLeaderboard.forEach(player => {
      if (player.currentRank !== null && player.currentRank >= defenderRank && player.playerId !== challenger.playerId) {
        player.currentRank = player.currentRank + 1;
        affectedPlayers++;
      }
    });
    
    // 移除排名31的玩家（被挤出榜单）
    newLeaderboard.forEach(player => {
      if (player.currentRank === 31) {
        player.currentRank = null;
      }
    });
  }
  // 场景2：榜内玩家向上挑战
  else if (challengerRank > defenderRank) {
    // 挑战者取代防守者排名
    if (challengerInBoard) {
      challengerInBoard.currentRank = defenderRank;
    }
    
    // 原排名defenderRank到challengerRank-1之间的玩家排名+1
    newLeaderboard.forEach(player => {
      if (
        player.currentRank !== null &&
        player.currentRank >= defenderRank &&
        player.currentRank < challengerRank &&
        player.playerId !== challenger.playerId
      ) {
        player.currentRank = player.currentRank + 1;
        affectedPlayers++;
      }
    });
  }
  
  // 按排名排序（null排在最后）
  const sortedLeaderboard = newLeaderboard.sort((a, b) => {
    const rankA = a.currentRank === null ? 999 : a.currentRank;
    const rankB = b.currentRank === null ? 999 : b.currentRank;
    return rankA - rankB;
  });
  
  // 获取最终排名
  const finalChallenger = sortedLeaderboard.find(p => p.playerId === challenger.playerId);
  const finalDefender = sortedLeaderboard.find(p => p.playerId === defender.playerId);
  
  return {
    updatedLeaderboard: sortedLeaderboard,
    affectedPlayers,
    challengerNewRank: finalChallenger?.currentRank || null,
    defenderNewRank: finalDefender?.currentRank || defenderRank + 1
  };
}

/**
 * 检查挑战是否合法
 */
export function validateChallenge(
  challenger: PlayerLadderData,
  defender: PlayerLadderData
): {
  valid: boolean;
  reason?: string;
} {
  // 检查挑战次数
  if (challenger.dailyChallengesUsed >= challenger.dailyChallengesMax) {
    return {
      valid: false,
      reason: '今日挑战次数已用完'
    };
  }
  
  // 检查是否挑战自己
  if (challenger.playerId === defender.playerId) {
    return {
      valid: false,
      reason: '不能挑战自己'
    };
  }
  
  // 检查防守者是否在榜
  if (defender.currentRank === null) {
    return {
      valid: false,
      reason: '对手不在榜单上'
    };
  }
  
  // 榜内玩家只能挑战排名更高的对手
  if (challenger.currentRank !== null && challenger.currentRank <= defender.currentRank) {
    return {
      valid: false,
      reason: '只能挑战排名更高的对手'
    };
  }
  
  // 榜外玩家可以挑战任何榜内玩家
  return {
    valid: true
  };
}

/**
 * 检查是否需要重置每日挑战次数
 */
export function checkAndResetDailyChallenges(player: PlayerLadderData): PlayerLadderData {
  const lastReset = new Date(player.lastChallengeResetTime);
  const now = new Date();
  
  // 检查是否跨天（UTC+8时区）
  const lastResetDay = new Date(lastReset.getTime() + 8 * 60 * 60 * 1000).getDate();
  const currentDay = new Date(now.getTime() + 8 * 60 * 60 * 1000).getDate();
  
  if (lastResetDay !== currentDay) {
    return {
      ...player,
      dailyChallengesUsed: 0,
      lastChallengeResetTime: now.toISOString()
    };
  }
  
  return player;
}

