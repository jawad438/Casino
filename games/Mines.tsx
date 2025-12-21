
import React, { useState } from 'react';

const GRID_SIZE = 25;

export const Mines: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'hit' | 'cashed'>('betting');

  const start = () => {
    if (balance < bet) return;
    updateBalance(-bet);
    const m: number[] = [];
    while (m.length < mineCount) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      if (!m.includes(r)) m.push(r);
    }
    setMines(m);
    setRevealed([]);
    setGameState('playing');
  };

  const reveal = (index: number) => {
    if (gameState !== 'playing' || revealed.includes(index)) return;
    if (mines.includes(index)) {
      setRevealed([...revealed, index]);
      setGameState('hit');
    } else {
      setRevealed([...revealed, index]);
    }
  };

  const calculateMultiplier = () => {
    if (revealed.length === 0) return 1;
    // Simple multiplier formula
    let mult = 1;
    for (let i = 0; i < revealed.length; i++) {
      mult *= (GRID_SIZE - i) / (GRID_SIZE - mineCount - i);
    }
    return mult;
  };

  const cashOut = () => {
    if (gameState !== 'playing' || revealed.length === 0) return;
    const win = bet * calculateMultiplier();
    updateBalance(win);
    setGameState('cashed');
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 grid grid-cols-5 gap-2 max-w-sm mx-auto">
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <button
            key={i}
            onClick={() => reveal(i)}
            disabled={gameState !== 'playing'}
            className={`aspect-square rounded-xl transition-all flex items-center justify-center text-2xl ${
              revealed.includes(i)
                ? mines.includes(i) ? 'bg-red-500 scale-90' : 'bg-indigo-600'
                : 'bg-zinc-800 hover:bg-zinc-700'
            } ${gameState === 'hit' && mines.includes(i) ? 'bg-red-500/50' : ''}`}
          >
            {revealed.includes(i) ? (mines.includes(i) ? '💣' : '💎') : ''}
            {gameState !== 'playing' && mines.includes(i) && !revealed.includes(i) ? '💣' : ''}
          </button>
        ))}
      </div>

      <div className="w-full md:w-64 flex flex-col gap-6 bg-zinc-950 p-6 rounded-3xl border border-white/5">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Bet Amount</label>
          <div className="flex bg-zinc-900 rounded-xl p-1">
            {[10, 20, 50].map(v => (
              <button key={v} onClick={() => setBet(v)} disabled={gameState === 'playing'} className={`flex-1 py-2 rounded-lg text-xs font-bold ${bet === v ? 'bg-zinc-700' : ''}`}>${v}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Mine Count</label>
          <div className="flex bg-zinc-900 rounded-xl p-1">
            {[1, 3, 5, 10].map(v => (
              <button key={v} onClick={() => setMineCount(v)} disabled={gameState === 'playing'} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mineCount === v ? 'bg-zinc-700' : ''}`}>{v}</button>
            ))}
          </div>
        </div>

        {gameState === 'playing' ? (
          <div className="flex flex-col gap-4 mt-auto">
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{calculateMultiplier().toFixed(2)}x</div>
              <div className="text-xs text-zinc-500">Current Multiplier</div>
            </div>
            <button onClick={cashOut} className="py-4 bg-green-500 text-black font-black rounded-xl hover:bg-green-400">CASH OUT</button>
          </div>
        ) : (
          <button onClick={start} disabled={balance < bet} className="py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 mt-auto">START GAME</button>
        )}
      </div>
    </div>
  );
};
