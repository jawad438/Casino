
import React from 'react';
import { GameID } from '../types';
import { Blackjack } from '../games/Blackjack';
import { Roulette } from '../games/Roulette';
import { Slots } from '../games/Slots';
import { Crash } from '../games/Crash';
import { Mines } from '../games/Mines';
import { Plinko } from '../games/Plinko';
import { DiceDuel } from '../games/DiceDuel';
import { Baccarat } from '../games/Baccarat';
import { VideoPoker } from '../games/VideoPoker';
import { FortuneWheel } from '../games/FortuneWheel';

interface GameWrapperProps {
  gameId: GameID;
  balance: number;
  updateBalance: (amt: number) => void;
  onBack: () => void;
}

export const GameWrapper: React.FC<GameWrapperProps> = ({ gameId, balance, updateBalance, onBack }) => {
  const renderGame = () => {
    switch (gameId) {
      case 'blackjack': return <Blackjack balance={balance} updateBalance={updateBalance} />;
      case 'roulette': return <Roulette balance={balance} updateBalance={updateBalance} />;
      case 'slots': return <Slots balance={balance} updateBalance={updateBalance} />;
      case 'crash': return <Crash balance={balance} updateBalance={updateBalance} />;
      case 'mines': return <Mines balance={balance} updateBalance={updateBalance} />;
      case 'plinko': return <Plinko balance={balance} updateBalance={updateBalance} />;
      case 'dice': return <DiceDuel balance={balance} updateBalance={updateBalance} />;
      case 'baccarat': return <Baccarat balance={balance} updateBalance={updateBalance} />;
      case 'poker': return <VideoPoker balance={balance} updateBalance={updateBalance} />;
      case 'wheel': return <FortuneWheel balance={balance} updateBalance={updateBalance} />;
      default: return <div className="text-center p-20">Game coming soon!</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <button 
        onClick={onBack}
        className="self-start text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Lobby
      </button>
      <div className="card-gloss rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        {renderGame()}
      </div>
    </div>
  );
};
