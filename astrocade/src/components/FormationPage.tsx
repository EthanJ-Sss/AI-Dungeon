import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import type { Character, Formation, Position } from '../types';
import levelsData from '../config/levels.json';
import charactersData from '../config/characters.json';

const ItemType = 'CHARACTER';

// 岩浆地块位置（与BattleScene中的坐标对应）
const LAVA_BLOCKS = [
  { row: 2, col: 4 }, // 战场中央
  { row: 1, col: 2 }, // 玩家左上
  { row: 3, col: 2 }, // 玩家左下
  { row: 1, col: 8 }, // 敌方右上
  { row: 3, col: 8 }, // 敌方右下
];

// 检查是否是岩浆地块
const isLavaBlock = (row: number, col: number): boolean => {
  return LAVA_BLOCKS.some(block => block.row === row && block.col === col);
};

interface GridCellProps {
  position: Position;
  character: Character | null;
  onDrop: (char: Character, pos: Position) => void;
  onRemove: (pos: Position) => void;
  isEnemy?: boolean;
}

function GridCell({ position, character, onDrop, onRemove, isEnemy = false }: GridCellProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item: { character: Character }) => {
      if (!isEnemy && !character) {
        onDrop(item.character, position);
      }
    },
    canDrop: () => !isEnemy && !character,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [character, isEnemy, onDrop, position]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: character ? { character } : null,
    canDrag: () => !isEnemy && !!character,
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEnemy) {
        onRemove(position);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [character, isEnemy, onRemove, position]);

  // 组合 drag 和 drop refs
  const attachRef = (el: HTMLDivElement | null) => {
    if (!isEnemy && el) {
      drop(el);
    }
  };

  const attachDragRef = (el: HTMLDivElement | null) => {
    if (!isEnemy && el && character) {
      drag(el);
    }
  };

  // 检查是否是岩浆地块
  const isLava = isLavaBlock(position.y, position.x);

  return (
    <div
      ref={attachRef}
      className={`
        relative w-20 h-20 border-2 rounded-lg flex items-center justify-center
        transition-all duration-200
        ${isEnemy ? 'border-red-500 bg-red-900/20' : 'border-blue-500 bg-blue-900/20'}
        ${isLava && !isEnemy ? 'border-orange-600 bg-orange-900/40 border-4 animate-pulse' : ''}
        ${isOver && !isEnemy && 'bg-blue-500/50 scale-105'}
        ${!character && !isEnemy && 'hover:bg-blue-500/30 cursor-pointer'}
      `}
      title={isLava && !isEnemy ? '⚠️ 岩浆地块：每10秒喷发一次，造成50点伤害！' : ''}
    >
      {/* 岩浆警告标记 */}
      {isLava && !isEnemy && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
          <div className="text-4xl opacity-50">🌋</div>
        </div>
      )}
      
      {character && (
        <div
          ref={attachDragRef}
          onClick={() => !isEnemy && onRemove(position)}
          className={`
            w-full h-full flex flex-col items-center justify-center text-white text-xs p-1 relative z-10
            ${!isEnemy && 'cursor-move hover:scale-110'}
            ${isDragging && 'opacity-50'}
          `}
        >
          <div className="text-2xl mb-1">{getRoleEmoji(character.role)}</div>
          <div className="text-[10px] text-center leading-tight truncate w-full">
            {character.name}
          </div>
        </div>
      )}
    </div>
  );
}

interface CharacterCardProps {
  character: Character;
  isPlaced: boolean;
}

function CharacterCard({ character, isPlaced }: CharacterCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { character },
    canDrag: () => !isPlaced,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [character, isPlaced]);

  return (
    <div
      ref={drag}
      className={`
        bg-slate-700 rounded-lg p-3 border-2 border-slate-600
        ${!isPlaced && 'cursor-move hover:border-blue-500 hover:scale-105'}
        ${isPlaced && 'opacity-40 cursor-not-allowed'}
        ${isDragging && 'opacity-50'}
        transition-all
      `}
    >
      <div className="text-center">
        <div className="text-3xl mb-1">{getRoleEmoji(character.role)}</div>
        <div className="text-white text-sm font-semibold truncate">{character.name}</div>
        <div className="text-slate-400 text-xs">{getRoleName(character.role)}</div>
      </div>
    </div>
  );
}

function FormationPageContent() {
  const playerCharacters = usePlayerStore((state) => state.characters);
  const setScene = useGameStore((state) => state.setScene);
  const setLevel = useGameStore((state) => state.setLevel);
  const setFormation = useGameStore((state) => state.setFormation);

  const [playerGrid, setPlayerGrid] = useState<(Character | null)[][]>(() =>
    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null))
  );

  // 加载敌方阵型（第一关）
  const level = levelsData[0];
  const enemyGrid: (Character | null)[][] = Array.from({ length: 3 }, () => 
    Array.from({ length: 3 }, () => null)
  );
  
  level.enemies.forEach((enemy) => {
    const preset = charactersData.find((c) => c.id === enemy.characterId);
    if (preset) {
      const enemyChar: Character = {
        id: `enemy_${enemy.characterId}_${enemy.position.x}_${enemy.position.y}`,
        name: preset.name,
        hp: preset.hp,
        maxHp: preset.hp,
        damage: preset.damage,
        moveSpeed: preset.moveSpeed,
        attackType: preset.attackType,
        role: preset.role,
      };
      enemyGrid[enemy.position.y][enemy.position.x] = enemyChar;
    }
  });

  const handleDrop = useCallback((char: Character, pos: Position) => {
    setPlayerGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      
      // 如果角色已经在网格中，先移除
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (newGrid[y][x]?.id === char.id) {
            newGrid[y][x] = null;
          }
        }
      }
      
      // 放置到新位置
      newGrid[pos.y][pos.x] = char;
      return newGrid;
    });
  }, []);

  const handleRemove = useCallback((pos: Position) => {
    setPlayerGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      newGrid[pos.y][pos.x] = null;
      return newGrid;
    });
  }, []);

  const getPlacedCharacterIds = () => {
    const ids = new Set<string>();
    playerGrid.forEach(row => {
      row.forEach(cell => {
        if (cell) ids.add(cell.id);
      });
    });
    return ids;
  };

  const handleStartBattle = () => {
    const placedIds = getPlacedCharacterIds();
    if (placedIds.size === 0) {
      alert('请至少放置一个角色！');
      return;
    }

    // 保存阵型数据
    const formation: Formation[] = [];
    playerGrid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          formation.push({
            playerId: cell.id,
            characterId: cell.id,
            position: { x, y },
          });
        }
      });
    });

    setFormation(formation);
    setLevel(level as any);
    setScene('battle');
  };

  const placedIds = getPlacedCharacterIds();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">阵型布置</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 玩家阵型 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">
              我方阵型 (3×3)
            </h2>
            <div className="flex flex-col gap-2">
              {playerGrid.map((row, y) => (
                <div key={y} className="flex gap-2 justify-center">
                  {row.map((cell, x) => (
                    <GridCell
                      key={`${x}-${y}`}
                      position={{ x, y }}
                      character={cell}
                      onDrop={handleDrop}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm text-center mt-4">
              拖拽角色到格子中或点击已放置的角色移除
            </p>
          </div>

          {/* 可用角色 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              可用角色
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {playerCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isPlaced={placedIds.has(char.id)}
                />
              ))}
            </div>
            {playerCharacters.length === 0 && (
              <p className="text-slate-400 text-center py-8">暂无可用角色</p>
            )}
          </div>

          {/* 敌方阵型 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-red-500">
            <h2 className="text-2xl font-bold text-red-400 mb-4 text-center">
              敌方阵型 (3×3)
            </h2>
            <div className="flex flex-col gap-2">
              {enemyGrid.map((row, y) => (
                <div key={y} className="flex gap-2 justify-center">
                  {row.map((cell, x) => (
                    <GridCell
                      key={`enemy-${x}-${y}`}
                      position={{ x, y }}
                      character={cell}
                      onDrop={() => {}}
                      onRemove={() => {}}
                      isEnemy={true}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm text-center mt-4">
              {level.name}
            </p>
          </div>
        </div>

        {/* 岩浆地块图例说明 */}
        {level.scene === 'volcano' && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-orange-500 mb-8">
            <h3 className="text-xl font-bold text-orange-400 mb-4 text-center flex items-center justify-center gap-2">
              <span className="text-2xl">🌋</span>
              <span>火山关卡特殊机制</span>
            </h3>
            <div className="space-y-3 text-white">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-semibold text-orange-300">环境燃烧</p>
                  <p className="text-sm text-slate-300">
                    战场中持续燃烧，所有单位每秒受到 <span className="text-red-400 font-bold">{level.burnDamage || 0}</span> 点伤害
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    • 火系角色免疫燃烧 • 冰系角色燃烧伤害减少50%
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💥</span>
                <div>
                  <p className="font-semibold text-orange-300">岩浆喷发</p>
                  <p className="text-sm text-slate-300">
                    带有 <span className="text-orange-400">🌋标记</span> 的地块每 <span className="text-yellow-400 font-bold">10秒</span> 喷发一次，造成 <span className="text-red-400 font-bold">50点</span> 伤害
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    • 喷发前1.5秒会有红色警告 • 大地系角色岩浆伤害减少40%
                  </p>
                </div>
              </div>
              <div className="bg-orange-900/30 rounded-lg p-3 mt-2">
                <p className="text-sm text-orange-200">
                  ⚡ <span className="font-semibold">策略提示：</span>避开岩浆地块布阵，使用火系/冰系角色抵抗燃烧，携带治疗角色确保生存！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setScene('home')}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            返回主页
          </button>
          <button
            onClick={handleStartBattle}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            开始战斗
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FormationPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <FormationPageContent />
    </DndProvider>
  );
}

function getRoleName(role: string): string {
  const roleMap: Record<string, string> = {
    warrior: '战士',
    archer: '弓手',
    assassin: '刺客',
    healer: '治疗',
  };
  return roleMap[role] || role;
}

function getRoleEmoji(role: string): string {
  const emojiMap: Record<string, string> = {
    warrior: '⚔️',
    archer: '🏹',
    assassin: '🗡️',
    healer: '✨',
  };
  return emojiMap[role] || '👤';
}

