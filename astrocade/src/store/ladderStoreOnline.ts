// @ts-nocheck
/**
 * 擂台Store - 在线模式版本
 * 支持 Supabase 在线功能和本地 fallback
 */

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
import { isSupabaseConfigured } from '../services/supabase';
import * as ladderApi from '../services/ladderApi';

interface LadderState {
  // 基础数据
  leaderboard: PlayerLadderData[];
  myLadderData: PlayerLadderData | null;
  challengeHistory: ChallengeRecord[];
  initialized: boolean;
  
  // 在线状态
  isOnlineMode: boolean;
  playerRegistered: boolean; // 是否已注册昵称
  
  // Actions
  initializeLadder: () => Promise<void>;
  registerPlayer: (playerName: string) => Promise<boolean>;
  refreshLeaderboard: () => Promise<void>;
  updateDefenseFormation: (formation: FormationSnapshot) => Promise<void>;
  executeChallenge: (
    defenderId: string,
    result: 'attacker_win' | 'defender_win',
    duration: number
  ) => Promise<{
    success: boolean;
    oldRank: number | null;
    newRank: number | null;
    defenderNewRank: number;
    affectedPlayers: number;
  }>;
  checkDailyReset: () => void;
  clearAll: () => void;
  setRegistered: (registered: boolean) => void;
}

export const useLadderStoreOnline = create<LadderState>()(
  persist(
    (set, get) => ({
      leaderboard: [],
      myLadderData: null,
      challengeHistory: [],
      initialized: false,
      isOnlineMode: isSupabaseConfigured(),
      playerRegistered: false,
      
      // 初始化擂台系统
      initializeLadder: async () => {
        const state = get();
        
        if (state.initialized && state.leaderboard.length > 0) {
          console.log('[擂台] 已初始化，跳过');
          return;
        }
        
        console.log('[擂台] 初始化擂台系统...', { isOnlineMode: state.isOnlineMode });
        
        if (state.isOnlineMode && state.playerRegistered && state.myLadderData) {
          try {
            // 在线模式：从服务器获取数据
            console.log('[擂台] 从服务器加载排行榜...');
            const leaderboard = await ladderApi.getLeaderboard();
            
            // 刷新我的数据
            const myData = await ladderApi.getPlayerByName(state.myLadderData.playerName);
            
            set({
              leaderboard,
              myLadderData: myData || state.myLadderData,
              initialized: true
            });
            
            console.log('[擂台] 在线数据加载完成', { 
              leaderboardCount: leaderboard.length,
              myRank: myData?.currentRank || '未上榜'
            });
          } catch (error) {
            console.error('[擂台] 加载在线数据失败，使用本地模式:', error);
            // 失败时fallback到本地模式
            get().initializeLocalMode();
          }
        } else {
          // 本地模式或未注册
          get().initializeLocalMode();
        }
      },
      
      // 初始化本地模式
      initializeLocalMode: () => {
        console.log('[擂台] 初始化本地模式...');
        
        const mockPlayers = generateMockLadderPlayers();
        const myData = generateMyInitialLadderData('我');
        
        set({
          leaderboard: mockPlayers,
          myLadderData: myData,
          initialized: true,
          challengeHistory: [],
          isOnlineMode: false
        });
        
        console.log('[擂台] 本地模式初始化完成');
      },
      
      // 注册玩家
      registerPlayer: async (playerName: string) => {
        const state = get();
        
        if (state.isOnlineMode) {
          try {
            console.log('[擂台] 注册玩家到服务器:', playerName);
            const player = await ladderApi.registerPlayer(playerName);
            
            set({
              myLadderData: player,
              playerRegistered: true
            });
            
            console.log('[擂台] 玩家注册成功:', player);
            
            // 注册后立即刷新排行榜
            await get().refreshLeaderboard();
            
            return true;
          } catch (error) {
            console.error('[擂台] 注册失败:', error);
            return false;
          }
        } else {
          // 本地模式：直接创建本地玩家
          const myData = generateMyInitialLadderData(playerName);
          set({
            myLadderData: myData,
            playerRegistered: true
          });
          return true;
        }
      },
      
      // 刷新排行榜
      refreshLeaderboard: async () => {
        const state = get();
        
        if (!state.isOnlineMode || !state.myLadderData) {
          return;
        }
        
        try {
          console.log('[擂台] 刷新排行榜...');
          const leaderboard = await ladderApi.getLeaderboard();
          
          // 同时刷新我的数据
          const myData = await ladderApi.getPlayerByName(state.myLadderData.playerName);
          
          set({
            leaderboard,
            myLadderData: myData || state.myLadderData
          });
          
          console.log('[擂台] 排行榜已刷新');
        } catch (error) {
          console.error('[擂台] 刷新失败:', error);
        }
      },
      
      // 更新防守阵容
      updateDefenseFormation: async (formation: FormationSnapshot) => {
        const state = get();
        if (!state.myLadderData) return;
        
        if (state.isOnlineMode) {
          try {
            console.log('[擂台] 更新防守阵容到服务器...');
            await ladderApi.updateDefenseFormation(state.myLadderData.playerId, formation);
            
            // 更新本地数据
            set({
              myLadderData: {
                ...state.myLadderData,
                defenseFormationSnapshot: formation,
                lastActiveTime: new Date().toISOString()
              }
            });
            
            console.log('[擂台] 防守阵容已同步到服务器');
          } catch (error) {
            console.error('[擂台] 更新防守阵容失败:', error);
            throw error;
          }
        } else {
          // 本地模式：只更新本地数据
          set({
            myLadderData: {
              ...state.myLadderData,
              defenseFormationSnapshot: formation,
              lastActiveTime: new Date().toISOString()
            }
          });
        }
      },
      
      // 执行挑战
      executeChallenge: async (defenderId, result, duration) => {
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
        
        if (state.isOnlineMode) {
          try {
            console.log('[擂台] 提交挑战结果到服务器...');
            
            const rankUpdate = await ladderApi.submitChallengeResult({
              attackerId: state.myLadderData.playerId,
              defenderId,
              result,
              battleDuration: duration
            });
            
            // 刷新排行榜和我的数据
            await get().refreshLeaderboard();
            
            return {
              success: true,
              oldRank: state.myLadderData.currentRank,
              newRank: rankUpdate.attackerNewRank,
              defenderNewRank: rankUpdate.defenderNewRank,
              affectedPlayers: rankUpdate.affectedCount
            };
          } catch (error) {
            console.error('[擂台] 提交挑战失败:', error);
            // 失败时使用本地逻辑
            return get().executeChallengeLocal(defenderId, result, duration);
          }
        } else {
          // 本地模式
          return get().executeChallengeLocal(defenderId, result, duration);
        }
      },
      
      // 本地挑战逻辑
      executeChallengeLocal: (defenderId, result, duration) => {
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
        
        const defender = state.leaderboard.find(p => p.playerId === defenderId);
        if (!defender) {
          return {
            success: false,
            oldRank: state.myLadderData.currentRank,
            newRank: state.myLadderData.currentRank,
            defenderNewRank: 0,
            affectedPlayers: 0
          };
        }
        
        const oldRank = state.myLadderData.currentRank;
        
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
        
        let finalLeaderboard = updatedLeaderboard;
        if (result === 'attacker_win' && oldRank === null) {
          finalLeaderboard = finalLeaderboard.filter(p => p.playerId !== updatedMyData.playerId);
          finalLeaderboard.push(updatedMyData);
          finalLeaderboard = finalLeaderboard.sort((a, b) => {
            const rankA = a.currentRank === null ? 999 : a.currentRank;
            const rankB = b.currentRank === null ? 999 : b.currentRank;
            return rankA - rankB;
          });
          finalLeaderboard = finalLeaderboard.filter(p => p.currentRank !== null && p.currentRank <= 30);
        }
        
        set({
          myLadderData: updatedMyData,
          leaderboard: finalLeaderboard
        });
        
        return {
          success: true,
          oldRank,
          newRank: rankUpdate.challengerNewRank,
          defenderNewRank: rankUpdate.defenderNewRank,
          affectedPlayers: rankUpdate.affectedPlayers
        };
      },
      
      checkDailyReset: () => {
        // 无限挑战模式，不需要重置
      },
      
      clearAll: () => {
        set({
          leaderboard: [],
          myLadderData: null,
          challengeHistory: [],
          initialized: false,
          playerRegistered: false
        });
      },
      
      setRegistered: (registered) => {
        set({ playerRegistered: registered });
      }
    }),
    {
      name: 'ladder-storage-online',
      version: 1
    }
  )
);

