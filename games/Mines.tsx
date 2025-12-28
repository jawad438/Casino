
import React, { useState, useEffect } from 'react';

const GRID_SIZE = 25;

export const Mines: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [mines, setMines] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'hit' | 'cashed'>('betting');

  const start = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setLocked?.(true);
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
      setLocked?.(false);
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
    setLocked?.(false);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 grid grid-cols-5 gap-3 max-w-sm mx-auto perspective-[1000px]">
        {Array.from({ length: GRID_SIZE }).map((_, i) => {
          const isRevealed = revealed.includes(i);
          const isMine = mines.includes(i);
          const showCheat = gameState !== 'playing' && isMine;
          return (
            <div key={i} className="aspect-square relative transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: isRevealed || showCheat ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <button onClick={() => reveal(i)} disabled={gameState !== 'playing'} className="absolute inset-0 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-white/5 flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }} />
              <div className={`absolute inset-0 rounded-xl flex items-center justify-center text-3xl shadow-inner ${isMine ? 'bg-red-500 shadow-red-950/50' : 'bg-emerald-600 shadow-emerald-900/50'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{isMine ? '💣' : '💎'}</div>
            </div>
          );
        })}
      </div>
      <div className="w-full md:w-80 flex flex-col gap-5 bg-zinc-950 p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex flex-col gap-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Bet Amount</label>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span><input type="number" min="1" max={balance} value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={gameState === 'playing'} className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" /></div>
        </div>
        <div className="flex flex-col gap-2"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Danger Level (Mines)</label>
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
            {[1, 3, 5, 13].map(v => (<button key={v} onClick={() => setMineCount(v)} disabled={gameState === 'playing'} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mineCount === v ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{v}</button>))}
          </div>
        </div>
        {gameState === 'playing' ? (
          <div className="flex flex-col gap-4 mt-auto">
            <div className="text-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
              <div className="text-4xl font-black text-emerald-400 text-neon">{calculateMultiplier().toFixed(2)}x</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-1">Cashout: ${(bet * calculateMultiplier()).toFixed(2)}</div>
            </div>
            <button onClick={cashOut} className="py-6 bg-emerald-500 text-zinc-950 font-black rounded-2xl hover:bg-emerald-400 uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 text-lg transition-all active:scale-95">CASH OUT</button>
          </div>
        ) : (
          <button onClick={start} disabled={balance < bet || bet <= 0} className="py-6 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 mt-auto uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 text-lg transition-all active:scale-95">ENTER GRID</button>
        )}
      </div>
    </div>
  );
};
