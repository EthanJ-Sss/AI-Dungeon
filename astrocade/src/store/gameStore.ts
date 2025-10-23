import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Formation, LevelConfig, Character, RarityProbability, PitySystem, RecruitRecord, BattleResultData } from '../types';
import { recruitSystem } from '../utils/recruitSystem';
import { usePlayerStore } from './playerStore';

type GameScene = 'home' | 'recruit' | 'formation' | 'battle' | 'train' | 'result' | 'levelSelect' | 'start' | 'settings' | 'victory' | 'battleResult' | 'ladderResult' | 'defenseFormation' | 'ladder';

interface GameState {
  // 当前场景
  currentScene: GameScene;
  // 当前关卡
  currentLevel: LevelConfig | null;
  // 玩家阵型
  playerFormation: Formation[];
  // 战斗结果
  battleResult: 'win' | 'lose' | null;
  // 战斗结果数据
  battleResultData: BattleResultData | null;
  // 被击败的敌人（用于俘虏选择）
  defeatedEnemies: Character[];
  // 已解锁的关卡ID
  unlockedLevels: number[];
  // 已完成的关卡ID
  completedLevels: number[];
  // 游戏统计
  battleCount: number;
  recruitCount: number;
  skillLearnCount: number;
  // 新手引导
  tutorialStep: number;
  
  // 招募系统
  recruitSystem: {
    currentProbabilities: RarityProbability;
    pitySystem: PitySystem;
    recruitHistory: RecruitRecord[];
    statistics: {
      totalRecruits: number;
      commonCount: number;
      rareCount: number;
      epicCount: number;
    };
  };
  
  // Actions
  setScene: (scene: GameScene) => void;
  setLevel: (level: LevelConfig) => void;
  setFormation: (formation: Formation[]) => void;
  setBattleResult: (result: 'win' | 'lose' | null) => void;
  setBattleResultData: (data: BattleResultData) => void;
  setDefeatedEnemies: (enemies: Character[]) => void;
  unlockLevel: (levelId: number) => void;
  isLevelUnlocked: (levelId: number) => boolean;
  completeLevel: (levelId: number) => void;
  isLevelCompleted: (levelId: number) => boolean;
  incrementStat: (stat: 'battleCount' | 'recruitCount' | 'skillLearnCount') => void;
  completeTutorial: (step: number) => void;
  resetBattle: () => void;
  
  // 招募系统Actions
  updateRecruitProbabilities: () => void;
  recordRecruit: (characterId: string, rarity: string, isPity: boolean) => void;
  incrementPityCounter: () => void;
  resetPityCounter: (rarity: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentScene: 'start',
      currentLevel: null,
      playerFormation: [],
      battleResult: null,
      battleResultData: null,
      defeatedEnemies: [],
      unlockedLevels: [1], // 默认解锁第1关
      completedLevels: [], // 已完成的关卡
      battleCount: 0,
      recruitCount: 0,
      skillLearnCount: 0,
      tutorialStep: 0, // 0=未开始, 1=招募, 2=战斗, 3=训练, 4=完成
      
      // 招募系统初始状态
      recruitSystem: {
        currentProbabilities: {
          common: 80,
          rare: 15,
          epic: 5,
        },
        pitySystem: {
          rareCounter: 0,
          epicCounter: 0,
          lastRareAt: 0,
          lastEpicAt: 0,
        },
        recruitHistory: [],
        statistics: {
          totalRecruits: 0,
          commonCount: 0,
          rareCount: 0,
          epicCount: 0,
        },
      },

      setScene: (scene) => set({ currentScene: scene }),
      
      setLevel: (level) => {
        console.log(`[GameStore] setLevel 被调用，关卡ID: ${level?.id}, 关卡名称: ${level?.name}`);
        set({ currentLevel: level });
      },
      
      setFormation: (formation) => set({ playerFormation: formation }),
      
      setBattleResult: (result) => set({ battleResult: result }),
      
      setBattleResultData: (data) => set({ battleResultData: data }),
      
      setDefeatedEnemies: (enemies) => set({ defeatedEnemies: enemies }),
      
      unlockLevel: (levelId) =>
        set((state) => ({
          unlockedLevels: state.unlockedLevels.includes(levelId)
            ? state.unlockedLevels
            : [...state.unlockedLevels, levelId],
        })),
      
      isLevelUnlocked: (levelId) => {
        const state = get();
        return state.unlockedLevels.includes(levelId);
      },

      completeLevel: (levelId) =>
        set((state) => ({
          completedLevels: state.completedLevels.includes(levelId)
            ? state.completedLevels
            : [...state.completedLevels, levelId],
        })),

      isLevelCompleted: (levelId) => {
        const state = get();
        return state.completedLevels.includes(levelId);
      },

      incrementStat: (stat) =>
        set((state) => ({
          [stat]: state[stat] + 1,
        })),

      completeTutorial: (step) =>
        set((state) => ({
          tutorialStep: Math.max(state.tutorialStep, step),
        })),
      
      resetBattle: () => set({
        currentLevel: null,
        playerFormation: [],
        battleResult: null,
        battleResultData: null,
        defeatedEnemies: [],
      }),
      
      // 招募系统方法
      updateRecruitProbabilities: () => {
        const state = get();
        // 使用playerStore中的maxClearedLevel
        const maxClearedLevel = usePlayerStore.getState().maxClearedLevel || 0;
        
        // 使用recruitSystem计算概率
        const baseProbabilities = recruitSystem.calculateBaseProbabilities(maxClearedLevel);
        const finalProbabilities = recruitSystem.applyPitySystem(
          baseProbabilities,
          state.recruitSystem.pitySystem,
          maxClearedLevel
        );
        
        set((state) => ({
          recruitSystem: {
            ...state.recruitSystem,
            currentProbabilities: {
              common: finalProbabilities.common,
              rare: finalProbabilities.rare,
              epic: finalProbabilities.epic,
            },
          },
        }));
      },
      
      recordRecruit: (characterId, rarity, isPity) => {
        const state = get();
        const record: RecruitRecord = {
          timestamp: Date.now(),
          characterId,
          rarity: rarity as any,
          isPity,
        };
        
        set((state) => ({
          recruitSystem: {
            ...state.recruitSystem,
            recruitHistory: [...state.recruitSystem.recruitHistory, record],
            statistics: {
              totalRecruits: state.recruitSystem.statistics.totalRecruits + 1,
              commonCount: state.recruitSystem.statistics.commonCount + (rarity === 'common' ? 1 : 0),
              rareCount: state.recruitSystem.statistics.rareCount + (rarity === 'rare' ? 1 : 0),
              epicCount: state.recruitSystem.statistics.epicCount + (rarity === 'epic' ? 1 : 0),
            },
          },
        }));
      },
      
      incrementPityCounter: () => {
        set((state) => ({
          recruitSystem: {
            ...state.recruitSystem,
            pitySystem: {
              ...state.recruitSystem.pitySystem,
              rareCounter: state.recruitSystem.pitySystem.rareCounter + 1,
              epicCounter: state.recruitSystem.pitySystem.epicCounter + 1,
            },
          },
        }));
      },
      
      resetPityCounter: (rarity) => {
        set((state) => {
          const newPity = { ...state.recruitSystem.pitySystem };
          
          if (rarity === 'epic') {
            newPity.epicCounter = 0;
            newPity.rareCounter = 0; // 精英也重置稀有计数
            newPity.lastEpicAt = state.recruitSystem.statistics.totalRecruits;
          } else if (rarity === 'rare') {
            newPity.rareCounter = 0;
            newPity.lastRareAt = state.recruitSystem.statistics.totalRecruits;
          }
          
          return {
            recruitSystem: {
              ...state.recruitSystem,
              pitySystem: newPity,
            },
          };
        });
      },
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        unlockedLevels: state.unlockedLevels,
        completedLevels: state.completedLevels,
        battleCount: state.battleCount,
        recruitCount: state.recruitCount,
        skillLearnCount: state.skillLearnCount,
        tutorialStep: state.tutorialStep,
        recruitSystem: state.recruitSystem,
      }),
    }
  )
);


