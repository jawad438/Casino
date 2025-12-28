
import React from 'react';
import { GameID, GameInfo } from '../types';

const GAMES: GameInfo[] = [
  { id: 'blackjack', name: 'Blackjack', description: 'Fair Deck rules.', icon: '♠️', color: 'from-blue-400 to-indigo-600' },
  { id: 'roulette', name: 'Roulette', description: 'Classic European wheel.', icon: '🎡', color: 'from-rose-400 to-red-600' },
  { id: 'slots', name: 'Slots', description: 'Triple diamond reels.', icon: '🎰', color: 'from-amber-300 to-orange-500' },
  { id: 'investor', name: 'The Investor', description: 'Real-time market logic.', icon: '📈', color: 'from-emerald-400 to-green-700' },
  { id: 'momentum', name: 'Momentum', description: 'Vector physics gamble.', icon: '🚀', color: 'from-cyan-400 to-blue-600' },
  { id: 'crash', name: 'The Moon', description: 'Race to the stars.', icon: '🚀', color: 'from-fuchsia-400 to-purple-600' },
  { id: 'crowd', name: 'The Crowd', description: 'Political sentiment gamble.', icon: '👥', color: 'from-pink-500 to-purple-800' },
  { id: 'decay', name: 'Decay', description: 'System survival gamble.', icon: '🏚️', color: 'from-amber-700 to-zinc-900' },
  { id: 'mines', name: 'Mines', description: 'Uncover the treasure.', icon: '💎', color: 'from-emerald-400 to-teal-600' },
  { id: 'plinko', name: 'Plinko', description: 'Drop for massive wins.', icon: '🏐', color: 'from-pink-400 to-rose-500' },
  { id: 'dice', name: 'Dice Duel', description: 'Shoot for high stakes.', icon: '🎲', color: 'from-orange-400 to-amber-600' },
  { id: 'baccarat', name: 'Baccarat', description: '50/50 Player vs Banker.', icon: '🤵', color: 'from-indigo-400 to-blue-600' },
  { id: 'poker', name: 'Video Poker', description: 'Jacks or better.', icon: '🃏', color: 'from-red-400 to-rose-600' },
  { id: 'wheel', name: 'Fortune', description: 'Spin for multipliers.', icon: '🌀', color: 'from-cyan-400 to-blue-500' },
  { id: 'limbo', name: 'Limbo', description: 'Aim for the moon.', icon: '⚡', color: 'from-lime-400 to-green-600' },
  { id: 'keno', name: 'Keno', description: 'Lucky numbers draw.', icon: '🎟️', color: 'from-sky-400 to-blue-600' },
  { id: 'coinflip', name: 'Coin Flip', description: 'Double or nothing.', icon: '💵', color: 'from-yellow-400 to-orange-600' },
  { id: 'hilo', name: 'Hi-Lo', description: 'Predict the next card.', icon: '↕️', color: 'from-violet-400 to-purple-600' },
  { id: 'towers', name: 'Towers', description: 'Climb for the jackpot.', icon: '🏰', color: 'from-slate-400 to-slate-700' },
  { id: 'rockpaperscissors', name: 'R-P-S', description: 'Old school gamble.', icon: '✊', color: 'from-orange-500 to-red-700' },
];

interface LobbyProps {
  onSelectGame: (id: GameID) => void;
}

export const GameLobby: React.FC<LobbyProps> = ({ onSelectGame }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto pb-20">
      {GAMES.map((game) => (
        <button
          key={game.id}
          onClick={() => onSelectGame(game.id)}
          className="group relative h-64 overflow-hidden rounded-3xl border border-white/10 transition-all hover:scale-[1.05] hover:border-white/40 active:scale-[0.98] shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-70 group-hover:opacity-90 transition-opacity`} />
          <div className="absolute inset-0 flex flex-col p-6 text-left">
            <span className="text-5xl mb-auto filter drop-shadow-md">{game.icon}</span>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">{game.name}</h3>
              <p className="text-white/80 text-sm mt-1 font-medium">{game.description}</p>
            </div>
          </div>
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 p-2 rounded-full backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};
