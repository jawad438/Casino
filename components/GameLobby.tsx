
import React from 'react';
import { GameID, GameInfo } from '../types';

const GAMES: GameInfo[] = [
  { id: 'blackjack', name: 'Blackjack', description: 'Beat the dealer to 21.', icon: '♠️', color: 'from-blue-600 to-blue-800' },
  { id: 'roulette', name: 'Roulette', description: 'Classic European wheel.', icon: '🎡', color: 'from-red-600 to-red-800' },
  { id: 'slots', name: 'Slots', description: 'Triple diamond reels.', icon: '🎰', color: 'from-yellow-600 to-yellow-800' },
  { id: 'crash', name: 'The Moon', description: 'Multiplier race to space.', icon: '🚀', color: 'from-purple-600 to-purple-800' },
  { id: 'mines', name: 'Mines', description: 'Hidden gems in the grid.', icon: '💣', color: 'from-emerald-600 to-emerald-800' },
  { id: 'plinko', name: 'Plinko', description: 'Drop the ball for wins.', icon: '🏐', color: 'from-pink-600 to-pink-800' },
  { id: 'dice', name: 'Dice Duel', description: 'High stakes roll-off.', icon: '🎲', color: 'from-orange-600 to-orange-800' },
  { id: 'baccarat', name: 'Baccarat', description: 'Player vs Banker.', icon: '🤵', color: 'from-indigo-600 to-indigo-800' },
  { id: 'poker', name: 'Video Poker', description: 'Jacks or better.', icon: '🃏', color: 'from-rose-600 to-rose-800' },
  { id: 'wheel', name: 'Fortune', description: 'Spin for big multipliers.', icon: '🌀', color: 'from-cyan-600 to-cyan-800' },
];

interface LobbyProps {
  onSelectGame: (id: GameID) => void;
}

export const GameLobby: React.FC<LobbyProps> = ({ onSelectGame }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
      {GAMES.map((game) => (
        <button
          key={game.id}
          onClick={() => onSelectGame(game.id)}
          className="group relative h-64 overflow-hidden rounded-3xl border border-white/5 transition-all hover:scale-[1.02] hover:border-white/20 active:scale-[0.98]"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
          <div className="absolute inset-0 flex flex-col p-6 text-left">
            <span className="text-4xl mb-auto">{game.icon}</span>
            <div className="mt-4">
              <h3 className="text-2xl font-black tracking-tight">{game.name}</h3>
              <p className="text-zinc-400 text-sm mt-1">{game.description}</p>
            </div>
          </div>
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 p-2 rounded-full backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};
