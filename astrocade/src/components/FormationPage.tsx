import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import type { Character, Formation, Position } from '../types';
import levelsData from '../config/levels.json';
import volcanoCharactersData from '../config/volcanoCharacters.json';

const ItemType = 'CHARACTER';

// 岩浆地块位置（战场中央）
const LAVA_BLOCKS = [
  { row: 0, col: 0 }, // 中央上
  { row: 1, col: 0 }, // 中央中
  { row: 2, col: 0 }, // 中央下
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
  isLavaZone?: boolean;
}

function GridCell({ position, character, onDrop, onRemove, isEnemy = false, isLavaZone = false }: GridCellProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item: { character: Character }) => {
      if (!isEnemy && !isLavaZone && !character) {
        onDrop(item.character, position);
      }
    },
    canDrop: () => !isEnemy && !isLavaZone && !character,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [character, isEnemy, isLavaZone, onDrop, position]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: character ? { character } : null,
    canDrag: () => !isEnemy && !isLavaZone && !!character,
    end: (item, monitor) => {
      if (monitor.didDrop() && !isEnemy && !isLavaZone) {
        onRemove(position);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [character, isEnemy, isLavaZone, onRemove, position]);

  // 组合 drag 和 drop refs
  const attachRef = (el: HTMLDivElement | null) => {
    if (!isEnemy && !isLavaZone && el) {
      drop(el);
    }
  };

  const attachDragRef = (el: HTMLDivElement | null) => {
    if (!isEnemy && !isLavaZone && el && character) {
      drag(el);
    }
  };

  // 检查是否是岩浆地块
  const isLava = isLavaZone && isLavaBlock(position.y, position.x);

  // 获取元素图标
  const getElementIcon = (element?: string) => {
    const icons: Record<string, string> = {
      fire: '🔥',
      ice: '❄️',
      earth: '🪨',
      water: '💧',
      neutral: '⚪',
    };
    return element ? icons[element] || '' : '';
  };

  return (
    <div
      ref={attachRef}
      className={`
        relative w-16 h-16 border-2 rounded-lg flex items-center justify-center
        transition-all duration-200
        ${isEnemy ? 'border-red-500 bg-red-900/30' : ''}
        ${!isEnemy && !isLavaZone ? 'border-blue-500 bg-blue-900/30' : ''}
        ${isLavaZone && isLava ? 'border-orange-600 bg-orange-900/60 border-4 animate-pulse' : ''}
        ${isLavaZone && !isLava ? 'border-gray-600 bg-gray-800/40' : ''}
        ${isOver && !isEnemy && !isLavaZone && 'bg-blue-500/50 scale-105'}
        ${!character && !isEnemy && !isLavaZone && 'hover:bg-blue-500/30 cursor-pointer'}
      `}
      title={isLava ? '⚠️ 岩浆地块：每10秒喷发一次，造成80点伤害！' : ''}
    >
      {/* 岩浆警告标记 */}
      {isLava && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
          <div className="text-3xl opacity-70">🌋</div>
        </div>
      )}
      
      {character && (
        <div
          ref={attachDragRef}
          onClick={() => !isEnemy && !isLavaZone && onRemove(position)}
          className={`
            w-full h-full flex flex-col items-center justify-center text-white text-xs p-1 relative z-10
            ${!isEnemy && !isLavaZone && 'cursor-move hover:scale-110'}
            ${isDragging && 'opacity-50'}
          `}
        >
          <div className="flex items-center gap-1 mb-1">
            <div className="text-xl">{getRoleEmoji(character.role)}</div>
            {(character as any).element && (
              <div className="text-xs">{getElementIcon((character as any).element)}</div>
            )}
          </div>
          <div className="text-[9px] text-center leading-tight truncate w-full font-semibold">
            {character.name}
          </div>
          <div className="text-[8px] text-slate-400">
            {character.hp}HP
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

  const getElementIcon = (element?: string) => {
    const icons: Record<string, string> = {
      fire: '🔥',
      ice: '❄️',
      earth: '🪨',
      water: '💧',
      neutral: '⚪',
    };
    return element ? icons[element] || '' : '';
  };

  return (
    <div
      ref={drag}
      className={`
        bg-slate-700 rounded-lg p-2 border-2 border-slate-600
        ${!isPlaced && 'cursor-move hover:border-blue-500 hover:scale-105'}
        ${isPlaced && 'opacity-40 cursor-not-allowed'}
        ${isDragging && 'opacity-50'}
        transition-all
      `}
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <div className="text-2xl">{getRoleEmoji(character.role)}</div>
          {(character as any).element && (
            <div className="text-sm">{getElementIcon((character as any).element)}</div>
          )}
        </div>
        <div className="text-white text-xs font-semibold truncate">{character.name}</div>
        <div className="text-slate-400 text-[10px]">{getRoleName(character.role)}</div>
        <div className="text-slate-400 text-[10px]">{character.hp}HP</div>
      </div>
    </div>
  );
}

function FormationPageContent() {
  const playerCharacters = usePlayerStore((state) => state.characters);
  const currentLevel = useGameStore((state) => state.currentLevel);
  const setScene = useGameStore((state) => state.setScene);
  const setLevel = useGameStore((state) => state.setLevel);
  const setFormation = useGameStore((state) => state.setFormation);

  const [playerGrid, setPlayerGrid] = useState<(Character | null)[][]>(() =>
    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null))
  );

  // 使用当前选中的关卡（如果没有，则使用第一关）
  const level = currentLevel || levelsData[0];
  
  console.log(`[FormationPage] 当前关卡: ID=${level.id}, 名称=${level.name}`);
  
  // 加载敌方阵型
  const enemyGrid: (Character | null)[][] = Array.from({ length: 3 }, () => 
    Array.from({ length: 3 }, () => null)
  );
  
  level.enemies.forEach((enemy) => {
    // 先在火山角色中查找
    let preset = volcanoCharactersData.find((c) => c.id === enemy.characterId);
    
    // 如果没找到，再在普通角色中查找
    if (!preset) {
      preset = null; // characters.json 暂时不加载，因为火山关卡使用火山角色
    }
    
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
        ...(preset.element && { element: preset.element }),
      } as any;
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-2">⚔️ 战场布阵 ⚔️</h1>
        <p className="text-slate-400 text-center mb-6">{level.name} - {level.difficulty}</p>

        {/* 完整战场布局 */}
        <div className="bg-slate-800/50 rounded-xl p-6 border-2 border-slate-700 mb-6">
          <div className="flex items-center justify-center gap-4">
            {/* 我方区域 */}
            <div className="flex flex-col items-center">
              <div className="text-blue-400 font-bold mb-2 text-sm flex items-center gap-2">
                <span>🛡️</span>
                <span>我方阵地</span>
              </div>
              <div className="flex flex-col gap-1 bg-blue-900/20 p-3 rounded-lg border-2 border-blue-500">
                {playerGrid.map((row, y) => (
                  <div key={y} className="flex gap-1">
                    {row.map((cell, x) => (
                      <GridCell
                        key={`player-${x}-${y}`}
                        position={{ x, y }}
                        character={cell}
                        onDrop={handleDrop}
                        onRemove={handleRemove}
                        isEnemy={false}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="text-slate-500 text-xs mt-2 text-center">
                拖拽角色到格子<br/>或点击移除
              </div>
            </div>

            {/* 中间火山区域 */}
            {level.scene === 'volcano' && (
              <div className="flex flex-col items-center">
                <div className="text-orange-400 font-bold mb-2 text-sm flex items-center gap-2">
                  <span>🌋</span>
                  <span>火山地带</span>
                </div>
                <div className="flex flex-col gap-1 bg-orange-900/20 p-3 rounded-lg border-2 border-orange-600">
                  {Array.from({ length: 3 }).map((_, y) => (
                    <div key={y} className="flex gap-1">
                      <GridCell
                        key={`lava-0-${y}`}
                        position={{ x: 0, y }}
                        character={null}
                        onDrop={() => {}}
                        onRemove={() => {}}
                        isLavaZone={true}
                      />
                    </div>
                  ))}
                </div>
                <div className="text-orange-400 text-xs mt-2 text-center font-semibold">
                  ⚠️ 危险区域<br/>岩浆喷发
                </div>
              </div>
            )}

            {/* 敌方区域 */}
            <div className="flex flex-col items-center">
              <div className="text-red-400 font-bold mb-2 text-sm flex items-center gap-2">
                <span>⚔️</span>
                <span>敌方阵地</span>
              </div>
              <div className="flex flex-col gap-1 bg-red-900/20 p-3 rounded-lg border-2 border-red-500">
                {enemyGrid.map((row, y) => (
                  <div key={y} className="flex gap-1">
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
              <div className="text-slate-500 text-xs mt-2 text-center">
                敌方预设<br/>阵容
              </div>
            </div>
          </div>
        </div>

        {/* 下方两列：可用角色 + 关卡信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 可用角色 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-3 text-center">
              📦 可用角色 ({playerCharacters.length})
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
              {playerCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isPlaced={placedIds.has(char.id)}
                />
              ))}
            </div>
            {playerCharacters.length === 0 && (
              <p className="text-slate-400 text-center py-8">暂无可用角色<br/>请先招募角色</p>
            )}
          </div>

          {/* 关卡信息与火山机制说明 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-orange-500">
            <h3 className="text-xl font-bold text-orange-400 mb-3 text-center flex items-center justify-center gap-2">
              <span className="text-2xl">🌋</span>
              <span>关卡机制</span>
            </h3>
            <div className="space-y-3 text-sm">
              {/* 关卡基本信息 */}
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300">关卡名称：</span>
                  <span className="text-white font-bold">{level.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300">难度：</span>
                  <span className={`font-bold ${
                    level.difficulty === 'Boss' ? 'text-purple-400' :
                    level.difficulty === '极难' ? 'text-red-400' :
                    level.difficulty === '困难' ? 'text-orange-400' :
                    level.difficulty === '中等' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>{level.difficulty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">战斗时长：</span>
                  <span className="text-blue-400 font-bold">{level.duration || 30}秒</span>
                </div>
              </div>

              {/* 火山机制 */}
              {level.scene === 'volcano' && (
                <>
                  <div className="flex items-start gap-2 bg-red-900/30 rounded-lg p-2">
                    <span className="text-xl">🔥</span>
                    <div className="flex-1">
                      <p className="font-semibold text-orange-300">环境燃烧</p>
                      <p className="text-xs text-slate-300">
                        持续燃烧：<span className="text-red-400 font-bold">{level.burnDamage || 0}点/秒</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        🔥火系免疫 • ❄️冰系-70% • 🪨大地系全额
                      </p>
                    </div>
                  </div>
                  
                  {level.id >= 3 && (
                    <div className="flex items-start gap-2 bg-orange-900/30 rounded-lg p-2">
                      <span className="text-xl">🌋</span>
                      <div className="flex-1">
                        <p className="font-semibold text-orange-300">岩浆喷发</p>
                        <p className="text-xs text-slate-300">
                          喷发伤害：<span className="text-red-400 font-bold">80点</span> (每10秒)
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          ⚠️喷发前1.5秒警告 • 🪨大地系-40%
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-900/30 rounded-lg p-2">
                    <p className="text-xs text-blue-200 flex items-start gap-1">
                      <span>💡</span>
                      <span>
                        <span className="font-semibold">策略：</span>
                        携带❄️冰系角色抵抗燃烧，避开🌋岩浆地块，带✨治疗确保生存！
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setScene('home')}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition shadow-lg"
          >
            ← 返回主页
          </button>
          <button
            onClick={handleStartBattle}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition shadow-lg"
          >
            ⚔️ 开始战斗
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
