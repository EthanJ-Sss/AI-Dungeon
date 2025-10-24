import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useLadderStore } from '../store/ladderStore';
import type { PlayerLadderData } from '../types';

export default function LadderResultPage() {
  const { setScene, clearLadderBattle, ladderOpponent } = useGameStore();
  const { executeChallenge } = useLadderStore();
  const [resultData, setResultData] = useState<{
    result: 'attacker_win' | 'defender_win';
    oldRank: number | null;
    newRank: number | null;
    opponent: PlayerLadderData;
  } | null>(null);
  
  useEffect(() => {
    // 从BattleScene传递的战斗结果
    const battleResult = (window as any).__ladderBattleResult;
    
    if (battleResult && ladderOpponent) {
      // 执行挑战，更新排名
      const challengeResult = executeChallenge(
        ladderOpponent.playerId,
        battleResult.result,
        battleResult.battleTime
      );
      
      if (challengeResult.success) {
        setResultData({
          result: battleResult.result,
          oldRank: challengeResult.oldRank,
          newRank: challengeResult.newRank,
          opponent: ladderOpponent
        });
      }
      
      // 清理临时数据
      delete (window as any).__ladderBattleResult;
      delete (window as any).__ladderMyData;
      
      // 清除天梯战斗状态
      clearLadderBattle();
    } else {
      // 如果没有数据，返回擂台页面
      console.warn('[LadderResultPage] 缺少战斗结果数据，返回擂台页面');
      setScene('ladder');
    }
  }, [setScene, clearLadderBattle, ladderOpponent, executeChallenge]);
  
  const handleBackToLadder = () => {
    setScene('ladder');
  };
  
  const handleContinueChallenge = () => {
    setScene('ladder');
  };
  
  if (!resultData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }
  
  const { result, oldRank, newRank, opponent } = resultData;
  
  // 胜利界面
  if (result === 'attacker_win') {
    const rankUp = oldRank !== null ? oldRank - newRank! : null;
    const isFirstRank = newRank === 1;
    const isFirstOnBoard = oldRank === null;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-slate-900 to-slate-900 text-white overflow-y-auto py-8 px-4">
        <div className="max-w-3xl w-full mx-auto">
          {/* 庆祝标题 */}
          <div className="text-center mb-8 animate-in zoom-in duration-500">
            <div className="text-7xl mb-4">🎉</div>
            <h1 className="text-6xl font-bold mb-2 text-yellow-400">
              挑战成功！
            </h1>
            <p className="text-2xl text-green-400">
              击败了 {opponent.playerName}
            </p>
          </div>
          
          {/* 排名变化 */}
          <div className="bg-slate-800/80 rounded-2xl p-8 mb-8 border-2 border-yellow-500/50">
            <div className="text-center mb-6">
              <div className="text-xl text-slate-400 mb-4">排名变化</div>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-slate-400 mb-2">
                    {oldRank || '未上榜'}
                  </div>
                  <div className="text-sm text-slate-500">原排名</div>
                </div>
                
                <div className="text-6xl text-yellow-400 animate-bounce">
                  ⬆️
                </div>
                
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-400 mb-2">
                    #{newRank}
                    {isFirstRank && ' 👑'}
                  </div>
                  <div className="text-sm text-yellow-500">新排名</div>
                </div>
              </div>
              
              {rankUp !== null && rankUp > 0 && (
                <div className="mt-4 text-2xl text-green-400">
                  上升 {rankUp} 名！
                </div>
              )}
            </div>
            
            {/* 排行榜更新说明 */}
            <div className="bg-slate-700/50 rounded-xl p-4 text-sm text-slate-300">
              <div className="font-bold mb-2 text-blue-400">📊 排行榜更新：</div>
              <div className="space-y-1">
                <div>• 你: {oldRank ? `#${oldRank}` : '未上榜'} → #{newRank}</div>
                <div>• {opponent.playerName}: #{opponent.currentRank} → #{opponent.currentRank! + 1}</div>
                {rankUp !== null && rankUp > 1 && (
                  <div>• 排名{newRank!+1}-{oldRank}的玩家各后退1位</div>
                )}
              </div>
            </div>
          </div>
          
          {/* 成就提示 */}
          {(isFirstRank || isFirstOnBoard || opponent.currentRank! <= 10) && (
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 mb-8 border-2 border-purple-500/50">
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-xl font-bold mb-3 text-purple-300">达成成就！</div>
                <div className="space-y-2">
                  {isFirstRank && (
                    <div className="bg-yellow-500/20 rounded-lg p-3">
                      <div className="font-bold text-yellow-400">👑 问鼎擂台</div>
                      <div className="text-sm text-yellow-300">首次达到第1名</div>
                      <div className="text-yellow-200 mt-1">奖励: 🎫 招募券 x50</div>
                    </div>
                  )}
                  {isFirstOnBoard && !isFirstRank && (
                    <div className="bg-green-500/20 rounded-lg p-3">
                      <div className="font-bold text-green-400">🎯 荣登榜单</div>
                      <div className="text-sm text-green-300">首次进入排行榜（前30名）</div>
                      <div className="text-green-200 mt-1">奖励: 🎫 招募券 x10</div>
                    </div>
                  )}
                  {opponent.currentRank === 1 && (
                    <div className="bg-red-500/20 rounded-lg p-3">
                      <div className="font-bold text-red-400">🐉 屠龙勇士</div>
                      <div className="text-sm text-red-300">击败排名第1的玩家</div>
                      <div className="text-red-200 mt-1">奖励: 🎫 招募券 x30</div>
                    </div>
                  )}
                  {opponent.currentRank! <= 10 && opponent.currentRank! > 1 && (
                    <div className="bg-blue-500/20 rounded-lg p-3">
                      <div className="font-bold text-blue-400">⚔️ 挑战前十</div>
                      <div className="text-sm text-blue-300">成功挑战前10名玩家</div>
                      <div className="text-blue-200 mt-1">奖励: 🎫 招募券 x3</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleBackToLadder}
              className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-colors"
            >
              返回排行榜
            </button>
            <button
              onClick={handleContinueChallenge}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg transition-colors"
            >
              继续挑战 ⚔️
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 失败界面
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-slate-900 to-slate-900 text-white overflow-y-auto py-8 px-4">
      <div className="max-w-3xl w-full mx-auto">
        {/* 失败标题 */}
        <div className="text-center mb-8 animate-in zoom-in duration-500">
          <div className="text-7xl mb-4">❌</div>
          <h1 className="text-6xl font-bold mb-2 text-red-400">
            挑战失败
          </h1>
          <p className="text-2xl text-slate-400">
            被 {opponent.playerName} 击败
          </p>
        </div>
        
        {/* 排名状态 */}
        <div className="bg-slate-800/80 rounded-2xl p-8 mb-8 border-2 border-red-500/50">
          <div className="text-center">
            <div className="text-xl text-slate-400 mb-4">排名状态</div>
            <div className="text-4xl font-bold text-slate-300 mb-2">
              {oldRank ? `#${oldRank}` : '未上榜'}
            </div>
            <div className="text-lg text-slate-400">
              排名不变，无惩罚
            </div>
          </div>
        </div>
        
        {/* 战术建议 */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-2xl p-6 mb-8">
          <div className="text-xl font-bold mb-4 text-blue-400">💡 战术建议</div>
          <div className="space-y-3 text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>对手战力较高，建议提升角色等级后再挑战</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>可以尝试挑战战力更接近的对手，增加胜率</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>优化阵容配置，调整角色站位和技能搭配</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>利用元素克制关系，针对性配置阵容</span>
            </div>
          </div>
        </div>
        
        {/* 对手信息 */}
        <div className="bg-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="text-center text-sm text-slate-400">
            <div className="mb-2">对手数据</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {opponent.defenseFormationSnapshot?.totalPower || 0}
                </div>
                <div>战力</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {opponent.totalDefenses > 0 
                    ? Math.round((opponent.defenseWins / opponent.totalDefenses) * 100)
                    : 0}%
                </div>
                <div>防守胜率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  #{opponent.currentRank}
                </div>
                <div>排名</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleBackToLadder}
            className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-colors"
          >
            返回排行榜
          </button>
          <button
            onClick={handleContinueChallenge}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold text-lg transition-colors"
          >
            复仇 ⚔️
          </button>
        </div>
      </div>
    </div>
  );
}


