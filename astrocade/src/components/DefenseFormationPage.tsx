// @ts-nocheck
import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useLadderStore } from '../store/ladderStore';
import { usePlayerStore } from '../store/playerStore';
import type { Character, FormationSnapshot, SnapshotUnit } from '../types';
import { calculateTeamPower } from '../utils/teamPowerCalculator';

export default function DefenseFormationPage() {
  const { setScene } = useGameStore();
  const { myLadderData, updateDefenseFormation } = useLadderStore();
  const { characters } = usePlayerStore();
  
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [placedPositions, setPlacedPositions] = useState<Map<string, { col: number; row: number }>>(new Map());

  // 从现有的防守阵容加载
  useEffect(() => {
    if (myLadderData?.defenseFormationSnapshot) {
      const snapshot = myLadderData.defenseFormationSnapshot;
      
      // 从快照恢复角色
      const restoredChars: Character[] = [];
      const positions = new Map<string, { col: number; row: number }>();
      
      snapshot.units.forEach((unit) => {
        // 从 characters 中找到对应的角色
        const char = characters.find(c => c.id === unit.characterId);
        if (char) {
          restoredChars.push(char);
          positions.set(char.id, unit.position);
        }
      });
      
      setSelectedCharacters(restoredChars);
      setPlacedPositions(positions);
    }
  }, [myLadderData, characters]);

  const handleSelectCharacter = (char: Character) => {
    if (selectedCharacters.find(c => c.id === char.id)) {
      // 取消选择
      setSelectedCharacters(prev => prev.filter(c => c.id !== char.id));
      setPlacedPositions(prev => {
        const newMap = new Map(prev);
        newMap.delete(char.id);
        return newMap;
      });
    } else if (selectedCharacters.length < 3) {
      // 选择（最多3个）
      setSelectedCharacters(prev => [...prev, char]);
    }
  };

  const handlePlaceCharacter = (charId: string, col: number, row: number) => {
    setPlacedPositions(prev => {
      const newMap = new Map(prev);
      
      // 检查该位置是否已被占用
      for (const [existingId, pos] of newMap.entries()) {
        if (pos.col === col && pos.row === row && existingId !== charId) {
          // 位置被占用，交换位置
          const oldPos = newMap.get(charId);
          if (oldPos) {
            newMap.set(existingId, oldPos);
          } else {
            newMap.delete(existingId);
          }
          break;
        }
      }
      
      newMap.set(charId, { col, row });
      return newMap;
    });
  };

  const handleSave = () => {
    if (selectedCharacters.length === 0) {
      alert('请至少选择一个角色！');
      return;
    }

    // 检查是否所有角色都已放置
    for (const char of selectedCharacters) {
      if (!placedPositions.has(char.id)) {
        alert(`请为 ${char.name} 安排位置！`);
        return;
      }
    }

    // 创建 FormationSnapshot
    const snapshot: FormationSnapshot = {
      timestamp: new Date().toISOString(),
      totalPower: calculateTeamPower(selectedCharacters),
      units: selectedCharacters.map(char => {
        const position = placedPositions.get(char.id)!;
        
        const unit: SnapshotUnit = {
          characterId: char.id,
          name: char.name,
          level: char.level,
          position,
          maxHp: char.maxHp,
          currentHp: char.maxHp,
          attack: char.attack,
          defense: char.defense,
          speed: char.speed,
          role: char.role,
          rarity: char.rarity,
          // 添加战斗相关字段
          moveSpeed: char.moveSpeed,
          attackType: char.attackType,
          skills: char.skills || [],
          passiveSkills: char.passiveSkills || [],
        };
        
        return unit;
      }),
    };

    // 保存到 Store
    updateDefenseFormation(snapshot);
    
    alert('防守阵容已保存！');
    setScene('ladder');
  };

  const handleCancel = () => {
    setScene('ladder');
  };

  const teamPower = calculateTeamPower(selectedCharacters);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🛡️ 设置防守阵容
          </h1>
          <p className="text-slate-400">
            选择最多3个角色作为你的防守阵容，其他玩家挑战你时将面对这个阵容
          </p>
        </div>

        {/* 当前阵容信息 */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">当前防守阵容</h2>
              <p className="text-slate-400 text-sm mt-1">
                已选择: {selectedCharacters.length}/3
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">阵容战力</div>
              <div className="text-3xl font-bold text-yellow-400">
                {teamPower}
              </div>
            </div>
          </div>
        </div>

        {/* 布阵区域 */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">📍 布阵 (3x3 区域)</h3>
          
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[0, 1, 2].map(row => (
              [0, 1, 2].map(col => {
                // 找到放置在这个位置的角色
                const charAtPos = selectedCharacters.find(char => {
                  const pos = placedPositions.get(char.id);
                  return pos && pos.col === col && pos.row === row;
                });

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`
                      aspect-square rounded-lg border-2 border-dashed
                      flex items-center justify-center
                      transition-all cursor-pointer
                      ${charAtPos 
                        ? 'border-blue-500 bg-blue-500/20' 
                        : 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'
                      }
                    `}
                    onClick={() => {
                      // 如果有未放置的角色，点击空格子就放置第一个
                      if (!charAtPos) {
                        const unplacedChar = selectedCharacters.find(
                          c => !placedPositions.has(c.id)
                        );
                        if (unplacedChar) {
                          handlePlaceCharacter(unplacedChar.id, col, row);
                        }
                      }
                    }}
                  >
                    {charAtPos ? (
                      <div className="text-center">
                        <div className="text-2xl mb-1">
                          {charAtPos.role === 'tank' && '🛡️'}
                          {charAtPos.role === 'warrior' && '⚔️'}
                          {charAtPos.role === 'mage' && '🔮'}
                          {charAtPos.role === 'assassin' && '🗡️'}
                          {charAtPos.role === 'support' && '✨'}
                        </div>
                        <div className="text-xs font-bold">{charAtPos.name}</div>
                        <div className="text-xs text-slate-400">Lv.{charAtPos.level}</div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs">
                        点击放置
                      </div>
                    )}
                  </div>
                );
              })
            ))}
          </div>

          <div className="mt-4 text-center text-sm text-slate-400">
            💡 提示: 前排(左侧)适合坦克，后排(右侧)适合法师和辅助
          </div>
        </div>

        {/* 角色选择列表 */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">👥 选择角色</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {characters.map(char => {
              const isSelected = selectedCharacters.find(c => c.id === char.id);
              const isPlaced = placedPositions.has(char.id);
              
              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50'
                      : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">
                      {char.role === 'tank' && '🛡️'}
                      {char.role === 'warrior' && '⚔️'}
                      {char.role === 'mage' && '🔮'}
                      {char.role === 'assassin' && '🗡️'}
                      {char.role === 'support' && '✨'}
                    </div>
                    {isSelected && (
                      <div className="text-green-400">
                        {isPlaced ? '✅' : '⏳'}
                      </div>
                    )}
                  </div>
                  
                  <div className="font-bold">{char.name}</div>
                  <div className="text-sm text-slate-400">Lv.{char.level}</div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                    <div>❤️ {char.maxHp}</div>
                    <div>⚔️ {char.attack}</div>
                    <div>🛡️ {char.defense}</div>
                    <div>⚡ {char.speed}</div>
                  </div>
                  
                  <div className={`
                    mt-2 text-xs px-2 py-1 rounded text-center
                    ${char.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                      char.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                      char.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }
                  `}>
                    {char.rarity === 'legendary' ? '传说' :
                     char.rarity === 'epic' ? '史诗' :
                     char.rarity === 'rare' ? '稀有' : '普通'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 py-4 px-8 rounded-xl font-bold text-lg
                     bg-slate-700 hover:bg-slate-600
                     transition-all transform hover:scale-105"
          >
            ❌ 取消
          </button>
          
          <button
            onClick={handleSave}
            disabled={selectedCharacters.length === 0}
            className={`
              flex-1 py-4 px-8 rounded-xl font-bold text-lg
              transition-all transform
              ${selectedCharacters.length === 0
                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-105 shadow-lg'
              }
            `}
          >
            💾 保存阵容
          </button>
        </div>
      </div>
    </div>
  );
}

