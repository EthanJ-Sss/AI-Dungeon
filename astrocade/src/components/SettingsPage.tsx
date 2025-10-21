import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';

export default function SettingsPage() {
  const setScene = useGameStore((state) => state.setScene);
  const clearAll = usePlayerStore((state) => state.clearAll);

  const handleResetData = () => {
    if (confirm('确定要重置所有数据吗？这将删除所有角色、俘虏和进度！此操作不可撤销。')) {
      clearAll();
      localStorage.removeItem('player-storage');
      localStorage.removeItem('game-storage');
      alert('数据已重置！');
      setScene('start');
    }
  };

  const handleBack = () => {
    setScene('start');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">⚙️ 设置</h1>
          <p className="text-slate-400">游戏设置与数据管理</p>
        </div>

        {/* 设置卡片 */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl space-y-6">
          {/* 版本信息 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-2">📋 版本信息</h3>
            <div className="text-slate-300 space-y-1 text-sm">
              <p>游戏版本：<span className="text-blue-400 font-semibold">1.0.0</span></p>
              <p>当前Sprint：<span className="text-purple-400 font-semibold">Sprint 4</span></p>
              <p>功能：角色升级、Boss战、新手引导</p>
            </div>
          </div>

          {/* 数据管理 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">💾 数据管理</h3>
            <button
              onClick={handleResetData}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition transform hover:scale-105"
            >
              🗑️ 重置所有数据
            </button>
            <p className="text-slate-400 text-xs mt-2 text-center">
              此操作将清除所有角色、俘虏和进度数据
            </p>
          </div>

          {/* 游戏说明 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">📖 游戏说明</h3>
            <div className="text-slate-300 text-sm space-y-2 leading-relaxed">
              <p>• <span className="font-semibold text-blue-400">招募</span>：招募强大的英雄加入队伍</p>
              <p>• <span className="font-semibold text-purple-400">养成</span>：通过战斗获得经验升级角色</p>
              <p>• <span className="font-semibold text-green-400">训练</span>：从俘虏处学习新技能</p>
              <p>• <span className="font-semibold text-red-400">战斗</span>：挑战9大关卡和最终Boss</p>
            </div>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <button
            onClick={handleBack}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition transform hover:scale-105"
          >
            ← 返回
          </button>
        </div>
      </div>
    </div>
  );
}

