import React, { useState } from 'react';
import { ActivatedBond } from '../types';

interface BattleBondDisplayProps {
  activatedBonds: ActivatedBond[];
}

/**
 * 战斗中的羁绊显示组件 - 右侧固定面板
 */
export const BattleBondDisplay: React.FC<BattleBondDisplayProps> = ({ activatedBonds }) => {
  const [expanded, setExpanded] = useState(true);
  const [hoveredBond, setHoveredBond] = useState<string | null>(null);

  if (activatedBonds.length === 0) return null;

  return (
    <div className="battle-bond-panel fixed right-5 top-24 w-72 z-50">
      <div
        className="panel-container bg-gradient-to-br from-gray-900/90 to-gray-800/90 
                   backdrop-blur-md rounded-xl border-2 border-white/20 shadow-2xl"
      >
        {/* 头部 */}
        <div
          className="bond-panel-header flex justify-between items-center p-3 
                     border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            🔥 激活羁绊
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
              {activatedBonds.length}
            </span>
          </h3>
          <button className="text-white/60 hover:text-white transition-colors text-xs">
            {expanded ? '▼' : '▶'}
          </button>
        </div>

        {/* 内容区 */}
        {expanded && (
          <div className="bond-panel-content p-2 max-h-96 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {activatedBonds.map((activated) => (
                <div
                  key={activated.bond.id}
                  className="battle-bond-item relative"
                  onMouseEnter={() => setHoveredBond(activated.bond.id)}
                  onMouseLeave={() => setHoveredBond(null)}
                >
                  <div
                    className="bond-item-header p-2 rounded-lg bg-white/5 hover:bg-white/10
                               transition-all border-l-4 cursor-pointer"
                    style={{ borderColor: activated.bond.ui.color }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="bond-icon text-lg">{activated.bond.ui.icon}</span>
                      <span className="bond-name text-white text-sm font-semibold flex-1">
                        {activated.bond.name}
                      </span>
                      <span className="bond-level text-xs text-yellow-400">
                        {'⭐'.repeat(activated.level)}
                      </span>
                    </div>
                  </div>

                  {/* 悬停提示 */}
                  {hoveredBond === activated.bond.id && (
                    <div
                      className="bond-tooltip absolute left-full top-0 ml-2 w-56 z-50
                                 bg-gray-900/95 border border-white/30 rounded-lg p-3 shadow-2xl"
                    >
                      <div className="space-y-2">
                        {activated.effects.map((effect, idx) => (
                          <div key={idx} className="effect-line text-xs text-gray-300 flex gap-1">
                            <span className="text-green-400">✓</span>
                            <span>{effect.effect.description}</span>
                          </div>
                        ))}
                      </div>
                      <div className="triggered-chars mt-2 pt-2 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-1">触发角色：</p>
                        <p className="text-xs text-gray-300">
                          {activated.triggeredCharacters.map((c) => c.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 自定义滚动条样式 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
};

/**
 * 羁绊效果触发通知组件
 */
interface BondTriggerNotificationProps {
  bondName: string;
  effectDescription: string;
  onComplete: () => void;
}

export const BondTriggerNotification: React.FC<BondTriggerNotificationProps> = ({
  bondName,
  effectDescription,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="bond-trigger-notification fixed top-12 left-1/2 transform -translate-x-1/2 z-[1000]
                 animate-slideDown"
    >
      <div
        className="notification-content bg-gradient-to-r from-orange-500 to-orange-600
                   border-2 border-yellow-400 rounded-xl px-6 py-4 shadow-2xl"
      >
        <h4 className="text-white font-bold text-lg mb-2 text-center drop-shadow-lg">
          {bondName} 效果触发！
        </h4>
        <p className="text-white text-sm text-center drop-shadow-md">→ {effectDescription}</p>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease, fadeOut 0.3s ease 1.7s forwards;
        }
        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
        }
      `}</style>
    </div>
  );
};

export default BattleBondDisplay;

