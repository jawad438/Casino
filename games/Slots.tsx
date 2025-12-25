import React, { useState, useEffect } from 'react';

const SYMBOLS = ['💎', '🍒', '🍋', '🔔', '⭐️', '7️⃣', '💎', '🍒', '🍋', '🔔'];

export const Slots: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [reels, setReels] = useState([0, 0, 0]); // Indices of SYMBOLS
  const [targetReels, setTargetReels] = useState([0, 0, 0]);

  const spin = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0 || spinning) return;
    updateBalance(-validBet);
    setSpinning(true);
    setMessage('');

    const newTargets = [
      Math.floor(Math.random() * (SYMBOLS.length - 1)),
      Math.floor(Math.random() * (SYMBOLS.length - 1)),
      Math.floor(Math.random() * (SYMBOLS.length - 1)),
    ];
    setTargetReels(newTargets);

    setTimeout(() => {
      setReels(newTargets);
      setSpinning(false);
      checkWin(newTargets, validBet);
    }, 2000);
  };

  const checkWin = (indices: number[], currentBet: number) => {
    const results = indices.map(i => SYMBOLS[i]);
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
      <div className="flex gap-4 p-8 bg-zinc-950 rounded-[3rem] border-8 border-zinc-900 shadow-2xl relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-yellow-500/20 z-0" />
        {reels.map((_, i) => (
          <div key={i} className="w-24 h-40 sm:w-32 sm:h-56 bg-zinc-900 rounded-3xl flex flex-col items-center overflow-hidden border border-white/5 shadow-inner relative z-10">
            <div 
              className={`flex flex-col transition-all duration-[2000ms] cubic-bezier(0.45, 0.05, 0.55, 0.95)`}
              style={{ transform: spinning ? `translateY(-${(SYMBOLS.length - 1) * 100}%)` : `translateY(-${reels[i] * 100}%)` }}
            >
              {[...SYMBOLS, ...SYMBOLS].map((s, idx) => (
                <div key={idx} className="h-40 sm:h-56 flex items-center justify-center text-5xl sm:text-7xl shrink-0">
                  {s}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="w-full bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/10 space-y-4 shadow-xl">
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
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-4 focus:ring-yellow-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[5, 10, 25, 100].map(v => (
              <button 
                key={v} 
                onClick={() => setBet(v)} 
                disabled={spinning}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${bet === v ? 'bg-yellow-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                ${v}
              </button>
            ))}
          </div>
          <button
            onClick={spin}
            disabled={spinning || balance < bet || bet <= 0}
            className="w-full py-6 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-2xl shadow-yellow-600/30 uppercase tracking-widest text-xl transition-all active:scale-95"
          >
            {spinning ? 'SPINNING...' : 'PULL LEVER'}
          </button>
        </div>
        <div className="h-10">
          {message && <div className="text-3xl font-black text-yellow-400 animate-bounce uppercase tracking-widest text-neon drop-shadow-lg">{message}</div>}
        </div>
      </div>
    </div>
  );
};