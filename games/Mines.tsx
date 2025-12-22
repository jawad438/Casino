
import React, { useState } from 'react';

const GRID_SIZE = 25;

export const Mines: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'hit' | 'cashed'>('betting');

  const start = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
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

      <div className="w-full md:w-80 flex flex-col gap-5 bg-zinc-950 p-6 rounded-[2rem] border border-white/5">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Bet Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
            <input
              type="number"
              min="1"
              max={balance}
              value={bet}
              onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={gameState === 'playing'}
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex gap-1.5 mt-1">
            {[10, 50, 100].map(v => (
              <button 
                key={v} 
                onClick={() => setBet(v)} 
                disabled={gameState === 'playing'}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${bet === v ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-600'}`}
              >
                ${v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Danger Level (Mines)</label>
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
            {[1, 3, 5, 10].map(v => (
              <button key={v} onClick={() => setMineCount(v)} disabled={gameState === 'playing'} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mineCount === v ? 'bg-emerald-600 text-white' : 'text-zinc-500'}`}>{v}</button>
            ))}
          </div>
        </div>

        {gameState === 'playing' ? (
          <div className="flex flex-col gap-4 mt-auto">
            <div className="text-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <div className="text-3xl font-black text-emerald-400">{calculateMultiplier().toFixed(2)}x</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Next Profit: ${(bet * calculateMultiplier()).toFixed(2)}</div>
            </div>
            <button onClick={cashOut} className="py-5 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">CASH OUT</button>
          </div>
        ) : (
          <button 
            onClick={start} 
            disabled={balance < bet || bet <= 0} 
            className="py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 mt-auto uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20"
          >
            ENTER GRID
          </button>
        )}
      </div>
    </div>
  );
};
