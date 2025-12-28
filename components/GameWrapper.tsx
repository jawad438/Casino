
import React, { useState } from 'react';
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
import { Limbo } from '../games/Limbo';
import { Keno } from '../games/Keno';
import { CoinFlip } from '../games/CoinFlip';
import { Hilo } from '../games/Hilo';
import { Towers } from '../games/Towers';
import { RockPaperScissors } from '../games/RockPaperScissors';
import { Investor } from '../games/Investor';
import { Momentum } from '../games/Momentum';
import { Crowd } from '../games/Crowd';
import { Decay } from '../games/Decay';

interface GameWrapperProps {
  gameId: GameID;
  balance: number;
  updateBalance: (amt: number) => void;
  onBack: () => void;
}

export const GameWrapper: React.FC<GameWrapperProps> = ({ gameId, balance, updateBalance, onBack }) => {
  const [isLocked, setIsLocked] = useState(false);

  const renderGame = () => {
    // Note: We pass setIsLocked to games so they can block navigation
    const props = { balance, updateBalance, setLocked: setIsLocked };
    
    switch (gameId) {
      case 'blackjack': return <Blackjack {...props} />;
      case 'roulette': return <Roulette {...props} />;
      case 'slots': return <Slots {...props} />;
      case 'crash': return <Crash {...props} />;
      case 'mines': return <Mines {...props} />;
      case 'plinko': return <Plinko {...props} />;
      case 'dice': return <DiceDuel {...props} />;
      case 'baccarat': return <Baccarat {...props} />;
      case 'poker': return <VideoPoker {...props} />;
      case 'wheel': return <FortuneWheel {...props} />;
      case 'limbo': return <Limbo {...props} />;
      case 'keno': return <Keno {...props} />;
      case 'coinflip': return <CoinFlip {...props} />;
      case 'hilo': return <Hilo {...props} />;
      case 'towers': return <Towers {...props} />;
      case 'rockpaperscissors': return <RockPaperScissors {...props} />;
      case 'investor': return <Investor {...props} />;
      case 'momentum': return <Momentum {...props} />;
      case 'crowd': return <Crowd {...props} />;
      case 'decay': return <Decay {...props} />;
      default: return <div className="text-center p-20">Game coming soon!</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <button 
        onClick={() => !isLocked && onBack()}
        disabled={isLocked}
        className={`self-start flex items-center gap-2 text-sm font-semibold transition-all ${isLocked ? 'text-zinc-700 opacity-50 cursor-not-allowed' : 'text-zinc-500 hover:text-white'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {isLocked ? 'Game in Progress...' : 'Back to Lobby'}
      </button>
      <div className="card-gloss rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        {renderGame()}
      </div>
    </div>
  );
};
