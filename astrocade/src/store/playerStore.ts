import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, Prisoner } from '../types';
import levelConfigData from '../config/levelConfig.json';

interface PlayerState {
  // 玩家角色列表（最多6个）
  characters: Character[];
  // 俘虏列表（最多10个）
  prisoners: Prisoner[];
  // 当前金币（预留）
  gold: number;
  
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
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      characters: [],
      prisoners: [],
      gold: 0,

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
        }),
    }),
    {
      name: 'player-storage',
    }
  )
);


