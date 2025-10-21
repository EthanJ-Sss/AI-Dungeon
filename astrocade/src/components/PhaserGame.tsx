import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BattleScene from '../game/scenes/BattleScene';

interface PhaserGameProps {
  onGameEnd?: (result: 'win' | 'lose') => void;
}

export default function PhaserGame({ onGameEnd }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Phaser游戏配置
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1200,
      height: 700,
      parent: containerRef.current,
      backgroundColor: '#1a1a2e',
      scene: [BattleScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    // 创建游戏实例
    gameRef.current = new Phaser.Game(config);

    // 监听游戏结束事件
    if (onGameEnd) {
      gameRef.current.events.on('battle-end', (result: 'win' | 'lose') => {
        onGameEnd(result);
      });
    }

    // 清理函数
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onGameEnd]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-slate-900"
    />
  );
}



