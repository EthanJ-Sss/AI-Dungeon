import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, Prisoner, CharacterRarity } from '../types';
import levelConfigData from '../config/levelConfig.json';

interface PlayerState {
  // 玩家角色列表（最多6个）
  characters: Character[];
  // 俘虏列表（最多10个）
  prisoners: Prisoner[];
  // 当前金币（预留）
  gold: number;
  // 道具背包
  items: Record<string, number>;
  // 最高通关关卡数（0=未通关任何关卡）
  maxClearedLevel: number;
  
  // Actions
  addCharacter: (character: Character) => void;
  removeCharacter: (id: string) => void;
  updateCharacter: (character: Character) => void;
  replaceCharacter: (oldCharId: string, newCharacter: Character) => void;
  addPrisoner: (prisoner: Prisoner) => void;
  removePrisoner: (characterId: string) => void;
  gainExp: (characterId: string, exp: number) => void;
  levelUp: (characterId: string) => void;
  clearAll: () => void;
  
  // 道具系统Actions
  addItem: (itemId: string, amount: number) => void;
  removeItem: (itemId: string, amount: number) => boolean;
  getItemCount: (itemId: string) => number;
  hasItem: (itemId: string, required: number) => boolean;
  
  // 进度系统Actions
  updateMaxClearedLevel: (level: number) => void;
  getUnlockedRarities: () => CharacterRarity[];
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      characters: [],
      prisoners: [],
      gold: 0,
      items: {
        'item_recruit_ticket': 3, // 初始赠送3张招募券
      },
      maxClearedLevel: 0, // 初始未通关任何关卡

      addCharacter: (character) =>
        set((state) => ({
          characters: state.characters.length < 6 
            ? [...state.characters, character]
            : state.characters,
        })),

      removeCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        })),

      updateCharacter: (character) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === character.id ? character : c
          ),
        })),

      replaceCharacter: (oldCharId, newCharacter) =>
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === oldCharId ? newCharacter : c
          ),
        })),

      addPrisoner: (prisoner) =>
        set((state) => ({
          prisoners: state.prisoners.length < 10
            ? [...state.prisoners, prisoner]
            : state.prisoners,
        })),

      removePrisoner: (characterId) =>
        set((state) => ({
          prisoners: state.prisoners.filter((p) => p.characterId !== characterId),
        })),

      gainExp: (characterId, exp) =>
        set((state) => {
          const newCharacters = state.characters.map((char) => {
            if (char.id !== characterId) return char;

            const currentLevel = char.level || 1;
            const currentExp = (char.exp || 0) + exp;
            const levelConfig = levelConfigData.find((lc) => lc.level === currentLevel);
            const nextLevelConfig = levelConfigData.find((lc) => lc.level === currentLevel + 1);

            if (!nextLevelConfig) {
              // 已达到最高等级
              return { ...char, exp: currentExp };
            }

            const expToNext = nextLevelConfig.expRequired - (levelConfig?.expRequired || 0);

            if (currentExp >= expToNext) {
              // 升级
              const newLevel = currentLevel + 1;
              const remainingExp = currentExp - expToNext;
              const newLevelConfig = levelConfigData.find((lc) => lc.level === newLevel);
              const nextNextLevelConfig = levelConfigData.find((lc) => lc.level === newLevel + 1);

              const baseHp = char.maxHp - (levelConfig?.hpBonus || 0);
              const baseDamage = char.damage - (levelConfig?.damageBonus || 0);

              const newMaxHp = baseHp + (newLevelConfig?.hpBonus || 0);
              const newDamage = baseDamage + (newLevelConfig?.damageBonus || 0);

              const newExpToNext = nextNextLevelConfig
                ? nextNextLevelConfig.expRequired - (newLevelConfig?.expRequired || 0)
                : 0;

              console.log(`[PlayerStore] ${char.name} 升级到 Lv.${newLevel}! HP:${newMaxHp} ATK:${newDamage}`);

              return {
                ...char,
                level: newLevel,
                exp: remainingExp,
                expToNext: newExpToNext,
                maxHp: newMaxHp,
                hp: newMaxHp,
                damage: newDamage,
              };
            }

            return { ...char, exp: currentExp, expToNext: expToNext };
          });

          return { characters: newCharacters };
        }),

      levelUp: (characterId) =>
        set((state) => {
          const newCharacters = state.characters.map((char) => {
            if (char.id !== characterId) return char;

            const currentLevel = char.level || 1;
            const nextLevelConfig = levelConfigData.find((lc) => lc.level === currentLevel + 1);

            if (!nextLevelConfig) {
              console.log(`[PlayerStore] ${char.name} 已达到最高等级`);
              return char;
            }

            const newLevel = currentLevel + 1;
            const currentLevelConfig = levelConfigData.find((lc) => lc.level === currentLevel);
            const newLevelConfig = levelConfigData.find((lc) => lc.level === newLevel);
            const nextNextLevelConfig = levelConfigData.find((lc) => lc.level === newLevel + 1);

            const baseHp = char.maxHp - (currentLevelConfig?.hpBonus || 0);
            const baseDamage = char.damage - (currentLevelConfig?.damageBonus || 0);

            const newMaxHp = baseHp + (newLevelConfig?.hpBonus || 0);
            const newDamage = baseDamage + (newLevelConfig?.damageBonus || 0);

            const newExpToNext = nextNextLevelConfig
              ? nextNextLevelConfig.expRequired - (newLevelConfig?.expRequired || 0)
              : 0;

            return {
              ...char,
              level: newLevel,
              exp: 0,
              expToNext: newExpToNext,
              maxHp: newMaxHp,
              hp: newMaxHp,
              damage: newDamage,
            };
          });

          return { characters: newCharacters };
        }),

      clearAll: () =>
        set({
          characters: [],
          prisoners: [],
          gold: 0,
          items: {
            'item_recruit_ticket': 3, // 重置时也给3张招募券
          },
          maxClearedLevel: 0, // 重置通关进度
        }),

      // 道具系统方法
      addItem: (itemId, amount) =>
        set((state) => ({
          items: {
            ...state.items,
            [itemId]: (state.items[itemId] || 0) + amount,
          },
        })),

      removeItem: (itemId, amount) => {
        const state = get();
        const currentAmount = state.items[itemId] || 0;
        
        if (currentAmount < amount) {
          return false; // 道具不足
        }
        
        set((state) => ({
          items: {
            ...state.items,
            [itemId]: currentAmount - amount,
          },
        }));
        
        return true;
      },

      getItemCount: (itemId) => {
        const state = get();
        return state.items[itemId] || 0;
      },

      hasItem: (itemId, required) => {
        const state = get();
        return (state.items[itemId] || 0) >= required;
      },

      // 进度系统方法
      updateMaxClearedLevel: (level) =>
        set((state) => ({
          maxClearedLevel: Math.max(state.maxClearedLevel, level),
        })),

      getUnlockedRarities: () => {
        const state = get();
        const maxCleared = state.maxClearedLevel;
        const unlockedRarities: CharacterRarity[] = ['common'];
        
        if (maxCleared >= 2) {
          unlockedRarities.push('rare');
        }
        if (maxCleared >= 3) {
          unlockedRarities.push('epic');
        }
        
        return unlockedRarities;
      },
    }),
    {
      name: 'player-storage',
    }
  )
);


