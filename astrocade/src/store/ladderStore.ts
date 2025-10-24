import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PlayerLadderData,
  ChallengeRecord,
  FormationSnapshot
} from '../types';
import {
  generateMockLadderPlayers,
  generateMyInitialLadderData
} from '../utils/mockLadderData';
import {
  updateRankingsAfterChallenge,
  checkAndResetDailyChallenges
} from '../utils/rankUpdateLogic';

interface LadderState {
  // 排行榜数据（固定30人）
  leaderboard: PlayerLadderData[];
  
  // 我的擂台数据
  myLadderData: PlayerLadderData | null;
  
  // 挑战历史
  challengeHistory: ChallengeRecord[];
  
  // 是否已初始化
  initialized: boolean;
  
  // Actions
  initializeLadder: () => void;
  updateMyRank: (newRank: number, defenderRank: number, result: 'attacker_win' | 'defender_win') => void;
  recordChallenge: (record: ChallengeRecord) => void;
  updateDefenseFormation: (formation: FormationSnapshot) => void;
  consumeChallenge: () => boolean;
  checkDailyReset: () => void;
  executeChallenge: (
    defenderId: string,
    result: 'attacker_win' | 'defender_win',
    duration: number
  ) => {
    success: boolean;
    oldRank: number | null;
    newRank: number | null;
    defenderNewRank: number;
    affectedPlayers: number;
  };
  clearAll: () => void;
}

export const useLadderStore = create<LadderState>()(
  persist(
    (set, get) => ({
      leaderboard: [],
      myLadderData: null,
      challengeHistory: [],
      initialized: false,
      
      initializeLadder: () => {
        const state = get();
        
        // 如果已初始化，不重复初始化
        if (state.initialized && state.leaderboard.length > 0) {
          console.log('[擂台] 已初始化，跳过');
          return;
        }
        
        console.log('[擂台] 初始化擂台系统...');
        
        // 生成模拟玩家数据
        const mockPlayers = generateMockLadderPlayers();
        
        // 创建当前玩家数据（未上榜）
        const myData = generateMyInitialLadderData('我');
        
        set({
          leaderboard: mockPlayers,
          myLadderData: myData,
          initialized: true,
          challengeHistory: []
        });
        
        console.log('[擂台] 初始化完成，生成30名模拟玩家');
      },
      
      checkDailyReset: () => {
        const state = get();
        if (!state.myLadderData) return;
        
        const updatedMyData = checkAndResetDailyChallenges(state.myLadderData);
        
        if (updatedMyData.dailyChallengesUsed !== state.myLadderData.dailyChallengesUsed) {
          console.log('[擂台] 每日挑战次数已重置');
          set({ myLadderData: updatedMyData });
        }
      },
      
      consumeChallenge: () => {
        const state = get();
        if (!state.myLadderData) return false;
        
        // 检查并重置每日挑战次数
        get().checkDailyReset();
        
        const myData = get().myLadderData!;
        
        if (myData.dailyChallengesUsed >= myData.dailyChallengesMax) {
          return false;
        }
        
        set({
          myLadderData: {
            ...myData,
            dailyChallengesUsed: myData.dailyChallengesUsed + 1
          }
        });
        
        return true;
      },
      
      executeChallenge: (defenderId, result, duration) => {
        const state = get();
        
        if (!state.myLadderData) {
          return {
            success: false,
            oldRank: null,
            newRank: null,
            defenderNewRank: 0,
            affectedPlayers: 0
          };
        }
        
        // 找到防守者
        const defender = state.leaderboard.find(p => p.playerId === defenderId);
        if (!defender) {
          console.error('[擂台] 找不到防守者:', defenderId);
          return {
            success: false,
            oldRank: state.myLadderData.currentRank,
            newRank: state.myLadderData.currentRank,
            defenderNewRank: 0,
            affectedPlayers: 0
          };
        }
        
        const oldRank = state.myLadderData.currentRank;
        
        // 创建挑战记录
        const record: ChallengeRecord = {
          recordId: `challenge_${Date.now()}`,
          challengeTime: new Date().toISOString(),
          attackerId: state.myLadderData.playerId,
          defenderId: defender.playerId,
          attackerRankBefore: state.myLadderData.currentRank,
          defenderRankBefore: defender.currentRank!,
          result,
          battleDuration: duration
        };
        
        // 更新排名
        const rankUpdate = updateRankingsAfterChallenge(
          state.leaderboard,
          state.myLadderData,
          defender,
          result
        );
        
        // 更新我的数据
        const updatedMyData: PlayerLadderData = {
          ...state.myLadderData,
          currentRank: rankUpdate.challengerNewRank,
          highestRank: rankUpdate.challengerNewRank !== null && 
            (state.myLadderData.highestRank === null || rankUpdate.challengerNewRank < state.myLadderData.highestRank)
            ? rankUpdate.challengerNewRank
            : state.myLadderData.highestRank,
          totalChallenges: state.myLadderData.totalChallenges + 1,
          totalWins: result === 'attacker_win' ? state.myLadderData.totalWins + 1 : state.myLadderData.totalWins,
          totalLosses: result === 'defender_win' ? state.myLadderData.totalLosses + 1 : state.myLadderData.totalLosses,
          lastActiveTime: new Date().toISOString()
        };
        
        // 更新防守者的防守战绩
        const updatedLeaderboard = rankUpdate.updatedLeaderboard.map(player => {
          if (player.playerId === defenderId) {
            return {
              ...player,
              totalDefenses: player.totalDefenses + 1,
              defenseWins: result === 'defender_win' ? player.defenseWins + 1 : player.defenseWins,
              defenseLosses: result === 'attacker_win' ? player.defenseLosses + 1 : player.defenseLosses
            };
          }
          return player;
        });
        
        // 如果挑战成功且玩家新上榜，需要将玩家加入榜单
        let finalLeaderboard = updatedLeaderboard;
        if (result === 'attacker_win' && oldRank === null) {
          // 移除原有的我的数据（如果存在）
          finalLeaderboard = finalLeaderboard.filter(p => p.playerId !== updatedMyData.playerId);
          // 添加更新后的我的数据
          finalLeaderboard.push(updatedMyData);
          // 重新排序
          finalLeaderboard = finalLeaderboard.sort((a, b) => {
            const rankA = a.currentRank === null ? 999 : a.currentRank;
            const rankB = b.currentRank === null ? 999 : b.currentRank;
            return rankA - rankB;
          });
          // 只保留前30名
          finalLeaderboard = finalLeaderboard.filter(p => p.currentRank !== null && p.currentRank <= 30);
        }
        
        set({
          myLadderData: updatedMyData,
          leaderboard: finalLeaderboard,
          challengeHistory: [record, ...state.challengeHistory].slice(0, 50) // 只保留最近50条
        });
        
        console.log(`[擂台] 挑战${result === 'attacker_win' ? '成功' : '失败'}`, {
          oldRank,
          newRank: rankUpdate.challengerNewRank,
          affectedPlayers: rankUpdate.affectedPlayers
        });
        
        return {
          success: true,
          oldRank,
          newRank: rankUpdate.challengerNewRank,
          defenderNewRank: rankUpdate.defenderNewRank,
          affectedPlayers: rankUpdate.affectedPlayers
        };
      },
      
      updateMyRank: (newRank, defenderRank, result) => {
        const state = get();
        if (!state.myLadderData) return;
        
        set({
          myLadderData: {
            ...state.myLadderData,
            currentRank: newRank,
            highestRank: state.myLadderData.highestRank === null || newRank < state.myLadderData.highestRank
              ? newRank
              : state.myLadderData.highestRank,
            lastActiveTime: new Date().toISOString()
          }
        });
      },
      
      recordChallenge: (record) => {
        const state = get();
        set({
          challengeHistory: [record, ...state.challengeHistory].slice(0, 50)
        });
      },
      
      updateDefenseFormation: (formation) => {
        const state = get();
        if (!state.myLadderData) return;
        
        // 更新我的防守阵容
        const updatedMyData = {
          ...state.myLadderData,
          defenseFormationSnapshot: formation,
          lastActiveTime: new Date().toISOString()
        };
        
        // 如果已上榜，同时更新榜单中的数据
        let updatedLeaderboard = state.leaderboard;
        if (state.myLadderData.currentRank !== null) {
          updatedLeaderboard = state.leaderboard.map(player => {
            if (player.playerId === state.myLadderData?.playerId) {
              return updatedMyData;
            }
            return player;
          });
        }
        
        set({
          myLadderData: updatedMyData,
          leaderboard: updatedLeaderboard
        });
        
        console.log('[擂台] 防守阵容已更新', {
          totalPower: formation.totalPower,
          unitCount: formation.units.length
        });
      },
      
      clearAll: () => {
        set({
          leaderboard: [],
          myLadderData: null,
          challengeHistory: [],
          initialized: false
        });
        console.log('[擂台] 数据已清除');
      }
    }),
    {
      name: 'ladder-storage',
      version: 1
    }
  )
);


