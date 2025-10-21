import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import type { LevelConfig } from '../types';
import levelsData from '../config/levels.json';

export default function LevelSelectPage() {
  const setScene = useGameStore((state) => state.setScene);
  const setLevel = useGameStore((state) => state.setLevel);
  const isLevelUnlocked = useGameStore((state) => state.isLevelUnlocked);
  const isLevelCompleted = useGameStore((state) => state.isLevelCompleted);
  const characters = usePlayerStore((state) => state.characters);

  const levels = levelsData as LevelConfig[];

  const handleSelectLevel = (level: LevelConfig) => {
    const unlocked = isLevelUnlocked(level.id);
    if (!unlocked) {
      alert('该关卡尚未解锁！请先完成前置关卡。');
      return;
    }

    if (characters.length === 0) {
      alert('请先招募至少一个角色！');
      return;
    }

    setLevel(level);
    setScene('formation');
  };

  const handleBack = () => {
    setScene('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-3">
            选择关卡
          </h1>
          <p className="text-slate-400 text-lg">
            挑战不同难度的关卡，获得丰厚奖励
          </p>
        </div>

        {/* 关卡列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level.id);
            const completed = isLevelCompleted(level.id);
            const difficultyColor = getDifficultyColor(level.difficulty || '');
            const difficultyBg = getDifficultyBg(level.difficulty || '');

            return (
              <div
                key={level.id}
                onClick={() => unlocked && handleSelectLevel(level)}
                className={`
                  relative bg-slate-800/50 rounded-xl p-6 border-2 transition transform
                  ${unlocked
                    ? completed 
                      ? 'border-green-500 hover:border-green-400 cursor-pointer hover:scale-105 hover:shadow-2xl'
                      : 'border-orange-500 hover:border-orange-400 cursor-pointer hover:scale-105 hover:shadow-2xl'
                    : 'border-slate-700 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                {/* 锁定标记 */}
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl z-10">
                    <div className="text-center">
                      <div className="text-6xl mb-2">🔒</div>
                      <div className="text-white font-bold text-lg">未解锁</div>
                    </div>
                  </div>
                )}

                {/* 完成标记 */}
                {completed && unlocked && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-green-600 rounded-full flex items-center gap-1 text-white font-bold text-sm shadow-lg">
                    <span>✓</span>
                    <span>已完成</span>
                  </div>
                )}

                {/* 关卡编号 */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {level.id}
                </div>

                {/* 关卡信息 */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {level.name}
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {level.description || '暂无描述'}
                  </p>
                </div>

                {/* 难度标签 */}
                {level.difficulty && (
                  <div className="mb-4">
                    <span className={`px-3 py-1 ${difficultyBg} ${difficultyColor} rounded-full text-sm font-semibold`}>
                      难度: {level.difficulty}
                    </span>
                  </div>
                )}

                {/* 敌人信息 */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👹</span>
                    <span className="text-white font-semibold">敌人数量</span>
                  </div>
                  <div className="text-red-400 text-2xl font-bold">
                    {level.enemies.length} 个
                  </div>
                </div>

                {/* 场景信息 */}
                <div className="mt-4 text-center">
                  <div className="text-slate-400 text-xs">场景</div>
                  <div className="text-slate-200 font-semibold">
                    {getSceneName(level.scene)}
                  </div>
                </div>

                {/* 选择按钮 */}
                {unlocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectLevel(level);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition"
                  >
                    选择此关卡
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 返回按钮 */}
        <div className="flex justify-center">
          <button
            onClick={handleBack}
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-lg font-semibold rounded-lg transition"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
}

function getDifficultyColor(difficulty: string): string {
  const colorMap: Record<string, string> = {
    '简单': 'text-green-300',
    '中等': 'text-yellow-300',
    '困难': 'text-red-300',
  };
  return colorMap[difficulty] || 'text-slate-300';
}

function getDifficultyBg(difficulty: string): string {
  const bgMap: Record<string, string> = {
    '简单': 'bg-green-900/50',
    '中等': 'bg-yellow-900/50',
    '困难': 'bg-red-900/50',
  };
  return bgMap[difficulty] || 'bg-slate-900/50';
}

function getSceneName(scene: string): string {
  const sceneMap: Record<string, string> = {
    plain: '平原',
    forest: '森林',
    shadow: '暗影之地',
    swamp: '沼泽',
  };
  return sceneMap[scene] || scene;
}

