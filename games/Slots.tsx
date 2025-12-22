
import React, { useState } from 'react';

const SYMBOLS = ['💎', '🍒', '🍋', '🔔', '⭐️', '7️⃣'];

export const Slots: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [reels, setReels] = useState(['💎', '💎', '💎']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState('');

  const spin = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setSpinning(true);
    setMessage('');

    let iterations = 0;
    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      iterations++;
      if (iterations > 15) {
        clearInterval(interval);
        const finalReels = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ];
        setReels(finalReels);
        setSpinning(false);
        checkWin(finalReels, validBet);
      }
    }, 100);
  };

  const checkWin = (results: string[], currentBet: number) => {
    if (results[0] === results[1] && results[1] === results[2]) {
      const win = currentBet * 10;
      updateBalance(win);
      setMessage(`JACKPOT! +$${win}`);
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      const win = currentBet * 2;
      updateBalance(win);
      setMessage(`Nice! +$${win}`);
    } else {
      setMessage('Try again!');
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-4 p-6 bg-zinc-950 rounded-3xl border-4 border-zinc-800 shadow-inner">
        {reels.map((s, i) => (
          <div key={i} className="w-24 h-32 sm:w-32 sm:h-44 bg-zinc-900 rounded-2xl flex items-center justify-center text-5xl sm:text-7xl shadow-xl border border-white/5">
            {s}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="w-full bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block text-center">Stake Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input
                type="number"
                min="1"
                max={balance}
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={spinning}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[5, 10, 20, 50].map(v => (
              <button 
                key={v} 
                onClick={() => setBet(v)} 
                disabled={spinning}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${bet === v ? 'bg-yellow-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                ${v}
              </button>
            ))}
          </div>
          <button
            onClick={spin}
            disabled={spinning || balance < bet || bet <= 0}
            className="w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-yellow-600/30 uppercase tracking-widest text-lg"
          >
            {spinning ? 'SPINNING...' : 'PULL LEVER'}
          </button>
        </div>
        {message && <div className="text-2xl font-black text-yellow-400 animate-pulse uppercase tracking-widest">{message}</div>}
      </div>
    </div>
  );
};
