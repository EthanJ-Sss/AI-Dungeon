import React, { useMemo, useState } from 'react';
import { Character, ActivatedBond, BondConfig } from '../types';

interface BondDisplayProps {
  team: Character[];
  activatedBonds: ActivatedBond[];
}

/**
 * 羁绊显示组件 - 用于阵容编辑界面
 */
export const BondDisplay: React.FC<BondDisplayProps> = ({ team, activatedBonds }) => {
  const [expandedBond, setExpandedBond] = useState<string | null>(null);

  if (team.length === 0) {
    return (
      <div className="bond-display p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-2">🔗 羁绊系统</h3>
        <p className="text-gray-400 text-sm">选择角色后查看可激活的羁绊</p>
      </div>
    );
  }

  return (
    <div className="bond-display p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-white mb-4">🔥 激活的羁绊 ({activatedBonds.length})</h3>

      {activatedBonds.length === 0 ? (
        <div className="text-gray-400 text-sm">
          <p>当前阵容未激活任何羁绊</p>
          <p className="mt-2">💡 提示：相同元素、职业或阵营的角色可以激活羁绊</p>
        </div>
      ) : (
        <div className="activated-bonds space-y-3">
          {activatedBonds.map((activated) => (
            <BondCard
              key={activated.bond.id}
              activated={activated}
              expanded={expandedBond === activated.bond.id}
              onToggle={() =>
                setExpandedBond(expandedBond === activated.bond.id ? null : activated.bond.id)
              }
            />
          ))}
        </div>
      )}

      <PotentialBonds team={team} />
    </div>
  );
};

interface BondCardProps {
  activated: ActivatedBond;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * 单个羁绊卡片
 */
const BondCard: React.FC<BondCardProps> = ({ activated, expanded, onToggle }) => {
  const { bond, level, triggeredCharacters, effects } = activated;

  return (
    <div
      className={`bond-card p-3 rounded-lg border-2 transition-all cursor-pointer ${
        expanded ? 'bg-gray-700' : 'bg-gray-750'
      }`}
      style={{ borderColor: bond.ui.color }}
      onClick={onToggle}
    >
      <div className="bond-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bond-icon text-2xl">{bond.ui.icon}</span>
          <div>
            <span className="bond-name font-semibold text-white">{bond.name}</span>
            <span className="bond-level ml-2 text-yellow-400">
              {'⭐'.repeat(level)}
            </span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="bond-details mt-3 pt-3 border-t border-gray-600">
          <div className="triggered-characters mb-3">
            <strong className="text-sm text-gray-300">触发角色：</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {triggeredCharacters.map((char) => (
                <span
                  key={char.id}
                  className="char-name px-2 py-1 bg-gray-600 rounded text-sm text-white"
                >
                  {char.name}
                </span>
              ))}
            </div>
          </div>

          <div className="bond-effects space-y-1">
            <strong className="text-sm text-gray-300">效果：</strong>
            {effects.map((effect, idx) => (
              <div key={idx} className="effect-item text-sm text-green-400 flex items-start gap-1">
                <span>✓</span>
                <span>{effect.effect.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface PotentialBondsProps {
  team: Character[];
}

/**
 * 潜在羁绊提示（差1-2个角色就能激活的）
 */
const PotentialBonds: React.FC<PotentialBondsProps> = ({ team }) => {
  // 这里可以实现潜在羁绊检测逻辑
  // 暂时返回空，后续完善
  return null;
};

export default BondDisplay;


