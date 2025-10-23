import { CharacterRarity } from '../types';

interface RarityUnlockNotificationProps {
  rarity: CharacterRarity;
  onClose: () => void;
  onNavigateToRecruit: () => void;
}

export default function RarityUnlockNotification({
  rarity,
  onClose,
  onNavigateToRecruit
}: RarityUnlockNotificationProps) {
  const getContent = () => {
    switch (rarity) {
      case 'rare':
        return {
          title: '🎉 稀有角色已解锁！',
          message: '你现在可以招募蓝色边框的稀有角色了！',
          tips: '💎 稀有角色拥有更强的属性和技能',
          color: 'from-blue-900 to-blue-800',
          border: 'border-blue-500'
        };
      case 'epic':
        return {
          title: '✨ 精英角色已解锁！',
          message: '你现在有机会招募紫色边框的精英角色了！',
          tips: '🌟 精英角色是最强的角色，拥有独特的稀有度加成',
          color: 'from-purple-900 to-purple-800',
          border: 'border-purple-500'
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className={`bg-gradient-to-br ${content.color} ${content.border} border-2 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl animate-bounce-in`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{content.title}</h2>
          <p className="text-xl text-gray-200 mb-4">{content.message}</p>
          <p className="text-sm text-gray-300 mb-6">{content.tips}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
            >
              稍后
            </button>
            <button
              onClick={onNavigateToRecruit}
              className={`flex-1 px-6 py-3 ${rarity === 'rare' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'} text-white rounded-lg transition font-medium`}
            >
              立即招募
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

