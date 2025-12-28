
import React, { useState, useEffect, useRef } from 'react';

const SYMBOLS = ['💎', '🍒', '🍋', '🔔', '⭐️', '7️⃣', '💰', '🍀', '🍎', '🍇'];
const REEL_STRIP = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS, ...SYMBOLS, ...SYMBOLS];

export const Slots: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [useTransition, setUseTransition] = useState(true);
  const [message, setMessage] = useState('');
  const [reels, setReels] = useState([0, 0, 0]);

  const spin = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0 || spinning) return;
    
    updateBalance(-validBet);
    setUseTransition(true);
    setSpinning(true);
    setLocked?.(true);
    setMessage('');

    const results = [Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length), Math.floor(Math.random() * SYMBOLS.length)];
    const spinTargets = results.map(r => r + SYMBOLS.length * 3);
    setReels(spinTargets);

    setTimeout(() => {
      setUseTransition(false);
      setReels(results);
      setSpinning(false);
      setLocked?.(false);
      checkWin(results, validBet);
    }, 2000);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  const checkWin = (indices: number[], currentBet: number) => {
    const results = indices.map(i => SYMBOLS[i]);
    if (results[0] === results[1] && results[1] === results[2]) {
      const win = currentBet * 25;
      updateBalance(win);
      setMessage(`JACKPOT! +$${win}`);
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      const win = currentBet * 3;
      updateBalance(win);
      setMessage(`NICE! +$${win}`);
    } else {
      setMessage('TRY AGAIN');
    }
  };

  const getTransform = (index: number) => {
    const percentage = (index / REEL_STRIP.length) * 100;
    return `translateY(-${percentage}%)`;
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-4 p-8 bg-zinc-950 rounded-[3rem] border-8 border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-24 sm:h-32 bg-yellow-500/5 z-20 pointer-events-none border-y border-yellow-500/10" />
        <div className="absolute inset-0 z-30 pointer-events-none rounded-[2.5rem] shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]" />
        {reels.map((pos, i) => (
          <div key={i} className="w-24 h-40 sm:w-32 sm:h-56 bg-zinc-900 rounded-3xl flex flex-col items-center overflow-hidden border border-white/5 shadow-inner relative z-10">
            <div className={`flex flex-col ${useTransition ? 'transition-transform duration-[2000ms] [transition-timing-function:cubic-bezier(0.45,0.05,0.2,1)]' : 'transition-none'}`} style={{ transform: getTransform(pos) }}>
              {REEL_STRIP.map((s, idx) => (
                <div key={idx} className="h-40 sm:h-56 flex items-center justify-center text-5xl sm:text-7xl shrink-0 select-none drop-shadow-2xl">{s}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-6 w-full max-md">
        <div className="w-full bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/10 space-y-4 shadow-xl">
          <div className="space-y-2 text-center">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Bet Amount</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input type="number" min="1" max={balance} value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={spinning} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 pl-10 pr-4 mono text-white font-bold text-xl text-center focus:outline-none focus:ring-4 focus:ring-yellow-500/20 transition-all" />
            </div>
          </div>
          <button onClick={spin} disabled={spinning || balance < bet || bet <= 0} className="w-full py-6 bg-gradient-to-r from-yellow-500 via-amber-600 to-orange-600 hover:from-yellow-400 hover:to-orange-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-2xl shadow-orange-600/30 uppercase tracking-[0.3em] text-2xl transition-all active:scale-95">{spinning ? 'SPINNING...' : 'JACKPOT SPIN'}</button>
        </div>
        <div className="h-12 flex items-center">{message && <div className={`text-3xl font-black uppercase tracking-widest text-neon animate-in zoom-in duration-300 ${message.includes('WIN') ? 'text-yellow-400' : 'text-zinc-600'}`}>{message}</div>}</div>
      </div>
    </div>
  );
};
