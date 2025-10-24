import { useGameStore } from './store/gameStore';
import HomePage from './components/HomePage';
import RecruitPage from './components/RecruitPage';
import FormationPage from './components/FormationPage';
import TrainPage from './components/TrainPage';
import LevelSelectPage from './components/LevelSelectPage';
import StartPage from './components/StartPage';
import SettingsPage from './components/SettingsPage';
import VictoryPage from './components/VictoryPage';
import BattleResultPage from './components/BattleResultPage';
import LadderPage from './components/LadderPage';
import LadderResultPage from './components/LadderResultPage';
import DefenseFormationPage from './components/DefenseFormationPage';
import PhaserGame from './components/PhaserGame';

function App() {
  const currentScene = useGameStore((state) => state.currentScene);
  const setBattleResult = useGameStore((state) => state.setBattleResult);
  const setScene = useGameStore((state) => state.setScene);

  const handleBattleEnd = (result: 'win' | 'lose') => {
    setBattleResult(result);
    // 可以在这里添加额外的逻辑，比如显示结果统计
  };

  return (
    <div className="App">
      {currentScene === 'start' && <StartPage />}
      {currentScene === 'home' && <HomePage />}
      {currentScene === 'recruit' && <RecruitPage />}
      {currentScene === 'train' && <TrainPage />}
      {currentScene === 'levelSelect' && <LevelSelectPage />}
      {currentScene === 'formation' && <FormationPage />}
      {currentScene === 'settings' && <SettingsPage />}
      {currentScene === 'victory' && <VictoryPage />}
      {currentScene === 'battleResult' && <BattleResultPage />}
      {currentScene === 'ladder' && <LadderPage />}
      {currentScene === 'ladderResult' && <LadderResultPage />}
      {currentScene === 'defenseFormation' && <DefenseFormationPage />}
      {currentScene === 'battle' && (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
          <PhaserGame onGameEnd={handleBattleEnd} />
        </div>
      )}
    </div>
  );
}

export default App;
