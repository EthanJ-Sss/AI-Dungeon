import { useState } from 'react';
import type { Character, Prisoner } from '../types';
import { getSkillsInfo, getSkillTypeIcon } from '../utils/skillUtils';

interface CapturePrisonerModalProps {
  defeatedEnemies: Character[];
  onConfirm: (prisoner: Prisoner | null) => void;
  prisonerCount: number;
  maxPrisoners: number;
}

export default function CapturePrisonerModal({
  defeatedEnemies,
  onConfirm,
  prisonerCount,
  maxPrisoners,
}: CapturePrisonerModalProps) {
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedEnemyId) {
      onConfirm(null); // 跳过
      return;
    }

    const selectedEnemy = defeatedEnemies.find(e => e.id === selectedEnemyId);
    if (!selectedEnemy) {
      onConfirm(null);
      return;
    }

    // 创建俘虏数据
    const prisoner: Prisoner = {
      characterId: selectedEnemy.id,
      name: selectedEnemy.name,
      hp: selectedEnemy.maxHp,
      damage: selectedEnemy.damage,
      attackType: selectedEnemy.attackType,
      role: selectedEnemy.role,
      skills: selectedEnemy.skills || [],
    };

    onConfirm(prisoner);
  };

  const handleSkip = () => {
    onConfirm(null);
  };

  const isFull = prisonerCount >= maxPrisoners;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-500 shadow-2xl">
        {/* 标题 */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold text-white text-center">
            🎉 胜利！选择一名敌人成为俘虏
          </h2>
          <p className="text-center text-yellow-100 mt-2">
            俘虏可以用来学习技能 | 当前俘虏: {prisonerCount}/{maxPrisoners}
          </p>
          {isFull && (
            <div className="mt-3 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
              <p className="text-red-200 font-semibold">⚠️ 俘虏列表已满！新俘虏将无法添加</p>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* 敌人列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {defeatedEnemies.map((enemy) => {
              const isSelected = selectedEnemyId === enemy.id;
              const skillsInfo = getSkillsInfo(enemy.skills);
              
              return (
                <div
                  key={enemy.id}
                  onClick={() => setSelectedEnemyId(enemy.id)}
                  className={`
                    bg-slate-700/50 rounded-lg p-5 border-2 cursor-pointer transition transform
                    ${isSelected 
                      ? 'border-yellow-500 bg-yellow-900/30 ring-2 ring-yellow-500 scale-105' 
                      : 'border-slate-600 hover:border-yellow-400 hover:scale-102'
                    }
                  `}
                >
                  {/* 选中标记 */}
                  {isSelected && (
                    <div className="flex justify-center mb-3">
                      <span className="px-4 py-1 bg-yellow-500 text-black font-bold rounded-full text-sm">
                        ✓ 已选择
                      </span>
                    </div>
                  )}

                  {/* 角色头像和基本信息 */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-3xl">
                      {getRoleEmoji(enemy.role)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{enemy.name}</h3>
                      <p className="text-orange-300">{getRoleName(enemy.role)}</p>
                    </div>
                  </div>

                  {/* 属性信息 */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-800/50 rounded p-2 text-center">
                      <div className="text-slate-400 text-xs">生命</div>
                      <div className="text-green-400 font-bold">{enemy.hp}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2 text-center">
                      <div className="text-slate-400 text-xs">攻击</div>
                      <div className="text-red-400 font-bold">{enemy.damage}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2 text-center">
                      <div className="text-slate-400 text-xs">类型</div>
                      <div className="text-blue-400 text-xs font-semibold">
                        {enemy.attackType === 'melee' ? '近战' : '远程'}
                      </div>
                    </div>
                  </div>

                  {/* 技能列表 */}
                  {skillsInfo.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-1">
                        <span>⭐</span>
                        <span>技能列表 ({skillsInfo.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {skillsInfo.map((skill) => (
                          <div
                            key={skill.id}
                            className="bg-slate-800/70 rounded p-2 border border-slate-600"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getSkillTypeIcon(skill.id)}</span>
                              <span className="text-white font-semibold text-sm">{skill.name}</span>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              {skill.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 按钮 */}
          <div className="flex gap-4 pt-4 border-t border-slate-600">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              跳过，不要俘虏
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedEnemyId || isFull}
              className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFull 
                ? '俘虏列表已满' 
                : selectedEnemyId 
                  ? '确认俘虏' 
                  : '请选择要俘虏的敌人'}
            </button>
          </div>
        </div>
      </div>
    </div>
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


