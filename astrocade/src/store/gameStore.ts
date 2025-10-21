import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Formation, LevelConfig, Character } from '../types';

type GameScene = 'home' | 'recruit' | 'formation' | 'battle' | 'train' | 'result' | 'levelSelect' | 'start' | 'settings' | 'victory';

interface GameState {
  // 当前场景
  currentScene: GameScene;
  // 当前关卡
  currentLevel: LevelConfig | null;
  // 玩家阵型
  playerFormation: Formation[];
  // 战斗结果
  battleResult: 'win' | 'lose' | null;
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
  
  // Actions
  setScene: (scene: GameScene) => void;
  setLevel: (level: LevelConfig) => void;
  setFormation: (formation: Formation[]) => void;
  setBattleResult: (result: 'win' | 'lose' | null) => void;
  setDefeatedEnemies: (enemies: Character[]) => void;
  unlockLevel: (levelId: number) => void;
  isLevelUnlocked: (levelId: number) => boolean;
  completeLevel: (levelId: number) => void;
  isLevelCompleted: (levelId: number) => boolean;
  incrementStat: (stat: 'battleCount' | 'recruitCount' | 'skillLearnCount') => void;
  completeTutorial: (step: number) => void;
  resetBattle: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentScene: 'start',
      currentLevel: null,
      playerFormation: [],
      battleResult: null,
      defeatedEnemies: [],
      unlockedLevels: [1], // 默认解锁第1关
      completedLevels: [], // 已完成的关卡
      battleCount: 0,
      recruitCount: 0,
      skillLearnCount: 0,
      tutorialStep: 0, // 0=未开始, 1=招募, 2=战斗, 3=训练, 4=完成

      setScene: (scene) => set({ currentScene: scene }),
      
      setLevel: (level) => {
        console.log(`[GameStore] setLevel 被调用，关卡ID: ${level?.id}, 关卡名称: ${level?.name}`);
        set({ currentLevel: level });
      },
      
      setFormation: (formation) => set({ playerFormation: formation }),
      
      setBattleResult: (result) => set({ battleResult: result }),
      
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
        defeatedEnemies: [],
      }),
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
      }),
    }
  )
);


