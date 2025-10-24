import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';

export default function VictoryPage() {
  const setScene = useGameStore((state) => state.setScene);
  const battleCount = useGameStore((state) => state.battleCount);
  const recruitCount = useGameStore((state) => state.recruitCount);
  const skillLearnCount = useGameStore((state) => state.skillLearnCount);
  
  const characters = usePlayerStore((state) => state.characters);
  const clearAll = usePlayerStore((state) => state.clearAll);

  const handlePlayAgain = () => {
    if (confirm('确定要重新开始游戏吗？这将清除所有进度和角色！')) {
      clearAll();
      localStorage.removeItem('player-storage');
      localStorage.removeItem('game-storage');
      setScene('start');
    }
  };

  const handleBackHome = () => {
    setScene('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 via-purple-900 to-slate-900 overflow-y-auto py-8 px-8">
      <div className="max-w-3xl w-full mx-auto">
        {/* 通关标题 */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse">
            🎉 恭喜通关！ 🎉
          </h1>
          <p className="text-3xl text-yellow-300 font-semibold">
            你击败了暗影领主！
          </p>
        </div>

        {/* 统计信息卡片 */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-8 border-2 border-yellow-500/50 shadow-2xl mb-8">
          <h2 className="text-3xl font-bold text-center text-white mb-6">游戏统计</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* 战斗次数 */}
            <div className="bg-gradient-to-br from-red-600/30 to-red-900/30 rounded-lg p-4 border border-red-500/50 text-center">
              <div className="text-4xl mb-2">⚔️</div>
              <div className="text-3xl font-bold text-red-300">{battleCount}</div>
              <div className="text-sm text-slate-400 mt-1">战斗次数</div>
            </div>

            {/* 招募角色数 */}
            <div className="bg-gradient-to-br from-blue-600/30 to-blue-900/30 rounded-lg p-4 border border-blue-500/50 text-center">
              <div className="text-4xl mb-2">🎭</div>
              <div className="text-3xl font-bold text-blue-300">{recruitCount}</div>
              <div className="text-sm text-slate-400 mt-1">招募次数</div>
            </div>

            {/* 学习技能数 */}
            <div className="bg-gradient-to-br from-purple-600/30 to-purple-900/30 rounded-lg p-4 border border-purple-500/50 text-center">
              <div className="text-4xl mb-2">✨</div>
              <div className="text-3xl font-bold text-purple-300">{skillLearnCount}</div>
              <div className="text-sm text-slate-400 mt-1">学习技能</div>
            </div>

            {/* 当前角色数 */}
            <div className="bg-gradient-to-br from-green-600/30 to-green-900/30 rounded-lg p-4 border border-green-500/50 text-center">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold text-green-300">{characters.length}</div>
              <div className="text-sm text-slate-400 mt-1">当前角色</div>
            </div>
          </div>

          {/* 角色展示 */}
          {characters.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 text-center">通关队伍</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-600"
                  >
                    <div className="text-white font-semibold">{char.name}</div>
                    <div className="text-xs text-yellow-400">Lv.{char.level || 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleBackHome}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-bold rounded-lg shadow-2xl transform transition hover:scale-105"
          >
            🏠 返回主页
          </button>
          <button
            onClick={handlePlayAgain}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-bold rounded-lg shadow-2xl transform transition hover:scale-105"
          >
            🔄 再次挑战
          </button>
        </div>

        {/* 感谢文本 */}
        <div className="mt-8 text-center text-slate-400">
          <p className="text-lg">感谢你的游玩！</p>
          <p className="text-sm mt-2">继续探索，挑战更高难度！</p>
        </div>
      </div>
    </div>
  );
}

