import { useState, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import type { PresetCharacter, Character, CharacterRarity } from '../types';
import { loadAllCharacters } from '../utils/characterLoader';
import { recruitSystem } from '../utils/recruitSystem';

const charactersData = loadAllCharacters();
import { getSkillsInfo, getSkillTypeIcon } from '../utils/skillUtils';
import ReplaceCharacterModal from './ReplaceCharacterModal';
import elementsData from '../config/elements.json';

// 使用新的角色配置（已按元素分类，包含所有18个新角色）
const allCharactersData = charactersData;

export default function RecruitPage() {
  const [currentCharacter, setCurrentCharacter] = useState<PresetCharacter | null>(null);
  const [currentRarity, setCurrentRarity] = useState<CharacterRarity>('common');
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  
  const characters = usePlayerStore((state) => state.characters);
  const addCharacter = usePlayerStore((state) => state.addCharacter);
  const replaceCharacter = usePlayerStore((state) => state.replaceCharacter);
  const recruitTickets = usePlayerStore((state) => state.getItemCount('item_recruit_ticket'));
  const removeItem = usePlayerStore((state) => state.removeItem);
  const maxClearedLevel = usePlayerStore((state) => state.maxClearedLevel);
  const getUnlockedRarities = usePlayerStore((state) => state.getUnlockedRarities);
  
  const setScene = useGameStore((state) => state.setScene);
  const incrementStat = useGameStore((state) => state.incrementStat);
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const completeTutorial = useGameStore((state) => state.completeTutorial);
  const completedLevels = useGameStore((state) => state.completedLevels);
  const recruitSystemState = useGameStore((state) => state.recruitSystem);
  const updateRecruitProbabilities = useGameStore((state) => state.updateRecruitProbabilities);
  const recordRecruit = useGameStore((state) => state.recordRecruit);
  const incrementPityCounter = useGameStore((state) => state.incrementPityCounter);
  const resetPityCounter = useGameStore((state) => state.resetPityCounter);
  
  // 获取已解锁的稀有度
  const unlockedRarities = getUnlockedRarities();
  const rareUnlocked = unlockedRarities.includes('rare');
  const epicUnlocked = unlockedRarities.includes('epic');

  // 使用新的招募系统获取角色
  const getRandomCharacter = useCallback((): { character: PresetCharacter; rarity: CharacterRarity } => {
    // 更新概率
    updateRecruitProbabilities();
    
    // 获取已拥有角色的ID列表
    const ownedCharacterIds = characters.map(c => String(c.name)); // 使用名称作为唯一标识
    
    // 使用招募系统进行抽取（使用maxClearedLevel而不是completedLevels.length）
    const result = recruitSystem.recruit(
      maxClearedLevel,
      recruitSystemState.pitySystem,
      ownedCharacterIds
    );
    
    if (!result) {
      // 如果抽取失败，返回第一个角色作为fallback
      const fallback = allCharactersData[0] as PresetCharacter;
      return { character: fallback, rarity: 'common' };
    }
    
    return { character: result.character, rarity: result.rarity };
  }, [characters, maxClearedLevel, recruitSystemState.pitySystem, updateRecruitProbabilities]);

  // 初始化：随机一个角色
  useEffect(() => {
    if (!currentCharacter) {
      const result = getRandomCharacter();
      setCurrentCharacter(result.character);
      setCurrentRarity(result.rarity);
    }
  }, [currentCharacter, getRandomCharacter]);

  // 重新招募（免费刷新）
  const handleReroll = () => {
    const result = getRandomCharacter();
    setCurrentCharacter(result.character);
    setCurrentRarity(result.rarity);
  };

  const handleConfirm = () => {
    if (!currentCharacter) return;

    // 检查招募券是否足够
    if (recruitTickets < 1) {
      setShowInsufficientModal(true);
      return;
    }

    // 消耗招募券
    const success = removeItem('item_recruit_ticket', 1);
    if (!success) {
      setShowInsufficientModal(true);
      return;
    }

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

    console.log(`[RecruitPage] 招募角色: ${newCharacter.name}, 稀有度: ${currentRarity}, 元素: ${newCharacter.element || '无'}`);

    // 记录招募
    recordRecruit(String(currentCharacter.id), currentRarity, false);
    
    // 更新保底计数器
    if (currentRarity === 'epic') {
      resetPityCounter('epic');
    } else if (currentRarity === 'rare') {
      resetPityCounter('rare');
      incrementPityCounter(); // 只增加epic计数器
    } else {
      incrementPityCounter(); // 增加所有计数器
    }

    // 如果角色列表未满，直接添加
    if (characters.length < 6) {
      addCharacter(newCharacter);
      incrementStat('recruitCount');
      
      // 完成招募引导
      if (tutorialStep === 1) {
        completeTutorial(2);
      }
      
      // 招募成功，随机下一个
      const result = getRandomCharacter();
      setCurrentCharacter(result.character);
      setCurrentRarity(result.rarity);
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

    console.log(`[RecruitPage] 替换角色: ${newCharacter.name}, 稀有度: ${currentRarity}`);
    
    replaceCharacter(oldCharId, newCharacter);
    incrementStat('recruitCount');
    setShowReplaceModal(false);
    
    // 替换成功，随机下一个
    const result = getRandomCharacter();
    setCurrentCharacter(result.character);
    setCurrentRarity(result.rarity);
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

  // 稀有度样式
  const getRarityStyle = (rarity: CharacterRarity) => {
    switch (rarity) {
      case 'epic':
        return 'border-purple-500 bg-gradient-to-br from-purple-900 to-purple-800 shadow-purple-500/50 animate-pulse';
      case 'rare':
        return 'border-blue-500 bg-gradient-to-br from-blue-900 to-blue-800 shadow-blue-500/50';
      case 'common':
      default:
        return 'border-gray-500 bg-gradient-to-br from-gray-700 to-gray-800';
    }
  };
  
  const getRarityText = (rarity: CharacterRarity) => {
    switch (rarity) {
      case 'epic':
        return { text: '精英', icon: '⭐⭐⭐', color: 'text-purple-300' };
      case 'rare':
        return { text: '稀有', icon: '⭐⭐', color: 'text-blue-300' };
      case 'common':
      default:
        return { text: '普通', icon: '⭐', color: 'text-gray-300' };
    }
  };

  return (
    <>
      {/* 顶部状态栏 */}
      <div className="fixed top-0 left-0 right-0 bg-slate-800/90 backdrop-blur p-4 flex justify-between items-center z-50">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          🏠 返回主页
        </button>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-sm text-slate-400">招募券</div>
            <div className="text-2xl font-bold text-blue-300">🎫 x{recruitTickets}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-400">队伍</div>
            <div className="text-2xl font-bold text-white">{characters.length}/6</div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-8 pt-24">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">招募英雄</h1>
            {tutorialStep === 1 && (
              <div className="mt-4 p-3 bg-blue-900/50 border border-blue-500 rounded-lg">
                <p className="text-blue-300 text-sm">
                  💡 <strong>新手提示：</strong>选择你喜欢的角色，点击"确认招募"按钮。建议先招募2-3个角色！
                </p>
              </div>
            )}
          </div>

          {/* 解锁状态横幅 */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg p-4 mb-6 border border-indigo-500/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">🎯 招募池状态</h3>
                <div className="flex items-center gap-4">
                  <span className={`${!rareUnlocked ? 'text-gray-500' : 'text-white'}`}>
                    {!rareUnlocked ? '🔒' : '✅'} 普通角色
                  </span>
                  <span className={`${!rareUnlocked ? 'text-gray-500' : 'text-blue-300'}`}>
                    {!rareUnlocked ? '🔒' : '✅'} 稀有角色
                  </span>
                  <span className={`${!epicUnlocked ? 'text-gray-500' : 'text-purple-300'}`}>
                    {!epicUnlocked ? '🔒' : '✅'} 精英角色
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">当前进度</div>
                <div className="text-2xl font-bold text-white">已通关 {maxClearedLevel} 关</div>
                {!rareUnlocked && (
                  <div className="mt-2">
                    <div className="text-xs text-yellow-300">💡 通关第2关解锁稀有角色</div>
                    <button
                      onClick={() => setScene('levelSelect')}
                      className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition"
                    >
                      前往挑战
                    </button>
                  </div>
                )}
                {rareUnlocked && !epicUnlocked && (
                  <div className="mt-2">
                    <div className="text-xs text-purple-300">💡 通关第3关解锁精英角色</div>
                    <button
                      onClick={() => setScene('levelSelect')}
                      className="mt-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition"
                    >
                      前往挑战
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 概率和保底显示 */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
            <div className="grid grid-cols-2 gap-6">
              {/* 当前概率 */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">📊 当前概率</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 w-16">🟢 普通</span>
                    <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-gray-500 h-full rounded-full transition-all"
                        style={{ width: `${recruitSystemState.currentProbabilities.common}%` }}
                      />
                    </div>
                    <span className="text-gray-300 w-12 text-right text-sm">
                      {recruitSystemState.currentProbabilities.common.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 w-16">🔵 稀有</span>
                    <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${recruitSystemState.currentProbabilities.rare}%` }}
                      />
                    </div>
                    <span className="text-blue-300 w-12 text-right text-sm">
                      {recruitSystemState.currentProbabilities.rare.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-300 w-16">🟣 精英</span>
                    <div className="flex-1 bg-slate-700 h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${recruitSystemState.currentProbabilities.epic}%` }}
                      />
                    </div>
                    <span className="text-purple-300 w-12 text-right text-sm">
                      {recruitSystemState.currentProbabilities.epic.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 保底进度 */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">💎 保底进度</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">稀有保底</span>
                      <span className="text-blue-300">{recruitSystemState.pitySystem.rareCounter}/10</span>
                    </div>
                    <div className="bg-slate-700 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${(recruitSystemState.pitySystem.rareCounter / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-300">精英保底</span>
                      <span className="text-purple-300">{recruitSystemState.pitySystem.epicCounter}/30</span>
                    </div>
                    <div className="bg-slate-700 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${(recruitSystemState.pitySystem.epicCounter / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  💡 通关更多关卡可提升高品质角色概率
                </p>
              </div>
            </div>
          </div>

        {/* 角色展示卡片 */}
        <div className={`rounded-2xl p-8 border-4 shadow-2xl mb-8 transition-all ${getRarityStyle(currentRarity)}`}>
          <div className="text-center mb-6">
            {/* 稀有度标识 */}
            <div className="mb-3">
              {(() => {
                const rarityInfo = getRarityText(currentRarity);
                return (
                  <span className={`text-2xl font-bold ${rarityInfo.color}`}>
                    {rarityInfo.icon} {rarityInfo.text}
                  </span>
                );
              })()}
            </div>
            
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
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleReroll}
            className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex flex-col items-center"
          >
            <span className="text-xl mb-1">🎲 重新招募</span>
            <span className="text-xs text-purple-200">免费刷新候选角色</span>
          </button>
          <button
            onClick={handleConfirm}
            disabled={recruitTickets < 1}
            className={`px-6 py-4 text-white font-semibold rounded-lg transition flex flex-col items-center ${
              recruitTickets >= 1
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <span className="text-xl mb-1">
              {characters.length >= 6 ? '✨ 替换角色' : '✨ 确认招募'}
            </span>
            <span className="text-xs text-blue-200">
              {recruitTickets >= 1 ? '消耗 🎫 x1' : '招募券不足'}
            </span>
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

      {/* 招募券不足Modal */}
      {showInsufficientModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border-2 border-red-500 shadow-2xl">
            <h2 className="text-3xl font-bold text-red-400 mb-4 text-center">
              ❌ 招募券不足！
            </h2>
            
            <div className="bg-slate-700 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-300">当前拥有</span>
                <span className="text-2xl font-bold text-gray-400">🎫 x{recruitTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">需要</span>
                <span className="text-2xl font-bold text-blue-400">🎫 x1</span>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                💡 <strong>提示：</strong>招募券可通过挑战关卡获得
              </p>
              <p className="text-blue-300 text-sm mt-2">
                每次战斗胜利可获得 <span className="font-bold">1张招募券</span>
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowInsufficientModal(false);
                  setScene('levelSelect');
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                🎯 前往关卡
              </button>
              <button
                onClick={() => setShowInsufficientModal(false)}
                className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
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


