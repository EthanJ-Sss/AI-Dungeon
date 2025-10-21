import { useState } from 'react';
import type { Character, PresetCharacter } from '../types';
import { getSkillsInfo, getSkillTypeIcon } from '../utils/skillUtils';

interface ReplaceCharacterModalProps {
  newCharacter: PresetCharacter;
  currentCharacters: Character[];
  onConfirm: (oldCharId: string) => void;
  onCancel: () => void;
}

export default function ReplaceCharacterModal({
  newCharacter,
  currentCharacters,
  onConfirm,
  onCancel,
}: ReplaceCharacterModalProps) {
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const newCharSkills = getSkillsInfo(newCharacter.skills);

  const handleConfirm = () => {
    if (selectedCharId) {
      onConfirm(selectedCharId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500">
        {/* 标题 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white text-center">
            角色列表已满！请选择要替换的角色
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* 新角色展示 */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span>⭐</span>
              <span>新招募的角色</span>
            </h3>
            <div className="bg-gradient-to-br from-green-900/50 to-green-700/50 rounded-lg p-4 border-2 border-green-500">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl">
                  {getRoleEmoji(newCharacter.role)}
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-white">{newCharacter.name}</div>
                  <div className="text-green-300">{getRoleName(newCharacter.role)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-300">HP: <span className="text-green-400 font-bold">{newCharacter.hp}</span></div>
                  <div className="text-sm text-slate-300">攻击: <span className="text-red-400 font-bold">{newCharacter.damage}</span></div>
                </div>
              </div>
              
              {/* 新角色技能 */}
              {newCharSkills.length > 0 && (
                <div className="border-t border-green-600 pt-3 space-y-2">
                  {newCharSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{getSkillTypeIcon(skill.id)}</span>
                      <span className="text-white font-semibold">{skill.name}</span>
                      <span className="text-green-200 text-xs">- {skill.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 当前角色列表 */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">
              选择要替换的角色
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {currentCharacters.map((char) => {
                const isSelected = selectedCharId === char.id;
                const charSkills = getSkillsInfo(char.skills);
                
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`
                      bg-slate-700/50 rounded-lg p-4 border-2 cursor-pointer transition
                      ${isSelected 
                        ? 'border-red-500 bg-red-900/30 ring-2 ring-red-500' 
                        : 'border-slate-600 hover:border-red-400'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-xl">
                        {getRoleEmoji(char.role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold truncate">{char.name}</div>
                        <div className="text-xs text-slate-400">{getRoleName(char.role)}</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>HP: {char.hp} | 攻击: {char.damage}</div>
                      <div className="text-slate-400">
                        技能: {charSkills.length}个
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-2 text-center text-red-400 font-bold text-sm">
                        ✓ 将被替换
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-4 pt-4 border-t border-slate-600">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              取消招募
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedCharId}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedCharId ? '确认替换' : '请选择要替换的角色'}
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


