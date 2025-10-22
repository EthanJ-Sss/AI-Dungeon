import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import type { Character, Prisoner } from '../types';
import { getSkillsInfo, getSkillTypeIcon } from '../utils/skillUtils';
import { loadAllSkills } from '../utils/skillLoader';

const skillsData = loadAllSkills();

export default function TrainPage() {
  const characters = usePlayerStore((state) => state.characters);
  const prisoners = usePlayerStore((state) => state.prisoners);
  const updateCharacter = usePlayerStore((state) => state.updateCharacter);
  const removePrisoner = usePlayerStore((state) => state.removePrisoner);
  const setScene = useGameStore((state) => state.setScene);
  const incrementStat = useGameStore((state) => state.incrementStat);

  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string | null>(null);
  const [isLearning, setIsLearning] = useState(false);
  const [learnResult, setLearnResult] = useState<{
    success: boolean;
    skillLearned: string;
    skillReplaced?: string;
  } | null>(null);

  const selectedChar = characters.find(c => c.id === selectedCharId);
  const selectedPrisoner = prisoners.find(p => p.characterId === selectedPrisonerId);

  const canLearn = selectedCharId && selectedPrisonerId;

  const handleLearn = () => {
    if (!selectedChar || !selectedPrisoner) return;

    setIsLearning(true);

    // 从俘虏的技能中随机选择一个
    const prisonerSkills = selectedPrisoner.skills;
    if (prisonerSkills.length === 0) {
      alert('该俘虏没有技能可以学习！');
      setIsLearning(false);
      return;
    }

    const randomSkill = prisonerSkills[Math.floor(Math.random() * prisonerSkills.length)];
    const skillConfig = skillsData.find(s => s.id === randomSkill);
    
    if (!skillConfig) {
      alert('技能数据错误！');
      setIsLearning(false);
      return;
    }

    // 检查角色是否已有该技能
    if (selectedChar.skills?.includes(randomSkill)) {
      alert(`${selectedChar.name} 已经学会了 ${skillConfig.name}！请选择其他俘虏。`);
      setIsLearning(false);
      return;
    }

    let result: typeof learnResult = {
      success: true,
      skillLearned: randomSkill,
    };

    // 延迟执行学习逻辑，模拟学习动画
    setTimeout(() => {
      const updatedSkills = [...(selectedChar.skills || [])];

      if (updatedSkills.length < 3) {
        // 技能槽未满，直接学习
        updatedSkills.push(randomSkill);
        console.log(`[TrainPage] ${selectedChar.name} 学会了 ${skillConfig.name}`);
      } else {
        // 技能槽已满，随机替换一个
        const replaceIndex = Math.floor(Math.random() * 3);
        const replacedSkill = updatedSkills[replaceIndex];
        updatedSkills[replaceIndex] = randomSkill;
        
        const replacedSkillConfig = skillsData.find(s => s.id === replacedSkill);
        result.skillReplaced = replacedSkill;
        console.log(`[TrainPage] ${selectedChar.name} 用 ${skillConfig.name} 替换了 ${replacedSkillConfig?.name}`);
      }

      // 更新角色技能
      const updatedChar: Character = {
        ...selectedChar,
        skills: updatedSkills,
      };

      updateCharacter(updatedChar);
      incrementStat('skillLearnCount');
      
      // 消耗俘虏
      removePrisoner(selectedPrisoner.characterId);
      console.log(`[TrainPage] 俘虏 ${selectedPrisoner.name} 已被消耗`);

      // 显示结果
      setLearnResult(result);
      setIsLearning(false);
      setSelectedCharId(null);
      setSelectedPrisonerId(null);
    }, 1500);
  };

  const handleCloseResult = () => {
    setLearnResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-3">
            养成训练场
          </h1>
          <p className="text-slate-400 text-lg">
            选择角色和俘虏，让角色学习俘虏的技能
          </p>
        </div>

        {/* 主内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 左侧：选择角色 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>👥</span>
              <span>选择要训练的角色 ({characters.length}/6)</span>
            </h2>

            {characters.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>暂无角色，请前往招募！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {characters.map((char) => {
                  const isSelected = selectedCharId === char.id;
                  const skillsInfo = getSkillsInfo(char.skills);
                  const skillCount = char.skills?.length || 0;

                  return (
                    <div
                      key={char.id}
                      onClick={() => setSelectedCharId(char.id)}
                      className={`
                        bg-slate-700/50 rounded-lg p-4 border-2 cursor-pointer transition transform
                        ${isSelected
                          ? 'border-blue-500 bg-blue-900/30 ring-2 ring-blue-500 scale-105'
                          : 'border-slate-600 hover:border-blue-400'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="text-center mb-2">
                          <span className="px-3 py-1 bg-blue-500 text-white font-bold rounded-full text-xs">
                            ✓ 已选择
                          </span>
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-white mb-2">{char.name}</h3>
                      
                      <div className="text-sm text-slate-300 space-y-1 mb-3">
                        <div>职业: <span className="text-blue-300">{getRoleName(char.role)}</span></div>
                        <div>HP: <span className="text-green-400">{char.hp}</span></div>
                        <div>攻击: <span className="text-red-400">{char.damage}</span></div>
                        <div>
                          技能槽: 
                          <span className={skillCount === 3 ? 'text-red-400' : 'text-yellow-400'}>
                            {skillCount}/3
                          </span>
                          {skillCount === 3 && <span className="text-xs text-red-300 ml-1">(已满，学习将替换)</span>}
                        </div>
                      </div>

                      {skillsInfo.length > 0 && (
                        <div className="space-y-1">
                          {skillsInfo.map((skill, idx) => (
                            <div key={skill.id} className="flex items-center gap-2 text-xs">
                              <span>{getSkillTypeIcon(skill.id)}</span>
                              <span className="text-slate-200">{skill.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 右侧：选择俘虏 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-orange-500">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>⛓️</span>
              <span>选择俘虏作为材料 ({prisoners.length}/10)</span>
            </h2>

            {prisoners.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>暂无俘虏！</p>
                <p className="text-sm mt-2">战斗胜利后可以俘虏敌人</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {prisoners.map((prisoner) => {
                  const isSelected = selectedPrisonerId === prisoner.characterId;
                  const skillsInfo = getSkillsInfo(prisoner.skills);

                  return (
                    <div
                      key={prisoner.characterId}
                      onClick={() => setSelectedPrisonerId(prisoner.characterId)}
                      className={`
                        bg-slate-700/50 rounded-lg p-4 border-2 cursor-pointer transition transform
                        ${isSelected
                          ? 'border-orange-500 bg-orange-900/30 ring-2 ring-orange-500 scale-105'
                          : 'border-slate-600 hover:border-orange-400'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="text-center mb-2">
                          <span className="px-3 py-1 bg-orange-500 text-white font-bold rounded-full text-xs">
                            ✓ 已选择
                          </span>
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-white mb-2">{prisoner.name}</h3>
                      
                      <div className="text-sm text-slate-300 space-y-1 mb-3">
                        <div>职业: <span className="text-orange-300">{getRoleName(prisoner.role)}</span></div>
                        <div>可学技能: <span className="text-yellow-400">{prisoner.skills.length}个</span></div>
                      </div>

                      {skillsInfo.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-slate-400 mb-1">可学习技能：</div>
                          {skillsInfo.map((skill) => (
                            <div key={skill.id} className="flex items-center gap-2 text-xs bg-slate-800/50 p-2 rounded">
                              <span>{getSkillTypeIcon(skill.id)}</span>
                              <div className="flex-1">
                                <div className="text-slate-200 font-semibold">{skill.name}</div>
                                <div className="text-slate-400 text-xs">{skill.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setScene('home')}
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-lg font-semibold rounded-lg transition"
          >
            返回主页
          </button>
          
          <button
            onClick={handleLearn}
            disabled={!canLearn || isLearning}
            className={`
              px-8 py-4 text-white text-lg font-semibold rounded-lg transition
              ${canLearn && !isLearning
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                : 'bg-slate-600 cursor-not-allowed opacity-50'
              }
            `}
          >
            {isLearning ? '学习中...' : canLearn ? '✨ 开始学习技能' : '请选择角色和俘虏'}
          </button>
        </div>

        {/* 学习结果Modal */}
        {learnResult && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-purple-900 to-slate-900 rounded-2xl p-8 max-w-md border-2 border-purple-500 shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-4">学习成功！</h2>
                
                {(() => {
                  const learnedSkillConfig = skillsData.find(s => s.id === learnResult.skillLearned);
                  const replacedSkillConfig = learnResult.skillReplaced 
                    ? skillsData.find(s => s.id === learnResult.skillReplaced) 
                    : null;

                  return (
                    <div className="space-y-4">
                      <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
                        <div className="text-green-300 text-sm mb-1">学会了新技能</div>
                        <div className="flex items-center justify-center gap-2 text-xl">
                          <span>{getSkillTypeIcon(learnResult.skillLearned)}</span>
                          <span className="text-white font-bold">{learnedSkillConfig?.name}</span>
                        </div>
                        <div className="text-slate-300 text-sm mt-2">
                          {learnedSkillConfig?.description}
                        </div>
                      </div>

                      {replacedSkillConfig && (
                        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                          <div className="text-red-300 text-sm mb-1">替换了旧技能</div>
                          <div className="flex items-center justify-center gap-2 text-lg">
                            <span>{getSkillTypeIcon(learnResult.skillReplaced!)}</span>
                            <span className="text-white">{replacedSkillConfig.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <button
                  onClick={handleCloseResult}
                  className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                >
                  继续训练
                </button>
              </div>
            </div>
          </div>
        )}
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


