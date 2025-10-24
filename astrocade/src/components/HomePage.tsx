import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { useLadderStore } from '../store/ladderStore';
import { getSkillsInfo, getSkillTypeIcon } from '../utils/skillUtils';
import CapturePrisonerModal from './CapturePrisonerModal';
import type { Prisoner } from '../types';

export default function HomePage() {
  const characters = usePlayerStore((state) => state.characters);
  const prisoners = usePlayerStore((state) => state.prisoners);
  const clearAll = usePlayerStore((state) => state.clearAll);
  const addPrisoner = usePlayerStore((state) => state.addPrisoner);
  const recruitTickets = usePlayerStore((state) => state.getItemCount('item_recruit_ticket'));
  
  const setScene = useGameStore((state) => state.setScene);
  const battleResult = useGameStore((state) => state.battleResult);
  const defeatedEnemies = useGameStore((state) => state.defeatedEnemies);
  const currentLevel = useGameStore((state) => state.currentLevel);
  const setBattleResult = useGameStore((state) => state.setBattleResult);
  const setDefeatedEnemies = useGameStore((state) => state.setDefeatedEnemies);
  const unlockLevel = useGameStore((state) => state.unlockLevel);
  const completeLevel = useGameStore((state) => state.completeLevel);
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const completeTutorial = useGameStore((state) => state.completeTutorial);
  
  const { myLadderData, checkDailyReset } = useLadderStore();
  
  const [expandedCharId, setExpandedCharId] = useState<string | null>(null);
  const [showPrisonerModal, setShowPrisonerModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(tutorialStep === 0);

  // 检查是否需要显示俘虏选择Modal
  useEffect(() => {
    if (battleResult === 'win' && defeatedEnemies.length > 0) {
      setShowPrisonerModal(true);
    }
  }, [battleResult, defeatedEnemies]);

  const handlePrisonerConfirm = (prisoner: Prisoner | null) => {
    if (prisoner) {
      addPrisoner(prisoner);
      console.log(`[HomePage] 俘虏已添加: ${prisoner.name}`);
    }
    
    // 战斗胜利后标记关卡完成并解锁下一关
    if (currentLevel) {
      completeLevel(currentLevel.id);
      console.log(`[HomePage] 完成关卡: ${currentLevel.id}`);
      
      const nextLevelId = currentLevel.id + 1;
      unlockLevel(nextLevelId);
      console.log(`[HomePage] 解锁关卡: ${nextLevelId}`);
    }
    
    // 关闭Modal并清除战斗结果
    setShowPrisonerModal(false);
    setBattleResult(null);
    setDefeatedEnemies([]);
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有存档数据吗？这将删除所有已招募的角色！')) {
      clearAll();
      // 同时清除 LocalStorage 中的所有游戏数据
      localStorage.removeItem('player-storage');
      localStorage.removeItem('game-storage');
      alert('存档已清除！请刷新页面后重新招募角色。');
      window.location.reload();
    }
  };

  // 检查是否有角色没有技能
  const hasCharactersWithoutSkills = characters.some(char => !char.skills || char.skills.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      {/* 顶部状态栏 */}
      <div className="fixed top-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm p-4 flex justify-between items-center z-50 border-b border-slate-700">
        <div className="text-2xl font-bold text-white">AstroCade</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-4 py-2">
            <span className="text-3xl">🎫</span>
            <div>
              <div className="text-xs text-slate-400">招募券</div>
              <div className="text-xl font-bold text-blue-300">x{recruitTickets}</div>
            </div>
          </div>
          <button
            onClick={() => setScene('settings')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            title="设置"
          >
            ⚙️ 设置
          </button>
        </div>
      </div>

      <div className="max-w-4xl w-full p-8 pt-24">
        {/* 标题 */}
        <div className="relative mb-12">
          <h1 className="text-6xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            主页
          </h1>
        </div>

        {/* 警告提示 */}
        {hasCharactersWithoutSkills && (
          <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <div className="text-red-300 font-bold mb-1">检测到旧角色数据！</div>
                <div className="text-red-200 text-sm">
                  您的角色缺少技能数据。请点击右侧的"清除存档"按钮，删除旧数据后重新招募角色。
                </div>
              </div>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transform transition hover:scale-105"
              >
                立即清除
              </button>
            </div>
          </div>
        )}

        {/* 功能按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center mb-12">
          <button
            onClick={() => setScene('recruit')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
          >
            🎭 招募英雄
          </button>

          <button
            onClick={() => {
              if (characters.length === 0) {
                alert('请先招募至少一个角色！');
                return;
              }
              if (prisoners.length === 0) {
                alert('暂无俘虏可用于训练！战斗胜利后可以俘虏敌人。');
                return;
              }
              setScene('train');
            }}
            className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white text-xl font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
            disabled={characters.length === 0 || prisoners.length === 0}
          >
            ✨ 养成训练
            {prisoners.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-orange-500 rounded-full text-sm">
                {prisoners.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              if (characters.length === 0) {
                alert('请先招募至少一个角色！');
                return;
              }
              setScene('levelSelect');
            }}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
            disabled={characters.length === 0}
          >
            ⚔️ 出发冒险
          </button>
          
          <button
            onClick={() => {
              checkDailyReset();
              setScene('ladder');
            }}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xl font-semibold rounded-lg shadow-lg transform transition hover:scale-105 relative"
          >
            <div className="flex items-center justify-center gap-2">
              <span>⚔️ 擂台竞技</span>
            </div>
            {myLadderData && (
              <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                {myLadderData.currentRank !== null && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-bold shadow-lg">
                    #{myLadderData.currentRank}
                  </span>
                )}
                {myLadderData.dailyChallengesUsed < myLadderData.dailyChallengesMax && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-bold shadow-lg">
                    {myLadderData.dailyChallengesMax - myLadderData.dailyChallengesUsed}次
                  </span>
                )}
              </div>
            )}
          </button>
        </div>

        {/* 当前角色列表 */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              当前角色 ({characters.length}/6)
            </h2>
            {characters.length > 0 && (
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transform transition hover:scale-105"
              >
                🗑️ 清除存档
              </button>
            )}
          </div>
          
          {characters.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              暂无角色，请前往招募！
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((char) => {
                const isExpanded = expandedCharId === char.id;
                const skillsInfo = getSkillsInfo(char.skills);
                
                return (
                  <div
                    key={char.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-white font-semibold text-lg">{char.name}</div>
                        <span className="px-2 py-1 bg-yellow-600/70 text-yellow-100 text-xs rounded font-bold">
                          Lv.{char.level || 1}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-blue-600/50 text-blue-200 text-xs rounded">
                        {getRoleName(char.role)}
                      </span>
                    </div>

                    {/* 经验条 */}
                    {char.level && char.level < 10 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>EXP</span>
                          <span>{char.exp || 0} / {char.expToNext || 100}</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, ((char.exp || 0) / (char.expToNext || 100)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {char.level === 10 && (
                      <div className="mb-3 text-center">
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs rounded-full font-bold">
                          ⭐ 满级 ⭐
                        </span>
                      </div>
                    )}
                    
                    <div className="text-sm text-slate-300 space-y-1 mb-3">
                      <div className="flex gap-4">
                        <span>HP: <span className="text-green-400 font-semibold">{char.hp}</span></span>
                        <span>攻击: <span className="text-red-400 font-semibold">{char.damage}</span></span>
                        <span>类型: {getAttackTypeName(char.attackType)}</span>
                      </div>
                      <div className={char.skills && char.skills.length > 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                        技能: {char.skills && char.skills.length > 0 ? `✅ ${char.skills.length}个` : '❌ 无'}
                      </div>
                    </div>

                    {/* 技能详情按钮 */}
                    {skillsInfo.length > 0 && (
                      <button
                        onClick={() => setExpandedCharId(isExpanded ? null : char.id)}
                        className="w-full px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition flex items-center justify-between"
                      >
                        <span>{isExpanded ? '收起技能详情' : '查看技能详情'}</span>
                        <span>{isExpanded ? '▲' : '▼'}</span>
                      </button>
                    )}

                    {/* 技能详情（展开时显示） */}
                    {isExpanded && skillsInfo.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-slate-600 pt-3">
                        {skillsInfo.map((skill, index) => (
                          <div
                            key={skill.id}
                            className="bg-slate-800/50 rounded p-3 border border-slate-600"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{getSkillTypeIcon(skill.id)}</span>
                              <span className="text-white font-semibold">{skill.name}</span>
                              <span className="ml-auto text-xs text-slate-400">技能{index + 1}</span>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              {skill.description}
                            </p>
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

      {/* 俘虏选择Modal */}
      {showPrisonerModal && defeatedEnemies.length > 0 && (
        <CapturePrisonerModal
          defeatedEnemies={defeatedEnemies}
          onConfirm={handlePrisonerConfirm}
          prisonerCount={prisoners.length}
          maxPrisoners={10}
        />
      )}

      {/* 欢迎引导Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl border-2 border-blue-500 shadow-2xl">
            <h2 className="text-4xl font-bold text-center text-white mb-6">
              🎮 欢迎来到 AstroCade！
            </h2>
            <div className="text-slate-300 space-y-4 mb-8 leading-relaxed">
              <p className="text-lg">
                欢迎来到这个策略战斗与角色养成的世界！
              </p>
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <p>📋 <strong className="text-blue-400">游戏流程：</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-purple-400">招募英雄</strong>：收集强大的角色</li>
                  <li><strong className="text-red-400">挑战关卡</strong>：部署阵型，击败敌人</li>
                  <li><strong className="text-green-400">俘虏敌人</strong>：战斗胜利后可以俘虏一名敌人</li>
                  <li><strong className="text-yellow-400">学习技能</strong>：从俘虏处学习新技能</li>
                  <li><strong className="text-pink-400">角色升级</strong>：通过战斗获得经验升级</li>
                </ul>
              </div>
              <p className="text-sm text-slate-400 text-center mt-4">
                提示：先招募几个角色，然后开始你的冒险之旅！
              </p>
            </div>
            <button
              onClick={() => {
                setShowWelcomeModal(false);
                completeTutorial(1);
              }}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-bold rounded-lg transition transform hover:scale-105"
            >
              开始游戏！
            </button>
          </div>
        </div>
      )}
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

function getAttackTypeName(type: string): string {
  return type === 'melee' ? '近战' : '远程';
}


