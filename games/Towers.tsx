
import React, { useState, useEffect } from 'react';

const TOTAL_LEVELS = 8; const TILES_PER_LEVEL = 3;

export const Towers: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [traps, setTraps] = useState<number[][]>([]);
  const [selections, setSelections] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'gameOver' | 'cashedOut'>('betting');

  const start = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setLocked?.(true);
    const t: number[][] = []; for (let i = 0; i < TOTAL_LEVELS; i++) t.push([Math.floor(Math.random() * TILES_PER_LEVEL)]);
    setTraps(t); setSelections([]); setCurrentLevel(0); setGameState('playing');
  };

  const selectTile = (level: number, tile: number) => {
    if (gameState !== 'playing' || level !== currentLevel) return;
    const newSelections = [...selections, tile]; setSelections(newSelections);
    if (traps[level].includes(tile)) { setGameState('gameOver'); setLocked?.(false); }
    else { if (level === TOTAL_LEVELS - 1) cashout(newSelections); else setCurrentLevel(level + 1); }
  };

  const cashout = (finalSelections?: number[]) => {
    const count = (finalSelections || selections).length; if (count === 0) return;
    updateBalance(bet * Math.pow(1.45, count)); setGameState('cashedOut'); setLocked?.(false);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <div className="flex flex-col-reverse gap-2 flex-grow">
        {Array.from({ length: TOTAL_LEVELS }).map((_, r) => (
          <div key={r} className={`flex gap-2 p-2 rounded-xl transition-all ${r === currentLevel && gameState === 'playing' ? 'bg-zinc-800 shadow-lg' : 'opacity-40'}`}>
            {Array.from({ length: TILES_PER_LEVEL }).map((_, c) => {
              const isSelected = selections[r] === c; const isTrap = traps[r]?.includes(c) && (gameState === 'gameOver' || isSelected); const showCorrect = traps[r] && !traps[r].includes(c) && (gameState === 'gameOver');
              return ( <button key={c} onClick={() => selectTile(r, c)} disabled={gameState !== 'playing' || r !== currentLevel} className={`flex-1 h-12 rounded-lg border-2 ${isSelected ? (isTrap ? 'bg-rose-500 border-rose-400' : 'bg-emerald-500 border-emerald-400') : showCorrect ? 'bg-zinc-700 border-zinc-600' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}>{isSelected && (isTrap ? '💀' : '💎')}</button> );
            })}
            <div className="w-16 flex items-center justify-center font-bold text-xs text-zinc-500">{Math.pow(1.45, r + 1).toFixed(2)}x</div>
          </div>
        ))}
      </div>
      <div className="w-full md:w-72 flex flex-col gap-6 bg-zinc-950 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        {gameState === 'playing' ? (
          <div className="space-y-6">
            <div className="text-center p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><div className="text-4xl font-black text-emerald-400">{Math.pow(1.45, currentLevel).toFixed(2)}x</div><div className="text-[10px] font-black uppercase text-zinc-500 mt-2 tracking-widest">Worth: ${(bet * Math.pow(1.45, currentLevel)).toFixed(2)}</div></div>
            <button onClick={() => cashout()} disabled={currentLevel === 0} className="w-full py-5 bg-emerald-500 text-zinc-950 font-black rounded-2xl uppercase tracking-[0.2em] transition-all disabled:opacity-50">CASHOUT</button>
          </div>
        ) : (
          <div className="space-y-4 text-center"><label className="text-[10px] font-black uppercase text-zinc-500 block">Wager</label><input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 text-center mono text-white font-bold" /><button onClick={start} disabled={balance < bet || bet <= 0} className="w-full py-6 bg-slate-200 text-zinc-900 font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl text-lg transition-all active:scale-95">ASCEND TOWER</button></div>
        )}
      </div>
    </div>
  );
};
