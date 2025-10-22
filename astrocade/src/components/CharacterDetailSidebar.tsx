import { useEffect, useState } from 'react';
import type { Character, SkillConfig } from '../types';
import skillsData from '../config/skills.json';

interface Props {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterDetailSidebar({ character, isOpen, onClose }: Props) {
  const [skills, setSkills] = useState<SkillConfig[]>([]);

  useEffect(() => {
    if (character?.skills) {
      const characterSkills = (skillsData as SkillConfig[]).filter(skill =>
        character.skills?.includes(skill.id)
      );
      setSkills(characterSkills);
    }
  }, [character]);

  if (!character) return null;

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      warrior: '⚔️',
      archer: '🏹',
      assassin: '🗡️',
      healer: '✨',
    };
    return icons[role] || '❓';
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

  const getAttackTypeText = (type: string) => {
    return type === 'melee' ? '近战' : '远程';
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-slate-900 border-l-2 border-slate-700 
          shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {getRoleIcon(character.role)} {character.name}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Basic Attributes */}
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-200 mb-3">基础属性</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">生命值:</span>
                <span className="text-green-400 font-semibold">{character.hp} HP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">攻击力:</span>
                <span className="text-red-400 font-semibold">{character.damage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">移动速度:</span>
                <span className="text-blue-400 font-semibold">{character.moveSpeed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">攻击类型:</span>
                <span className="text-yellow-400">{getAttackTypeText(character.attackType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">职业:</span>
                <span className="text-purple-400">{character.role}</span>
              </div>
              {character.element && (
                <div className="flex justify-between">
                  <span className="text-slate-400">元素:</span>
                  <span className="text-orange-400">
                    {getElementIcon(character.element)} {character.element}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">主动技能</h3>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.id} className="bg-slate-700 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{skill.name}</h4>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        CD: {skill.cd}s
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{skill.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {skill.damage && (
                        <span className="bg-red-900/50 text-red-200 px-2 py-1 rounded">
                          伤害: {skill.damage}
                        </span>
                      )}
                      {skill.heal && (
                        <span className="bg-green-900/50 text-green-200 px-2 py-1 rounded">
                          治疗: {skill.heal}%
                        </span>
                      )}
                      {skill.range > 0 && (
                        <span className="bg-purple-900/50 text-purple-200 px-2 py-1 rounded">
                          范围: {skill.range}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Skills Message */}
          {skills.length === 0 && (
            <div className="bg-slate-800 rounded-lg p-4 text-center text-slate-400">
              该角色没有主动技能
            </div>
          )}
        </div>
      </div>
    </>
  );
}

