import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import elementsData from '../config/elements.json';
import CapturePrisonerModal from './CapturePrisonerModal';
import type { Prisoner } from '../types';

export default function BattleResultPage() {
  const battleResultData = useGameStore((state) => state.battleResultData);
  const setScene = useGameStore((state) => state.setScene);
  const setLevel = useGameStore((state) => state.setLevel);
  const currentLevel = useGameStore((state) => state.currentLevel);
  const defeatedEnemies = useGameStore((state) => state.defeatedEnemies);
  const setDefeatedEnemies = useGameStore((state) => state.setDefeatedEnemies);
  
  const addPrisoner = usePlayerStore((state) => state.addPrisoner);
  const prisoners = usePlayerStore((state) => state.prisoners);
  
  const [showPrisonerModal, setShowPrisonerModal] = useState(false);
  const [nextScene, setNextScene] = useState<'home' | 'levelSelect' | null>(null);

  if (!battleResultData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl">正在加载结算数据...</p>
          <button
            onClick={() => setScene('home')}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            返回主页
          </button>
        </div>
      </div>
    );
  }

  const isVictory = battleResultData.battleResult === 'victory';

  // 处理俘虏选择确认
  const handlePrisonerConfirm = (prisoner: Prisoner | null) => {
    if (prisoner) {
      addPrisoner(prisoner);
    }
    // 清除战斗状态
    setShowPrisonerModal(false);
    setDefeatedEnemies([]);
    
    // 跳转到下一个场景
    if (nextScene) {
      setScene(nextScene);
      setNextScene(null);
    }
  };

  const handleBackHome = () => {
    // 如果有俘虏可选，先显示俘虏选择
    if (defeatedEnemies.length > 0 && battleResultData?.battleResult === 'victory') {
      setNextScene('home');
      setShowPrisonerModal(true);
    } else {
      setScene('home');
    }
  };

  const handleRetry = () => {
    // 重试不需要选择俘虏，直接重新战斗
    if (currentLevel) {
      setLevel(currentLevel);
      setScene('battle');
    } else {
      setScene('levelSelect');
    }
  };

  const handleFormation = () => {
    // 调整阵容不需要选择俘虏
    setScene('formation');
  };

  const handleContinue = () => {
    // 如果有俘虏可选，先显示俘虏选择
    if (defeatedEnemies.length > 0 && battleResultData?.battleResult === 'victory') {
      setNextScene('levelSelect');
      setShowPrisonerModal(true);
    } else {
      setScene('levelSelect');
    }
  };

  const getElementIcon = (element?: string) => {
    if (!element) return '⚪';
    const elem = elementsData.elements.find(e => e.id === element);
    return elem?.icon || '⚪';
  };

  if (isVictory && battleResultData.playerStats) {
    const { characters, mvp, totalDamage, teamHpPercent } = battleResultData.playerStats;
    const { rewards, battleTime } = battleResultData;

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-5xl w-full">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-green-400 mb-4 animate-bounce">
              🎉 胜利！
            </h1>
            <p className="text-2xl text-slate-300">
              战斗用时：{battleTime}秒 | 剩余HP：{teamHpPercent}%
            </p>
          </div>

          {/* MVP区域 */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 mb-8 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6 text-center">
              👑 本场MVP：{mvp.characterName}
            </h2>
            <div className="grid grid-cols-4 gap-6 text-white">
              <div className="text-center">
                <div className="text-sm text-yellow-200 mb-2">造成伤害</div>
                <div className="text-4xl font-bold">{mvp.totalDamageDealt}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-yellow-200 mb-2">伤害占比</div>
                <div className="text-4xl font-bold">{mvp.damagePercent}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-yellow-200 mb-2">击杀数</div>
                <div className="text-4xl font-bold">{mvp.killCount}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-yellow-200 mb-2">技能释放</div>
                <div className="text-4xl font-bold">{mvp.skillUsedCount}次</div>
              </div>
            </div>
          </div>

          {/* 角色战绩列表 */}
          <div className="bg-slate-800 rounded-2xl p-8 mb-8 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-6">英雄战绩</h3>
            <div className="space-y-4">
              {characters.map((char, index) => (
                <div
                  key={char.characterId}
                  className={`rounded-xl p-6 border-4 transition-all ${
                    index === 0
                      ? 'border-yellow-500 bg-gradient-to-r from-yellow-900/50 to-orange-900/50'
                      : index === 1
                      ? 'border-blue-500 bg-gradient-to-r from-blue-900/50 to-blue-800/50'
                      : 'border-slate-600 bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}️⃣`}
                      </span>
                      <span className="text-2xl font-bold text-white">{char.characterName}</span>
                      <span className="text-2xl">{getElementIcon(char.element)}</span>
                      {index === 0 && <span className="text-3xl animate-pulse">👑</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 text-sm mb-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-slate-400 mb-1">伤害</div>
                      <div className="text-xl font-bold text-red-400">{char.totalDamageDealt}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-slate-400 mb-1">占比</div>
                      <div className="text-xl font-bold text-orange-400">{char.damagePercent}%</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-slate-400 mb-1">击杀</div>
                      <div className="text-xl font-bold text-yellow-400">{char.killCount}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-slate-400 mb-1">技能</div>
                      <div className="text-xl font-bold text-blue-400">{char.skillUsedCount}次</div>
                    </div>
                    {char.totalHealDone !== undefined && char.totalHealDone > 0 && (
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="text-slate-400 mb-1">治疗</div>
                        <div className="text-xl font-bold text-green-400">{char.totalHealDone}</div>
                      </div>
                    )}
                  </div>

                  {/* 伤害进度条 */}
                  <div className="bg-slate-900 h-6 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : index === 1
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${char.damagePercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 获得奖励 */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 mb-8 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">🎁 获得奖励</h3>
            <div className="flex justify-center gap-12">
              <div className="text-center">
                <div className="text-6xl mb-3">🎫</div>
                <div className="text-4xl font-bold text-blue-300">+{rewards.recruitTickets}</div>
                <div className="text-lg text-slate-300 mt-2">招募券</div>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-3">⭐</div>
                <div className="text-4xl font-bold text-yellow-300">+{rewards.exp}</div>
                <div className="text-lg text-slate-300 mt-2">经验值</div>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleBackHome}
              className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl rounded-xl transition shadow-lg"
            >
              🏠 返回主页
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-xl transition shadow-lg"
            >
              🎯 继续挑战
            </button>
          </div>
        </div>

        {/* 俘虏选择模态框 */}
        {showPrisonerModal && (
          <CapturePrisonerModal
            defeatedEnemies={defeatedEnemies}
            onConfirm={handlePrisonerConfirm}
            prisonerCount={prisoners.length}
            maxPrisoners={10}
          />
        )}
      </div>
    );
  }

  // 失败界面
  if (!isVictory && battleResultData.defeatStats) {
    const { damageSources, primaryCause, suggestions, surviveTime, remainingEnemies } =
      battleResultData.defeatStats;

    // 确保有伤害来源数据
    const hasDamageSources = damageSources && damageSources.length > 0;
    const validPrimaryCause = primaryCause || {
      sourceId: 'unknown',
      sourceName: '未知原因',
      sourceType: 'enemy' as const,
      totalDamageDealt: 0,
      damagePercent: 0,
      killCount: 0,
      killedCharacters: [],
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-5xl w-full">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-red-400 mb-4">
              ❌ 战败
            </h1>
            <p className="text-2xl text-slate-300">
              存活时长：{surviveTime}秒 | 剩余敌人：{remainingEnemies}个
            </p>
          </div>

          {/* 主要死因 */}
          {hasDamageSources && (
            <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-2xl p-8 mb-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                ⚠️ 主要死因：{validPrimaryCause.sourceName}
              </h2>
              <div className="grid grid-cols-3 gap-6 text-white">
                <div className="text-center">
                  <div className="text-sm text-red-200 mb-2">造成伤害</div>
                  <div className="text-4xl font-bold">{validPrimaryCause.totalDamageDealt}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-red-200 mb-2">伤害占比</div>
                  <div className="text-4xl font-bold">{validPrimaryCause.damagePercent}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-red-200 mb-2">击杀角色</div>
                  <div className="text-xl font-bold">
                    {validPrimaryCause.killedCharacters.length > 0
                      ? validPrimaryCause.killedCharacters.join(', ')
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 无伤害数据时的提示 */}
          {!hasDamageSources && (
            <div className="bg-slate-800 rounded-2xl p-8 mb-8 shadow-2xl text-center">
              <div className="text-6xl mb-4">⏱️</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                时间耗尽
              </h2>
              <p className="text-xl text-slate-300">
                战斗时间已用完，未能击败所有敌人
              </p>
            </div>
          )}

          {/* 伤害来源分析 */}
          {hasDamageSources && (
            <div className="bg-slate-800 rounded-2xl p-8 mb-8 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-6">伤害来源分析</h3>
              <div className="space-y-4">
                {damageSources.slice(0, 5).map((source, index) => (
                <div key={source.sourceId} className="bg-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '💀' : index + 1}
                      </span>
                      <span className="text-xl font-bold text-white">{source.sourceName}</span>
                      <span className="px-3 py-1 bg-slate-600 rounded-full text-sm text-slate-300">
                        {source.sourceType === 'environment' ? '🔥 环境' : '⚔️ 敌方'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-slate-400 mb-1">伤害</div>
                      <div className="text-xl font-bold text-red-400">{source.totalDamageDealt}</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-slate-400 mb-1">占比</div>
                      <div className="text-xl font-bold text-orange-400">{source.damagePercent}%</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-slate-400 mb-1">击杀</div>
                      <div className="text-xl font-bold text-yellow-400">{source.killCount}个</div>
                    </div>
                  </div>

                  {/* 伤害进度条 */}
                  <div className="bg-slate-900 h-4 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600"
                      style={{ width: `${source.damagePercent}%` }}
                    />
                  </div>

                  {source.killedCharacters.length > 0 && (
                    <div className="mt-3 text-sm text-red-300">
                      击杀: {source.killedCharacters.join(', ')}
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          )}

          {/* 战术建议 */}
          {suggestions && suggestions.length > 0 && (
            <div className="bg-yellow-900/40 border-4 border-yellow-600 rounded-2xl p-8 mb-8 shadow-2xl">
              <h3 className="text-3xl font-bold text-yellow-300 mb-6 text-center">💡 战术建议</h3>
              <ul className="space-y-3 text-yellow-200 text-lg">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-2xl">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleBackHome}
              className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xl rounded-xl transition shadow-lg"
            >
              🏠 返回主页
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl transition shadow-lg"
            >
              🔄 重新挑战
            </button>
            <button
              onClick={handleFormation}
              className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-xl transition shadow-lg"
            >
              ⚙️ 调整阵容
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

