import { useState } from 'react';

interface Props {
  onRegisterSuccess: (playerName: string) => void;
  onSkip?: () => void; // 允许跳过，使用本地模式
  isOnlineMode?: boolean; // 是否在线模式
}

export default function PlayerRegisterModal({ onRegisterSuccess, onSkip, isOnlineMode = false }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    // 验证昵称
    if (!playerName.trim()) {
      setError('请输入昵称');
      return;
    }
    
    if (playerName.length < 2 || playerName.length > 12) {
      setError('昵称长度需要在2-12个字符之间');
      return;
    }
    
    // 验证昵称格式（只允许中文、英文、数字、下划线）
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
    if (!nameRegex.test(playerName)) {
      setError('昵称只能包含中文、英文、数字和下划线');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 统一处理：保存昵称到本地，由 Store 决定是否同步到服务器
      console.log('[注册] 使用昵称:', playerName, isOnlineMode ? '(在线模式)' : '(本地模式)');
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onRegisterSuccess(playerName);
    } catch (err: any) {
      console.error('[注册] 注册失败:', err);
      setError(err.message || '注册失败，请稍后重试');
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };
  
  return (
    <>
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black/80 z-50" />
      
      {/* 弹窗 */}
      <div className="fixed inset-0 z-50 overflow-y-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-full">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-2 border-yellow-500/50 shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300">
            
            {/* 标题 */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚔️</div>
              <h1 className="text-4xl font-bold text-yellow-400 mb-2">
                擂台竞技
              </h1>
              <p className="text-slate-300 text-sm">
                {isOnlineMode 
                  ? '与全球玩家一较高下！' 
                  : '本地模式（未配置在线服务）'}
              </p>
            </div>
            
            {/* 输入框 */}
            <div className="mb-6">
              <label className="block text-slate-300 text-sm font-bold mb-2">
                输入你的昵称
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                maxLength={12}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-yellow-500 focus:outline-none transition-colors text-lg"
                placeholder="请输入昵称 (2-12字符)"
                disabled={loading}
                autoFocus
              />
              <div className="mt-2 text-sm text-slate-400">
                {playerName.length}/12 字符
              </div>
              
              {/* 错误提示 */}
              {error && (
                <div className="mt-2 text-red-400 text-sm animate-in fade-in">
                  ⚠️ {error}
                </div>
              )}
            </div>
            
            {/* 说明 */}
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
              <div className="text-blue-400 font-bold mb-2">💡 规则说明</div>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• 昵称一旦注册<strong className="text-yellow-400">无法修改</strong></li>
                <li>• 只能包含中文、英文、数字、下划线</li>
                <li>• {isOnlineMode ? '全球玩家共享排行榜' : '本地游玩模式'}</li>
                <li>• 无限次挑战，争夺榜首荣耀！</li>
              </ul>
            </div>
            
            {/* 按钮 */}
            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !playerName.trim()}
                className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
                  loading || !playerName.trim()
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white hover:shadow-yellow-500/50'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    注册中...
                  </span>
                ) : (
                  `⚔️ 加入擂台 ${isOnlineMode ? '(在线模式)' : '(本地模式)'}`
                )}
              </button>
              
              {onSkip && (
                <button
                  onClick={onSkip}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-bold transition-colors disabled:opacity-50"
                >
                  稍后再说
                </button>
              )}
            </div>
            
            {/* 在线状态提示 */}
            <div className="mt-6 text-center">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                isOnlineMode 
                  ? 'bg-green-900/50 text-green-400 border border-green-500/50' 
                  : 'bg-slate-700 text-slate-400 border border-slate-600'
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full ${
                  isOnlineMode ? 'bg-green-400 animate-pulse' : 'bg-slate-400'
                }`} />
                {isOnlineMode ? '在线服务已连接' : '本地模式'}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}

