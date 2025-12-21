
import React, { useState } from 'react';
import { GameLobby } from './components/GameLobby';
import { Header } from './components/Header';
import { GameWrapper } from './components/GameWrapper';
import { GameID } from './types';

const App: React.FC = () => {
  // Balance is initialized to 100 on every load/refresh.
  // No localStorage side effects are used, ensuring a clean state every time.
  const [balance, setBalance] = useState<number>(100);
  const [activeGame, setActiveGame] = useState<GameID | null>(null);

  const handleUpdateBalance = (amount: number) => {
    setBalance(prev => Math.max(0, prev + amount));
  };

  const handleReset = () => {
    // Allows the user to top-up manually if they hit $0 without refreshing.
    if (balance === 0) setBalance(100);
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Header balance={balance} onReset={handleReset} onGoHome={() => setActiveGame(null)} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeGame ? (
          <GameWrapper 
            gameId={activeGame} 
            balance={balance} 
            updateBalance={handleUpdateBalance}
            onBack={() => setActiveGame(null)}
          />
        ) : (
          <GameLobby onSelectGame={(id) => setActiveGame(id)} />
        )}
      </main>

      <footer className="py-6 border-t border-white/5 text-center text-zinc-500 text-sm">
        <p>© 2024 Velvet Vault Casino • Responsible Gambling Simulated • Refresh to Reset</p>
      </footer>
    </div>
  );
};

export default App;
