import type { PlayerLadderData } from '../types';
import { getDifficultyHint } from '../utils/ladderBattleSimulator';

interface Props {
  opponent: PlayerLadderData;
  myData: PlayerLadderData;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ChallengeConfirmModal({ opponent, myData, onConfirm, onCancel }: Props) {
  const myPower = myData.defenseFormationSnapshot?.totalPower || 0;
  const opponentPower = opponent.defenseFormationSnapshot?.totalPower || 0;
  const powerDiff = myPower - opponentPower;
  
  const difficultyHint = getDifficultyHint(powerDiff);
  
  const getRankLabel = (rank: number): string => {
    if (rank === 1) return '👑 冠军';
    if (rank <= 3) return '💎 三甲';
    if (rank <= 10) return '🥇 前十强';
    return `榜内玩家`;
  };
  
  const getRewardText = (): string => {
    const rank = opponent.currentRank!;
    if (rank === 1) {
      return '额外招募券 x10，称号"屠龙者"';
    }
    if (rank <= 3) {
      return '额外招募券 x5';
    }
    if (rank <= 10) {
      return '额外招募券 x3';
    }
    return '基础奖励';
  };
  
  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onCancel}
      />
      
      {/* 弹窗 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-2 border-yellow-500/50 shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-200">
          <h2 className="text-4xl font-bold text-center mb-6 text-yellow-400">
            ⚔️ 确认挑战 ⚔️
          </h2>
          
          {/* 对手信息 */}
          <div className="bg-slate-700/50 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-white mb-2">
                {opponent.playerName}
              </div>
              <div className="text-xl text-yellow-400">
                {getRankLabel(opponent.currentRank!)} #{opponent.currentRank}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-400 text-sm mb-1">对手战力</div>
                <div className="text-2xl font-bold text-orange-400">{opponentPower}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-400 text-sm mb-1">防守胜率</div>
                <div className="text-2xl font-bold text-purple-400">
                  {opponent.totalDefenses > 0 
                    ? Math.round((opponent.defenseWins / opponent.totalDefenses) * 100)
                    : 0}%
                </div>
              </div>
            </div>
          </div>
          
          {/* 战力对比 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-400 font-bold">我的战力: {myPower}</div>
              <div className="text-orange-400 font-bold">对手战力: {opponentPower}</div>
            </div>
            
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-500 transition-all"
                style={{ width: `${(myPower / (myPower + opponentPower)) * 100}%` }}
              />
              <div 
                className="bg-orange-500 transition-all"
                style={{ width: `${(opponentPower / (myPower + opponentPower)) * 100}%` }}
              />
            </div>
            
            <div className="text-center mt-2">
              <span className={difficultyHint.color + ' font-bold'}>
                战力差距: {powerDiff > 0 ? '+' : ''}{powerDiff}
              </span>
            </div>
            
            <div className={`text-center mt-3 text-lg ${difficultyHint.color}`}>
              {difficultyHint.text}
            </div>
          </div>
          
          {/* 无限挑战模式 */}
          <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold mb-1">无限挑战模式</div>
                <div className="text-sm text-green-300">
                  无需消耗挑战次数，尽情挑战！
                </div>
              </div>
              <div className="text-4xl">♾️</div>
            </div>
          </div>
          
          {/* 挑战结果预期 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* 成功 */}
            <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4">
              <div className="text-green-400 font-bold text-center mb-2">
                🎉 挑战成功
              </div>
              <div className="text-sm text-slate-300 space-y-1">
                <div>
                  ✓ 排名: {myData.currentRank || '未上榜'} → #{opponent.currentRank}
                </div>
                <div>
                  ✓ 取代对手位置
                </div>
                <div className="text-yellow-400 font-bold">
                  {getRewardText()}
                </div>
              </div>
            </div>
            
            {/* 失败 */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
              <div className="text-slate-400 font-bold text-center mb-2">
                ❌ 挑战失败
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                <div>• 排名不变</div>
                <div>• 无惩罚</div>
                <div>• 可重新挑战</div>
              </div>
            </div>
          </div>
          
          {/* 按钮 */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-red-500/50"
            >
              ⚔️ 确认挑战
            </button>
          </div>
          
          <div className="mt-4 text-center text-slate-400 text-sm">
            预计战斗时长: 30-60秒
          </div>
        </div>
      </div>
    </>
  );
}


