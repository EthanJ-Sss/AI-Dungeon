import type { PlayerLadderData } from '../types';

interface Props {
  player: PlayerLadderData;
  isMyself?: boolean;
  canChallenge?: boolean;
  onViewDetails: () => void;
  onChallenge: () => void;
}

export default function LeaderboardEntry({ 
  player, 
  isMyself = false,
  canChallenge = false,
  onViewDetails, 
  onChallenge 
}: Props) {
  const rank = player.currentRank!;
  
  const getRankStyle = (): string => {
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg shadow-yellow-500/50';
    }
    if (rank <= 3) {
      return 'bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg shadow-purple-500/50';
    }
    if (rank <= 10) {
      return 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg shadow-blue-500/50';
    }
    return 'bg-gradient-to-r from-slate-700 to-slate-800';
  };
  
  const getRankIcon = (): string => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🥇';
    return '';
  };
  
  const getRankLabel = (): string => {
    if (rank === 1) return '冠军';
    if (rank <= 3) return '三甲';
    if (rank <= 10) return '前十强';
    return '';
  };
  
  const defenseWinRate = player.totalDefenses > 0 
    ? Math.round((player.defenseWins / player.totalDefenses) * 100)
    : 0;
  
  const totalPower = player.defenseFormationSnapshot?.totalPower || 0;
  
  return (
    <div className={`
      ${getRankStyle()}
      ${isMyself ? 'border-4 border-blue-400 ring-4 ring-blue-400/50' : 'border border-slate-600'}
      rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-2xl
    `}>
      <div className="flex items-center justify-between">
        {/* 左侧：排名和玩家信息 */}
        <div className="flex items-center gap-6">
          {/* 排名 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">
              {getRankIcon()}
            </div>
            <div className="text-3xl font-bold text-white">
              #{rank}
            </div>
            {getRankLabel() && (
              <div className="text-xs text-yellow-300 mt-1">
                {getRankLabel()}
              </div>
            )}
          </div>
          
          {/* 玩家信息 */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-bold text-white">
                {player.playerName}
              </div>
              {isMyself && (
                <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-bold">
                  我
                </span>
              )}
            </div>
            
            <div className="flex gap-6 text-sm text-slate-200">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⚡</span>
                <span>战力: {totalPower}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-400">🛡️</span>
                <span>防守: {player.defenseWins}胜{player.defenseLosses}负 ({defenseWinRate}%)</span>
              </div>
              {player.defenseFormationSnapshot && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-400">👥</span>
                  <span>{player.defenseFormationSnapshot.units.length}人阵容</span>
                </div>
              )}
            </div>
            
            {/* 阵容预览 */}
            {player.defenseFormationSnapshot && (
              <div className="mt-2 flex gap-1">
                {player.defenseFormationSnapshot.units.slice(0, 6).map((unit, idx) => {
                  const elementIcons: Record<string, string> = {
                    fire: '🔥',
                    ice: '❄️',
                    earth: '🌍',
                    water: '💧',
                    neutral: '⚪'
                  };
                  
                  return (
                    <div
                      key={idx}
                      className="w-8 h-8 bg-slate-900/50 rounded flex items-center justify-center text-lg"
                      title={`${unit.characterName} (${unit.element})`}
                    >
                      {elementIcons[unit.element] || '⚪'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* 右侧：操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onViewDetails}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors"
          >
            查看详情
          </button>
          
          {!isMyself && (
            <button
              onClick={onChallenge}
              disabled={!canChallenge}
              className={`
                px-8 py-3 rounded-lg font-bold text-white transition-all
                ${canChallenge
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg hover:shadow-red-500/50'
                  : 'bg-slate-600 cursor-not-allowed opacity-50'
                }
              `}
            >
              {canChallenge ? '⚔️ 挑战' : '🔒 不可挑战'}
            </button>
          )}
        </div>
      </div>
      
      {isMyself && (
        <div className="mt-3 pt-3 border-t border-blue-400/30 text-center text-blue-300 text-sm">
          💡 这是您的排名，继续向上挑战以提升排名！
        </div>
      )}
    </div>
  );
}

