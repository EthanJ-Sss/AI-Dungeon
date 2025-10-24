// @ts-nocheck
/**
 * 简化的在线天梯 Store
 * 使用自己的简单后端，无需外部服务
 */

import { create } from 'zustand';
import type { PlayerLadderData, FormationSnapshot } from '../types';
import * as simpleApi from '../services/simpleLadderApi';
import { generateMockLadderData } from '../utils/mockLadderData';

interface LadderState {
  // 数据
  myLadderData: PlayerLadderData | null;
  leaderboard: PlayerLadderData[];
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  isOnlineMode: boolean; // 是否连接到后端
  
  // 选择状态
  selectedOpponent: PlayerLadderData | null;
  showChallengeModal: boolean;

  // Actions
  initializeLadder: () => Promise<void>;
  checkOrRegisterPlayer: (playerName: string, defenseFormation?: FormationSnapshot) => Promise<void>;
  updateDefenseFormation: (formation: FormationSnapshot) => Promise<void>;
  selectOpponent: (opponent: PlayerLadderData | null) => void;
  setShowChallengeModal: (show: boolean) => void;
  executeChallenge: (result: 'attacker_win' | 'defender_win', battleDuration: number, battleStats?: any) => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  resetError: () => void;
}

export const useLadderStore = create<LadderState>((set, get) => ({
  // 初始状态
  myLadderData: null,
  leaderboard: [],
  isLoading: false,
  error: null,
  isOnlineMode: false,
  selectedOpponent: null,
  showChallengeModal: false,

  /**
   * 初始化天梯系统 - 检查后端可用性
   */
  initializeLadder: async () => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('[天梯Store] 检查后端连接...');
      const isBackendAvailable = await simpleApi.checkBackendAvailable();
      
      if (isBackendAvailable) {
        console.log('[天梯Store] ✅ 后端连接成功，使用在线模式');
        set({ isOnlineMode: true });
        
        // 尝试从 localStorage 获取已登录的玩家
        const savedPlayerName = localStorage.getItem('ladder_player_name');
        if (savedPlayerName) {
          const player = await simpleApi.getPlayerByName(savedPlayerName);
          if (player) {
            set({ myLadderData: player });
            console.log('[天梯Store] 已恢复玩家数据:', savedPlayerName);
          }
        }
        
        // 加载排行榜
        const leaderboard = await simpleApi.getLeaderboard();
        
        // 🎯 如果排行榜为空，预设30个模拟敌人
        if (leaderboard.length === 0) {
          console.log('[天梯Store] 排行榜为空，生成30个预设敌人...');
          const mockData = generateMockLadderData();
          
          // 验证并处理模拟数据
          mockData.leaderboard.forEach((player, idx) => {
            const unitCount = player.defenseFormationSnapshot?.units.length || 0;
            if (unitCount > 3) {
              console.error(`❌ 排名${idx+1}有${unitCount}个角色，强制截取为3个`);
              if (player.defenseFormationSnapshot) {
                player.defenseFormationSnapshot.units = player.defenseFormationSnapshot.units.slice(0, 3);
              }
            }
          });
          
          set({ leaderboard: mockData.leaderboard });
          console.log('[天梯Store] ✅ 已生成30个预设敌人供挑战');
        } else {
          set({ leaderboard });
          console.log('[天梯Store] 已加载排行榜，共', leaderboard.length, '名玩家');
        }
      } else {
        console.log('[天梯Store] ⚠️ 后端未连接，使用本地模拟模式');
        set({ isOnlineMode: false });
        
        // 生成模拟数据
        const mockData = generateMockLadderData();
        
        // 🔒 验证每个玩家的角色数（不超过3个）
        mockData.leaderboard.forEach((player, idx) => {
          const unitCount = player.defenseFormationSnapshot?.units.length || 0;
          if (unitCount > 3) {
            console.error(`❌ 错误：排名${idx+1}的玩家有${unitCount}个角色！应该最多3个`);
            if (player.defenseFormationSnapshot) {
              player.defenseFormationSnapshot.units = player.defenseFormationSnapshot.units.slice(0, 3);
              console.log(`✂️ 已强制截取为3个角色`);
            }
          }
        });
        
        set({
          myLadderData: mockData.myLadderData,
          leaderboard: mockData.leaderboard,
        });
      }
    } catch (error) {
      console.error('[天梯Store] 初始化失败:', error);
      set({ 
        error: '初始化失败，已切换到本地模式',
        isOnlineMode: false,
      });
      
      // 降级到本地模式
      const mockData = generateMockLadderData();
      
      // 🔒 验证角色数
      mockData.leaderboard.forEach((player, idx) => {
        const unitCount = player.defenseFormationSnapshot?.units.length || 0;
        if (unitCount > 3) {
          console.error(`❌ 排名${idx+1}有${unitCount}个角色，强制截取为3个`);
          if (player.defenseFormationSnapshot) {
            player.defenseFormationSnapshot.units = player.defenseFormationSnapshot.units.slice(0, 3);
          }
        }
      });
      
      set({
        myLadderData: mockData.myLadderData,
        leaderboard: mockData.leaderboard,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 注册或登录玩家
   */
  checkOrRegisterPlayer: async (playerName: string, defenseFormation?: FormationSnapshot) => {
    set({ isLoading: true, error: null });
    
    try {
      const { isOnlineMode } = get();
      
      if (!isOnlineMode) {
        throw new Error('当前为本地模式，无法注册');
      }
      
      // 先尝试获取已存在的玩家
      let player = await simpleApi.getPlayerByName(playerName);
      
      if (!player) {
        // 玩家不存在，注册新玩家
        console.log('[天梯Store] 注册新玩家:', playerName);
        player = await simpleApi.registerPlayer(playerName, defenseFormation);
      } else {
        console.log('[天梯Store] 玩家已存在，登录:', playerName);
      }
      
      // 保存玩家信息
      set({ myLadderData: player });
      localStorage.setItem('ladder_player_name', playerName);
      
      // 刷新排行榜
      await get().refreshLeaderboard();
      
    } catch (error: any) {
      console.error('[天梯Store] 注册/登录失败:', error);
      set({ error: error.message || '注册/登录失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 更新防守阵容
   */
  updateDefenseFormation: async (formation: FormationSnapshot) => {
    set({ isLoading: true, error: null });
    
    try {
      const { myLadderData, isOnlineMode } = get();
      
      if (!myLadderData) {
        throw new Error('请先注册玩家');
      }
      
      if (isOnlineMode) {
        await simpleApi.updateDefenseFormation(myLadderData.playerId, formation);
      }
      
      // 更新本地数据
      set({
        myLadderData: {
          ...myLadderData,
          defenseFormationSnapshot: formation,
          lastFormationUpdateTime: new Date().toISOString(),
        },
      });
      
      console.log('[天梯Store] 防守阵容已更新');
      
    } catch (error: any) {
      console.error('[天梯Store] 更新阵容失败:', error);
      set({ error: error.message || '更新阵容失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 选择对手
   */
  selectOpponent: (opponent: PlayerLadderData | null) => {
    set({ selectedOpponent: opponent });
  },

  /**
   * 显示/隐藏挑战确认弹窗
   */
  setShowChallengeModal: (show: boolean) => {
    set({ showChallengeModal: show });
  },

  /**
   * 执行挑战并更新排名
   */
  executeChallenge: async (
    result: 'attacker_win' | 'defender_win',
    battleDuration: number,
    battleStats?: any
  ) => {
    set({ isLoading: true, error: null });
    
    try {
      const { myLadderData, selectedOpponent, isOnlineMode } = get();
      
      if (!myLadderData || !selectedOpponent) {
        throw new Error('挑战数据不完整');
      }
      
      if (isOnlineMode) {
        // 提交到后端
        const updateResult = await simpleApi.submitChallengeResult({
          attackerId: myLadderData.playerId,
          defenderId: selectedOpponent.playerId,
          result,
          battleDuration,
          battleStats,
        });
        
        console.log('[天梯Store] 挑战结果已提交:', updateResult);
        
        // 刷新排行榜
        await get().refreshLeaderboard();
        
        // 刷新我的数据
        const updatedMyData = await simpleApi.getPlayerByName(myLadderData.playerName);
        if (updatedMyData) {
          set({ myLadderData: updatedMyData });
        }
      } else {
        // 本地模式：模拟更新
        console.log('[天梯Store] 本地模式：模拟挑战结果');
        
        if (result === 'attacker_win' && selectedOpponent.currentRank) {
          const newMyData = {
            ...myLadderData,
            currentRank: selectedOpponent.currentRank,
            totalChallenges: myLadderData.totalChallenges + 1,
            totalWins: myLadderData.totalWins + 1,
            highestRank: myLadderData.highestRank === null || selectedOpponent.currentRank < myLadderData.highestRank
              ? selectedOpponent.currentRank
              : myLadderData.highestRank,
          };
          set({ myLadderData: newMyData });
        } else {
          const newMyData = {
            ...myLadderData,
            totalChallenges: myLadderData.totalChallenges + 1,
            totalLosses: myLadderData.totalLosses + 1,
          };
          set({ myLadderData: newMyData });
        }
      }
      
    } catch (error: any) {
      console.error('[天梯Store] 挑战失败:', error);
      set({ error: error.message || '挑战失败' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 刷新排行榜
   */
  refreshLeaderboard: async () => {
    try {
      const { isOnlineMode } = get();
      
      if (isOnlineMode) {
        const leaderboard = await simpleApi.getLeaderboard();
        set({ leaderboard });
        console.log('[天梯Store] 排行榜已刷新');
      }
    } catch (error) {
      console.error('[天梯Store] 刷新排行榜失败:', error);
    }
  },

  /**
   * 重置错误
   */
  resetError: () => {
    set({ error: null });
  },
}));

