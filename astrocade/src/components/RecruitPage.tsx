import { useState, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import type { PresetCharacter, Character } from '../types';
import { loadAllCharacters } from '../utils/characterLoader';

const charactersData = loadAllCharacters();
import { getSkillsInfo, getSkillTypeIcon } from '../utils/skillUtils';
import ReplaceCharacterModal from './ReplaceCharacterModal';
import elementsData from '../config/elements.json';

// 使用新的角色配置（已按元素分类，包含所有18个新角色）
const allCharactersData = charactersData;

export default function RecruitPage() {
  const [currentCharacter, setCurrentCharacter] = useState<PresetCharacter | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  
  const characters = usePlayerStore((state) => state.characters);
  const addCharacter = usePlayerStore((state) => state.addCharacter);
  const replaceCharacter = usePlayerStore((state) => state.replaceCharacter);
  const setScene = useGameStore((state) => state.setScene);
  const incrementStat = useGameStore((state) => state.incrementStat);
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const completeTutorial = useGameStore((state) => state.completeTutorial);

  // 获取随机角色（排除已拥有的）
  const getRandomCharacter = useCallback((): PresetCharacter => {
    const availableChars = (allCharactersData as PresetCharacter[]).filter(
      char => !characters.some(c => c.name === char.name)
    );
    
    if (availableChars.length === 0) {
      // 如果所有角色都已拥有，从全部角色中随机
      return allCharactersData[Math.floor(Math.random() * allCharactersData.length)] as PresetCharacter;
    }
    
    return availableChars[Math.floor(Math.random() * availableChars.length)];
  }, [characters]);

  // 初始化：随机一个角色
  useEffect(() => {
    if (!currentCharacter) {
      setCurrentCharacter(getRandomCharacter());
    }
  }, [currentCharacter, getRandomCharacter]);

  // 再次招募（重新随机）
  const handleReroll = () => {
    setCurrentCharacter(getRandomCharacter());
  };

  const handleConfirm = () => {
    if (!currentCharacter) return;

    // 创建角色实例
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: currentCharacter.name,
      hp: currentCharacter.hp,
      maxHp: currentCharacter.hp,
      damage: currentCharacter.damage,
      moveSpeed: currentCharacter.moveSpeed,
      attackType: currentCharacter.attackType,
      role: currentCharacter.role,
      element: currentCharacter.element,
      skillId: currentCharacter.skillId,
      skills: currentCharacter.skills || [],
      passiveSkills: currentCharacter.passiveSkills || [],
      level: 1,
      exp: 0,
      expToNext: 100,
    };

    console.log(`[RecruitPage] 招募角色: ${newCharacter.name}, 元素: ${newCharacter.element || '无'}, 技能: ${newCharacter.skills?.join(', ') || '无'}`);

    // 如果角色列表未满，直接添加
    if (characters.length < 6) {
      addCharacter(newCharacter);
      incrementStat('recruitCount');
      
      // 完成招募引导
      if (tutorialStep === 1) {
        completeTutorial(2);
      }
      
      // 招募成功，随机下一个
      setCurrentCharacter(getRandomCharacter());
    } else {
      // 角色列表已满，显示替换界面
      setShowReplaceModal(true);
    }
  };

  const handleReplaceConfirm = (oldCharId: string) => {
    if (!currentCharacter) return;

    // 创建新角色实例
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: currentCharacter.name,
      hp: currentCharacter.hp,
      maxHp: currentCharacter.hp,
      damage: currentCharacter.damage,
      moveSpeed: currentCharacter.moveSpeed,
      attackType: currentCharacter.attackType,
      role: currentCharacter.role,
      element: currentCharacter.element,
      skillId: currentCharacter.skillId,
      skills: currentCharacter.skills || [],
      passiveSkills: currentCharacter.passiveSkills || [],
      level: 1,
      exp: 0,
      expToNext: 100,
    };

    console.log(`[RecruitPage] 替换角色: ${newCharacter.name}, 元素: ${newCharacter.element || '无'}`);
    
    replaceCharacter(oldCharId, newCharacter);
    incrementStat('recruitCount');
    setShowReplaceModal(false);
    
    // 替换成功，随机下一个
    setCurrentCharacter(getRandomCharacter());
  };

  const handleReplaceCancel = () => {
    setShowReplaceModal(false);
  };

  const handleBack = () => {
    setScene('home');
  };

  if (!currentCharacter) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">加载中...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">招募英雄</h1>
            <p className="text-slate-400">
              发现新英雄！当前队伍 {characters.length}/6
            </p>
            {tutorialStep === 1 && (
              <div className="mt-4 p-3 bg-blue-900/50 border border-blue-500 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 <strong>新手提示：</strong>选择你喜欢的角色，点击"确认招募"按钮。建议先招募2-3个角色！
                </p>
              </div>
            )}
          </div>

        {/* 角色展示卡片 */}
        <div className="bg-slate-800 rounded-2xl p-8 border-2 border-blue-500 shadow-2xl mb-8">
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
              {getRoleEmoji(currentCharacter.role)}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {currentCharacter.name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block px-4 py-1 bg-blue-600 text-white rounded-full text-sm">
                {getRoleName(currentCharacter.role)}
              </span>
              {currentCharacter.element && (() => {
                const elementInfo = getElementInfo(currentCharacter.element);
                return (
                  <span 
                    className="inline-block px-4 py-1 text-white rounded-full text-sm font-semibold"
                    style={{ backgroundColor: elementInfo.color }}
                  >
                    {elementInfo.icon} {elementInfo.name}系
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-white mb-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">生命值</div>
              <div className="text-2xl font-bold text-green-400">{currentCharacter.hp}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">攻击力</div>
              <div className="text-2xl font-bold text-red-400">{currentCharacter.damage}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">移动速度</div>
              <div className="text-2xl font-bold text-yellow-400">{currentCharacter.moveSpeed}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">攻击方式</div>
              <div className="text-xl font-bold text-blue-400">
                {getAttackTypeName(currentCharacter.attackType)}
              </div>
            </div>
          </div>

          {/* 元素属性说明 */}
          {currentCharacter.element && (() => {
            const elementInfo = getElementInfo(currentCharacter.element);
            const elementData = elementsData.elements.find(e => e.id === currentCharacter.element);
            return (
              <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg p-4 mb-6 border-2" style={{ borderColor: elementInfo.color }}>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">{elementInfo.icon}</span>
                  <span>{elementInfo.name}系元素特性</span>
                </h3>
                <div className="text-slate-300 text-sm space-y-1">
                  {elementData?.passive && (
                    <>
                      {elementData.passive.burnImmune && <p>• 🛡️ 免疫燃烧伤害</p>}
                      {elementData.passive.igniteChance && (
                        <p>• 🔥 {(elementData.passive.igniteChance * 100).toFixed(0)}% 概率点燃敌人，造成持续伤害</p>
                      )}
                      {elementData.passive.hpRegenPercent && (
                        <p>• 💚 每{(elementData.passive.hpRegenInterval || 5000) / 1000}秒恢复{(elementData.passive.hpRegenPercent * 100).toFixed(0)}%生命值</p>
                      )}
                      {elementData.passive.slowChance && (
                        <p>• ❄️ {(elementData.passive.slowChance * 100).toFixed(0)}% 概率减速敌人{(elementData.passive.slowAmount * 100).toFixed(0)}%</p>
                      )}
                      {elementData.passive.hpBonus && (
                        <p>• 🪨 生命值提升{((elementData.passive.hpBonus - 1) * 100).toFixed(0)}%</p>
                      )}
                      {elementData.passive.startShieldPercent && (
                        <p>• 🛡️ 战斗开始获得{(elementData.passive.startShieldPercent * 100).toFixed(0)}%生命值的护盾</p>
                      )}
                    </>
                  )}
                  {!elementData?.passive && <p>• 无特殊被动效果</p>}
                </div>
              </div>
            );
          })()}

          {/* 技能信息 */}
          {currentCharacter.skills && currentCharacter.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span>⭐</span>
                <span>技能列表</span>
              </h3>
              <div className="space-y-3">
                {getSkillsInfo(currentCharacter.skills).map((skill, index) => (
                  <div
                    key={skill.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-blue-400 transition"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getSkillTypeIcon(skill.id)}</span>
                      <span className="text-lg font-bold text-white">{skill.name}</span>
                      <span className="ml-auto px-2 py-1 bg-blue-600/50 text-blue-200 text-xs rounded">
                        技能 {index + 1}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            返回主页
          </button>
          <button
            onClick={handleReroll}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
          >
            🎲 再次招募
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            {characters.length >= 6 ? '替换角色' : '确认招募'} ({characters.length}/6)
          </button>
        </div>
      </div>
    </div>

      {/* 替换Modal */}
      {showReplaceModal && currentCharacter && (
        <ReplaceCharacterModal
          newCharacter={currentCharacter}
          currentCharacters={characters}
          onConfirm={handleReplaceConfirm}
          onCancel={handleReplaceCancel}
        />
      )}
    </>
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

function getAttackTypeName(type: string): string {
  return type === 'melee' ? '近战' : '远程';
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

function getElementInfo(elementId?: string) {
  if (!elementId) {
    return { name: '无', icon: '⚪', color: '#cccccc' };
  }
  const element = elementsData.elements.find(e => e.id === elementId);
  return element ? { name: element.name, icon: element.icon, color: element.color } : { name: '无', icon: '⚪', color: '#cccccc' };
}


