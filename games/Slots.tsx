
import React, { useState } from 'react';

const SYMBOLS = ['💎', '🍒', '🍋', '🔔', '⭐️', '7️⃣'];

export const Slots: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [reels, setReels] = useState(['💎', '💎', '💎']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState('');

  const spin = () => {
    if (balance < bet) return;
    updateBalance(-bet);
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
        checkWin(finalReels);
      }
    }, 100);
  };

  const checkWin = (results: string[]) => {
    if (results[0] === results[1] && results[1] === results[2]) {
      const win = bet * 10;
      updateBalance(win);
      setMessage(`JACKPOT! +$${win}`);
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      const win = bet * 2;
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

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
            {[5, 10, 20, 50].map(v => (
              <button key={v} onClick={() => setBet(v)} className={`px-4 py-2 rounded-lg text-sm font-bold ${bet === v ? 'bg-yellow-600 text-white' : 'text-zinc-500'}`}>${v}</button>
            ))}
          </div>
          <button
            onClick={spin}
            disabled={spinning || balance < bet}
            className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-yellow-600/30 uppercase tracking-widest text-lg"
          >
            {spinning ? 'Spinning...' : 'SPIN'}
          </button>
        </div>
        {message && <div className="text-2xl font-black text-yellow-400 animate-pulse">{message}</div>}
      </div>
    </div>
  );
};
