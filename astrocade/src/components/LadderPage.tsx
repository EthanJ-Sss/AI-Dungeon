import { useEffect, useState } from 'react';
import { useLadderStore } from '../store/ladderStore';
import { useGameStore } from '../store/gameStore';
import type { PlayerLadderData } from '../types';
import LeaderboardEntry from './LeaderboardEntry';
import ChallengeConfirmModal from './ChallengeConfirmModal';
import { validateChallenge } from '../utils/rankUpdateLogic';
import { simulateLadderBattle } from '../utils/ladderBattleSimulator';

export default function LadderPage() {
  const { leaderboard, myLadderData, initializeLadder, checkDailyReset, executeChallenge } = useLadderStore();
  const { setScene } = useGameStore();
  
  const [selectedOpponent, setSelectedOpponent] = useState<PlayerLadderData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    result: 'attacker_win' | 'defender_win';
    oldRank: number | null;
    newRank: number | null;
    opponent: PlayerLadderData;
  } | null>(null);
  
  useEffect(() => {
    // 初始化擂台系统
    initializeLadder();
    // 检查每日重置
    checkDailyReset();
  }, [initializeLadder, checkDailyReset]);
  
  useEffect(() => {
    // 如果有挑战结果，跳转到结算页面
    if (challengeResult) {
      // 将结果保存到gameStore中传递给结算页面
      (window as any).__ladderChallengeResult = challengeResult;
      setScene('ladderResult');
    }
  }, [challengeResult, setScene]);
  
  const handleChallenge = (opponent: PlayerLadderData) => {
    setSelectedOpponent(opponent);
    setShowConfirmModal(true);
  };
  
  const handleConfirmChallenge = () => {
    if (!selectedOpponent || !myLadderData) return;
    
    // 验证挑战
    const validation = validateChallenge(myLadderData, selectedOpponent);
    if (!validation.valid) {
      alert(validation.reason);
      return;
    }
    
    setShowConfirmModal(false);
    
    // 模拟战斗
    const attackerFormation = myLadderData.defenseFormationSnapshot;
    const defenderFormation = selectedOpponent.defenseFormationSnapshot;
    
    if (!attackerFormation) {
      alert('请先设置防守阵容！');
      return;
    }
    
    if (!defenderFormation) {
      alert('对手阵容数据异常！');
      return;
    }
    
    const battleResult = simulateLadderBattle(attackerFormation, defenderFormation);
    
    // 执行挑战
    const result = executeChallenge(
      selectedOpponent.playerId,
      battleResult.result,
      battleResult.duration
    );
    
    if (result.success) {
      // 设置挑战结果
      setChallengeResult({
        result: battleResult.result,
        oldRank: result.oldRank,
        newRank: result.newRank,
        opponent: selectedOpponent
      });
    }
  };
  
  const handleViewDetails = (opponent: PlayerLadderData) => {
    setSelectedOpponent(opponent);
    // TODO: 显示详情弹窗
    alert(`查看 ${opponent.playerName} 的详细信息\n战力: ${opponent.defenseFormationSnapshot?.totalPower || 0}\n防守战绩: ${opponent.defenseWins}胜${opponent.defenseLosses}负`);
  };
  
  const handleBackToHome = () => {
    setScene('home');
  };
  
  const handleSetDefenseFormation = () => {
    setScene('defenseFormation');
  };
  
  if (!myLadderData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }
  
  const myRank = myLadderData.currentRank;
  const remainingChallenges = myLadderData.dailyChallengesMax - myLadderData.dailyChallengesUsed;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* 顶部返回按钮 */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBackToHome}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          ← 返回主页
        </button>
      </div>
      
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">⚔️ 擂台竞技 ⚔️</h1>
          <p className="text-slate-400">挑战榜上强者，争夺荣耀排名！</p>
        </div>
        
        {/* 我的排名卡片 */}
        <div className="mb-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border-2 border-blue-500/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold mb-2">
                {myRank !== null ? (
                  <>
                    我的排名: <span className="text-yellow-400">#{myRank}</span>
                    {myRank <= 10 && <span className="ml-2 text-blue-400">🥇 前十强</span>}
                    {myRank <= 3 && <span className="ml-2 text-purple-400">💎 三甲</span>}
                    {myRank === 1 && <span className="ml-2 text-yellow-400">👑 冠军</span>}
                  </>
                ) : (
                  <span className="text-slate-400">未上榜</span>
                )}
              </div>
              <div className="flex gap-6 text-sm text-slate-300">
                <div>战力: {myLadderData.defenseFormationSnapshot?.totalPower || 0}</div>
                <div>挑战: {myLadderData.totalWins}胜{myLadderData.totalLosses}负</div>
                {myRank !== null && (
                  <div>防守: {myLadderData.defenseWins}胜{myLadderData.defenseLosses}负</div>
                )}
                <div className={remainingChallenges > 0 ? 'text-green-400' : 'text-red-400'}>
                  剩余挑战: {remainingChallenges}/{myLadderData.dailyChallengesMax}
                </div>
              </div>
            </div>
            <button
              onClick={handleSetDefenseFormation}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
            >
              设置防守阵容
            </button>
          </div>
          {!myLadderData.defenseFormationSnapshot && (
            <div className="mt-4 text-yellow-400 text-sm">
              ⚠️ 您还未设置防守阵容，请先设置后再挑战！
            </div>
          )}
          {myRank === null && (
            <div className="mt-4 text-blue-400 text-sm">
              💡 挑战排名21-30的玩家即可上榜！
            </div>
          )}
        </div>
        
        {/* 快速导航 */}
        <div className="mb-6 flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => document.getElementById('rank-1')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
          >
            👑 冠军
          </button>
          <button
            onClick={() => document.getElementById('rank-2')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            💎 前三甲
          </button>
          <button
            onClick={() => document.getElementById('rank-4')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            🥇 前十强
          </button>
          {myRank && myRank > 3 && (
            <button
              onClick={() => document.getElementById(`rank-${myRank}`)?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            >
              📍 我的排名
            </button>
          )}
        </div>
        
        {/* 排行榜列表 */}
        <div className="space-y-3">
          <div className="text-center text-slate-400 mb-4">
            共 {leaderboard.filter(p => p.currentRank !== null && p.currentRank <= 30).length} / 30 个席位
          </div>
          
          {leaderboard
            .filter(p => p.currentRank !== null && p.currentRank <= 30)
            .sort((a, b) => (a.currentRank || 999) - (b.currentRank || 999))
            .map((player) => (
              <div key={player.playerId} id={`rank-${player.currentRank}`}>
                <LeaderboardEntry
                  player={player}
                  isMyself={player.playerId === myLadderData.playerId}
                  canChallenge={
                    remainingChallenges > 0 &&
                    !!myLadderData.defenseFormationSnapshot &&
                    (myRank === null || (myRank > player.currentRank!))
                  }
                  onViewDetails={() => handleViewDetails(player)}
                  onChallenge={() => handleChallenge(player)}
                />
              </div>
            ))}
        </div>
      </div>
      
      {/* 挑战确认弹窗 */}
      {showConfirmModal && selectedOpponent && (
        <ChallengeConfirmModal
          opponent={selectedOpponent}
          myData={myLadderData}
          onConfirm={handleConfirmChallenge}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedOpponent(null);
          }}
        />
      )}
    </div>
  );
}

