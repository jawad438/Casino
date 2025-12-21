
import React, { useState } from 'react';

export const DiceDuel: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [rolls, setRolls] = useState({ player: 0, house: 0 });
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState('');

  const roll = () => {
    if (balance < bet) return;
    updateBalance(-bet);
    setRolling(true);
    setMessage('');

    setTimeout(() => {
      const p = Math.floor(Math.random() * 6) + 1;
      const h = Math.floor(Math.random() * 6) + 1;
      setRolls({ player: p, house: h });
      setRolling(false);

      if (p > h) {
        updateBalance(bet * 2);
        setMessage('Victory!');
      } else if (p < h) {
        setMessage('Defeat!');
      } else {
        updateBalance(bet);
        setMessage('Tie! Bet returned.');
      }
    }, 1000);
  };

  const Die = ({ val }: { val: number }) => (
    <div className={`w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center text-5xl sm:text-7xl text-zinc-900 border-b-8 border-zinc-200 ${rolling ? 'animate-bounce' : ''}`}>
      {val || '?'}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-12 items-center">
        <div className="flex flex-col items-center gap-4">
          <Die val={rolls.player} />
          <span className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em]">You</span>
        </div>
        <div className="text-4xl italic font-black text-white/20">VS</div>
        <div className="flex flex-col items-center gap-4">
          <Die val={rolls.house} />
          <span className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em]">House</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
            {[10, 25, 50, 100].map(v => (
              <button key={v} onClick={() => setBet(v)} disabled={rolling} className={`px-4 py-2 rounded-lg text-sm font-bold ${bet === v ? 'bg-orange-600 text-white' : 'text-zinc-500'}`}>${v}</button>
            ))}
          </div>
          <button
            onClick={roll}
            disabled={rolling || balance < bet}
            className="px-10 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl shadow-lg shadow-orange-600/20"
          >
            ROLL DICE
          </button>
        </div>
        {message && <div className={`text-2xl font-black ${message.includes('Victory') ? 'text-green-400' : 'text-red-400'}`}>{message}</div>}
      </div>
    </div>
  );
};
