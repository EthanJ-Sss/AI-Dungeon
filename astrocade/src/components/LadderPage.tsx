import { useEffect, useState } from 'react';
import { useLadderStore } from '../store/ladderStoreSimple';
import { useGameStore } from '../store/gameStore';
import type { PlayerLadderData } from '../types';
import LeaderboardEntry from './LeaderboardEntry';
import ChallengeConfirmModal from './ChallengeConfirmModal';
import PlayerRegisterModal from './PlayerRegisterModal';
import { validateChallenge } from '../utils/rankUpdateLogic';

export default function LadderPage() {
  const { 
    leaderboard, 
    myLadderData, 
    isOnlineMode,
    initializeLadder, 
    checkOrRegisterPlayer 
  } = useLadderStore();
  const { setScene, startLadderBattle } = useGameStore();
  
  const [selectedOpponent, setSelectedOpponent] = useState<PlayerLadderData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // 初始化擂台系统
    const init = async () => {
      setIsInitializing(true);
      await initializeLadder();
      
      // 检查是否需要注册
      const savedPlayerName = localStorage.getItem('ladder_player_name');
      if (!savedPlayerName || !myLadderData) {
        // 没有保存的昵称，或者没有玩家数据，显示注册弹窗
        setShowRegisterModal(true);
      }
      
      setIsInitializing(false);
    };
    
    init();
    
    // 🔧 修复：每次进入页面时滚动到顶部
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []); // 移除依赖，只在首次加载时初始化
  
  const handleRegisterSuccess = async (playerName: string) => {
    console.log('[LadderPage] 玩家注册成功:', playerName);
    
    // 保存到本地存储
    localStorage.setItem('ladder_player_name', playerName);
    
    // 调用Store的注册方法
    try {
      await checkOrRegisterPlayer(playerName);
      setShowRegisterModal(false);
      
      // 🎯 注册成功后，引导玩家设置防守阵容
      setTimeout(() => {
        if (confirm('注册成功！\n\n是否立即设置防守阵容？\n（设置后才能挑战其他玩家）')) {
          setScene('defenseFormation');
        }
      }, 500);
    } catch (error) {
      console.error('[LadderPage] 注册失败:', error);
      alert('注册失败，请重试');
    }
  };
  
  const handleSkipRegister = () => {
    // 跳过注册，使用默认昵称
    const defaultName = `玩家${Date.now() % 10000}`;
    handleRegisterSuccess(defaultName);
  };
  
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
    
    // 检查防守阵容
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
    
    // 无限挑战模式 - 不消耗次数
    setShowConfirmModal(false);
    
    // 保存我的擂台数据到window对象（供BattleScene使用）
    (window as any).__ladderMyData = myLadderData;
    
    // 启动天梯战斗模式
    console.log('[LadderPage] 启动天梯战斗:', selectedOpponent.playerName);
    startLadderBattle(selectedOpponent);
    
    // 跳转到战斗场景
    setScene('battle');
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
  
  // 显示注册弹窗
  if (showRegisterModal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <PlayerRegisterModal
          onRegisterSuccess={handleRegisterSuccess}
          onSkip={handleSkipRegister}
          isOnlineMode={isOnlineMode}
        />
      </div>
    );
  }
  
  if (isInitializing || !myLadderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-white text-xl">正在初始化擂台系统...</div>
          <div className="text-slate-400 text-sm mt-2">
            {isOnlineMode ? '连接到在线服务器...' : '加载本地数据...'}
          </div>
        </div>
      </div>
    );
  }
  
  const myRank = myLadderData.currentRank;
  // 无限挑战模式 - 不再限制次数
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto">
      {/* 顶部返回按钮 */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBackToHome}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors shadow-lg"
        >
          ← 返回主页
        </button>
      </div>
      
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">⚔️ 擂台竞技 ⚔️</h1>
          <p className="text-slate-400">挑战榜上强者，争夺荣耀排名！</p>
        </div>
        
        {/* 我的排名卡片 */}
        <div className="mb-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border-2 border-blue-500/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl font-bold text-yellow-400">
                  {myLadderData.playerName}
                </div>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                  title="修改昵称"
                >
                  ✏️ 改名
                </button>
                {isOnlineMode && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded-full border border-green-500/50">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    在线
                  </div>
                )}
              </div>
              <div className="text-xl font-bold mb-2">
                {myRank !== null ? (
                  <>
                    排名: <span className="text-yellow-400">#{myRank}</span>
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
                <div className="text-green-400">
                  挑战次数: ∞ 无限
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
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
              <div className="text-yellow-400 font-bold mb-1">⚠️ 重要提示</div>
              <div className="text-yellow-300 text-sm mb-2">
                您还未设置防守阵容！设置后才能挑战其他玩家。
              </div>
              <button
                onClick={handleSetDefenseFormation}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-colors"
              >
                🛡️ 立即设置防守阵容
              </button>
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
            onClick={() => {
              const element = document.getElementById('rank-1');
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
          >
            👑 冠军
          </button>
          <button
            onClick={() => {
              const element = document.getElementById('rank-2');
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            💎 前三甲
          </button>
          <button
            onClick={() => {
              const element = document.getElementById('rank-10');
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            🥇 第十名
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
          >
            ⬆️ 回到顶部
          </button>
          {myRank && myRank > 3 && (
            <button
              onClick={() => {
                const element = document.getElementById(`rank-${myRank}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            >
              📍 我的排名
            </button>
          )}
        </div>
        
        {/* 排行榜列表 */}
        <div className="space-y-3 pb-20">
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


