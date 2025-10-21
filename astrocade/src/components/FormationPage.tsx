import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import type { Character, Formation, Position } from '../types';
import levelsData from '../config/levels.json';
import volcanoCharactersData from '../config/volcanoCharacters.json';

const ItemType = 'CHARACTER';

// 战场配置：5行×11列
const BATTLEFIELD_ROWS = 5;
const BATTLEFIELD_COLS = 11;

// 玩家可放置区域：列 0-2
const PLAYER_COLS = [0, 1, 2];

// 敌方区域：列 8-10
const ENEMY_COLS = [8, 9, 10];

// 岩浆地块位置（与BattleScene完全一致）
const LAVA_BLOCKS = [
  { row: 2, col: 4 },  // 战场中央
  { row: 1, col: 2 },  // 玩家左上
  { row: 3, col: 2 },  // 玩家左下
  { row: 1, col: 8 },  // 敌方右上
  { row: 3, col: 8 },  // 敌方右下
];

// 检查是否是岩浆地块
const isLavaBlock = (row: number, col: number): boolean => {
  return LAVA_BLOCKS.some(block => block.row === row && block.col === col);
};

// 检查是否是玩家可放置区域
const isPlayerZone = (col: number): boolean => {
  return PLAYER_COLS.includes(col);
};

// 检查是否是敌方区域
const isEnemyZone = (col: number): boolean => {
  return ENEMY_COLS.includes(col);
};

interface GridCellProps {
  row: number;
  col: number;
  character: Character | null;
  onDrop: (char: Character, row: number, col: number) => void;
  onRemove: (row: number, col: number) => void;
}

function GridCell({ row, col, character, onDrop, onRemove }: GridCellProps) {
  const isPlayer = isPlayerZone(col);
  const isEnemy = isEnemyZone(col);
  const isLava = isLavaBlock(row, col);
  const isNeutral = !isPlayer && !isEnemy;

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item: { character: Character }) => {
      if (isPlayer && !character) {
        onDrop(item.character, row, col);
      }
    },
    canDrop: () => isPlayer && !character,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [character, isPlayer, onDrop, row, col]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: character ? { character } : null,
    canDrag: () => isPlayer && !!character,
    end: (item, monitor) => {
      if (monitor.didDrop() && isPlayer) {
        onRemove(row, col);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [character, isPlayer, onRemove, row, col]);

  const attachRef = (el: HTMLDivElement | null) => {
    if (isPlayer && el) {
      drop(el);
    }
  };

  const attachDragRef = (el: HTMLDivElement | null) => {
    if (isPlayer && el && character) {
      drag(el);
    }
  };

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

  // 获取格子边框颜色和背景
  const getCellStyle = () => {
    if (isLava) {
      return 'border-orange-500 bg-orange-900/60 border-2 animate-pulse';
    }
    if (isPlayer) {
      return 'border-blue-400 bg-blue-900/30';
    }
    if (isEnemy) {
      return 'border-red-400 bg-red-900/30';
    }
    return 'border-gray-600 bg-gray-800/20';
  };

  return (
    <div
      ref={attachRef}
      className={`
        relative w-14 h-14 border flex items-center justify-center
        transition-all duration-200 ${getCellStyle()}
        ${isOver && isPlayer && 'bg-blue-500/50 scale-105'}
        ${!character && isPlayer && 'hover:bg-blue-500/30 cursor-pointer'}
      `}
      title={
        isLava ? '⚠️ 岩浆地块：每10秒喷发，造成80点伤害！' :
        isPlayer ? '我方可放置区域' :
        isEnemy ? '敌方区域' :
        '中立区域'
      }
    >
      {/* 岩浆标记 */}
      {isLava && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-2xl opacity-70">🌋</div>
        </div>
      )}

      {/* 区域标识（仅在空格子显示） */}
      {!character && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          {isPlayer && <div className="text-xs text-blue-300">🛡️</div>}
          {isEnemy && <div className="text-xs text-red-300">⚔️</div>}
        </div>
      )}
      
      {/* 角色 */}
      {character && (
        <div
          ref={attachDragRef}
          onClick={() => isPlayer && onRemove(row, col)}
          className={`
            w-full h-full flex flex-col items-center justify-center text-white text-xs p-1 relative z-10
            ${isPlayer && 'cursor-move hover:scale-110'}
            ${isDragging && 'opacity-50'}
          `}
        >
          <div className="flex items-center gap-0.5">
            <div className="text-lg">{getRoleEmoji(character.role)}</div>
            {(character as any).element && (
              <div className="text-[10px]">{getElementIcon((character as any).element)}</div>
            )}
          </div>
          <div className="text-[8px] text-center leading-tight truncate w-full font-semibold">
            {character.name.slice(0, 4)}
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

  // 使用当前选中的关卡（如果没有，则使用第一关）
  const level = currentLevel || levelsData[0];

  // 使用完整的战场网格：5行×11列，初始化时加载敌方阵型
  const [battlefield, setBattlefield] = useState<(Character | null)[][]>(() => {
    const grid = Array.from({ length: BATTLEFIELD_ROWS }, () => 
      Array.from({ length: BATTLEFIELD_COLS }, () => null)
    );

    // 在初始化时加载敌方阵型
    level.enemies.forEach((enemy) => {
      const preset = volcanoCharactersData.find((c) => c.id === enemy.characterId);
      
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
        
        // 敌方位置映射：x(0-2) -> col(8-10), y(0-2) -> row(1-3)
        const col = 8 + enemy.position.x;
        const row = 1 + enemy.position.y;
        
        grid[row][col] = enemyChar;
      }
    });

    return grid;
  });
  
  console.log(`[FormationPage] 当前关卡: ID=${level.id}, 名称=${level.name}`);

  const handleDrop = useCallback((char: Character, row: number, col: number) => {
    setBattlefield(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      
      // 如果角色已经在网格中，先移除
      for (let r = 0; r < BATTLEFIELD_ROWS; r++) {
        for (let c = 0; c < BATTLEFIELD_COLS; c++) {
          if (newGrid[r][c]?.id === char.id) {
            newGrid[r][c] = null;
          }
        }
      }
      
      // 放置到新位置
      newGrid[row][col] = char;
      return newGrid;
    });
  }, []);

  const handleRemove = useCallback((row: number, col: number) => {
    setBattlefield(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      newGrid[row][col] = null;
      return newGrid;
    });
  }, []);

  const getPlacedCharacterIds = () => {
    const ids = new Set<string>();
    battlefield.forEach(row => {
      row.forEach(cell => {
        if (cell && !cell.id.startsWith('enemy_')) {
          ids.add(cell.id);
        }
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

    // 保存阵型数据（转换回3×3坐标系统）
    const formation: Formation[] = [];
    console.log('🔍 [FormationPage] 开始保存阵型...');
    console.log(`   战场尺寸: ${BATTLEFIELD_ROWS}行 × ${BATTLEFIELD_COLS}列`);
    
    battlefield.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          console.log(`   检查格子(${r}, ${c}): ${cell.name}, ID=${cell.id.substring(0, 20)}..., isPlayerZone=${isPlayerZone(c)}, isEnemy=${cell.id.startsWith('enemy_')}`);
        }
        if (cell && isPlayerZone(c) && !cell.id.startsWith('enemy_')) {
          // 映射：col(0-2) -> x(0-2), row(1-3) -> y(0-2)
          const x = c;
          const y = r - 1;
          console.log(`   ✅ 保存角色: ${cell.name}, 战场位置(${r}, ${c}) -> 阵型坐标(${x}, ${y}), y范围检查: ${y >= 0 && y <= 2}`);
          if (y >= 0 && y <= 2) {
            formation.push({
              playerId: cell.id,
              characterId: cell.id,
              position: { x, y },
            });
          } else {
            console.warn(`   ⚠️ 跳过角色（y超出范围）: ${cell.name}, y=${y}`);
          }
        }
      });
    });

    console.log(`🎯 [FormationPage] 最终保存了 ${formation.length} 个角色`);
    formation.forEach((f, i) => {
      console.log(`   ${i}: characterId=${f.characterId.substring(0, 20)}..., position=(${f.position.x}, ${f.position.y})`);
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
        <p className="text-slate-400 text-center mb-4">{level.name} - {level.difficulty}</p>

        {/* 战场布局 */}
        <div className="bg-slate-800/50 rounded-xl p-4 border-2 border-slate-700 mb-4">
          {/* 列标识 */}
          <div className="flex justify-center mb-2">
            <div className="flex gap-0">
              {Array.from({ length: BATTLEFIELD_COLS }).map((_, col) => (
                <div key={col} className="w-14 text-center text-xs text-slate-500 font-mono">
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* 战场网格 */}
          <div className="flex flex-col items-center gap-0">
            {battlefield.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-0">
                {/* 行标识 */}
                <div className="w-8 flex items-center justify-center text-xs text-slate-500 font-mono">
                  {rowIndex}
                </div>

                {/* 格子 */}
                {row.map((cell, colIndex) => (
                  <GridCell
                    key={`${rowIndex}-${colIndex}`}
                    row={rowIndex}
                    col={colIndex}
                    character={cell}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                  />
                ))}

                {/* 行标识 */}
                <div className="w-8 flex items-center justify-center text-xs text-slate-500 font-mono">
                  {rowIndex}
                </div>
              </div>
            ))}
          </div>

          {/* 列标识 */}
          <div className="flex justify-center mt-2">
            <div className="flex gap-0">
              {Array.from({ length: BATTLEFIELD_COLS }).map((_, col) => (
                <div key={col} className="w-14 text-center text-xs text-slate-500 font-mono">
                  {col}
                </div>
              ))}
            </div>
          </div>

          {/* 图例 */}
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 border-2 border-blue-400 bg-blue-900/30 rounded"></div>
              <span className="text-slate-300">🛡️ 我方区域 (列0-2)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 border border-gray-600 bg-gray-800/20 rounded"></div>
              <span className="text-slate-300">中立区域</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 border-2 border-orange-500 bg-orange-900/60 rounded"></div>
              <span className="text-slate-300">🌋 岩浆地块</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 border-2 border-red-400 bg-red-900/30 rounded"></div>
              <span className="text-slate-300">⚔️ 敌方区域 (列8-10)</span>
            </div>
          </div>
        </div>

        {/* 下方两列：可用角色 + 关卡信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* 可用角色 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-3 text-center">
              📦 可用角色 ({playerCharacters.length})
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
              {playerCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isPlaced={placedIds.has(char.id)}
                />
              ))}
            </div>
            {playerCharacters.length === 0 && (
              <p className="text-slate-400 text-center py-8 text-sm">暂无可用角色<br/>请先招募角色</p>
            )}
          </div>

          {/* 关卡信息 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-orange-500">
            <h3 className="text-lg font-bold text-orange-400 mb-3 text-center flex items-center justify-center gap-2">
              <span className="text-xl">🌋</span>
              <span>关卡机制</span>
            </h3>
            <div className="space-y-2 text-sm">
              {/* 基本信息 */}
              <div className="bg-slate-700/50 rounded-lg p-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">难度：</span>
                    <span className={`font-bold ${
                      level.difficulty === 'Boss' ? 'text-purple-400' :
                      level.difficulty === '极难' ? 'text-red-400' :
                      level.difficulty === '困难' ? 'text-orange-400' :
                      level.difficulty === '中等' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{level.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">时长：</span>
                    <span className="text-blue-400 font-bold">{level.duration || 30}秒</span>
                  </div>
                </div>
              </div>

              {/* 火山机制 */}
              {level.scene === 'volcano' && (
                <>
                  <div className="bg-red-900/30 rounded-lg p-2 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🔥</span>
                      <span className="font-semibold text-orange-300">环境燃烧</span>
                    </div>
                    <div className="text-slate-300 ml-7">
                      持续伤害：<span className="text-red-400 font-bold">{level.burnDamage || 0}点/秒</span>
                    </div>
                    <div className="text-[10px] text-slate-400 ml-7 mt-1">
                      🔥火系免疫 • ❄️冰系-70% • 🪨大地全额
                    </div>
                  </div>
                  
                  {level.id >= 3 && (
                    <div className="bg-orange-900/30 rounded-lg p-2 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🌋</span>
                        <span className="font-semibold text-orange-300">岩浆喷发</span>
                      </div>
                      <div className="text-slate-300 ml-7">
                        喷发伤害：<span className="text-red-400 font-bold">80点</span> (每10秒)
                      </div>
                      <div className="text-[10px] text-slate-400 ml-7 mt-1">
                        ⚠️提前1.5秒警告 • 🪨大地-40%
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-900/30 rounded-lg p-2">
                    <p className="text-xs text-blue-200 flex items-start gap-1">
                      <span>💡</span>
                      <span>带❄️冰系抵抗燃烧，避开🌋岩浆，带✨治疗保生存！</span>
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
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition shadow-lg text-sm"
          >
            ← 返回主页
          </button>
          <button
            onClick={handleStartBattle}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition shadow-lg text-sm"
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

function getRoleEmoji(role: string): string {
  const emojiMap: Record<string, string> = {
    warrior: '⚔️',
    archer: '🏹',
    assassin: '🗡️',
    healer: '✨',
  };
  return emojiMap[role] || '👤';
}
