import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';

export default function StartPage() {
  const setScene = useGameStore((state) => state.setScene);
  const characters = usePlayerStore((state) => state.characters);
  const clearAll = usePlayerStore((state) => state.clearAll);

  const hasSaveData = characters.length > 0;

  const handleNewGame = () => {
    if (hasSaveData) {
      if (confirm('确定要开始新游戏吗？这将清除所有当前存档数据！')) {
        clearAll();
        localStorage.removeItem('player-storage');
        localStorage.removeItem('game-storage');
        setScene('home');
      }
    } else {
      setScene('home');
    }
  };

  const handleContinue = () => {
    setScene('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8">
        {/* 游戏标题 */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse">
            AstroCade
          </h1>
          <p className="text-2xl text-slate-300 font-semibold">
            策略战斗 · 角色养成 · 技能学习
          </p>
        </div>

        {/* 按钮区域 */}
        <div className="space-y-6">
          {hasSaveData && (
            <button
              onClick={handleContinue}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-bold rounded-lg shadow-2xl transform transition hover:scale-105"
            >
              📂 继续游戏
            </button>
          )}

          <button
            onClick={handleNewGame}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-bold rounded-lg shadow-2xl transform transition hover:scale-105"
          >
            ⭐ {hasSaveData ? '开始新游戏' : '开始游戏'}
          </button>

          <button
            onClick={() => setScene('settings')}
            className="w-full px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white text-xl font-bold rounded-lg shadow-2xl transform transition hover:scale-105"
          >
            ⚙️ 设置
          </button>
        </div>

        {/* 存档提示 */}
        {hasSaveData && (
          <div className="mt-8 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg text-center">
            <p className="text-blue-300 text-sm">
              检测到存档数据：<span className="font-bold">{characters.length}个角色</span>
            </p>
          </div>
        )}

        {/* 版本信息 */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>版本 1.0.0 - Sprint 4</p>
          <p className="mt-2">包含角色升级、Boss战、新手引导等完整功能</p>
        </div>
      </div>
    </div>
  );
}

