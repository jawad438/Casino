
import React, { useState } from 'react';

export const Baccarat: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [selectedSide, setSelectedSide] = useState<'player' | 'banker' | 'tie' | null>(null);
  const [result, setResult] = useState<{ pScore: number; bScore: number } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');

  const deal = () => {
    if (!selectedSide || balance < bet) return;
    updateBalance(-bet);
    setSpinning(true);
    setResult(null);
    setMessage('');

    setTimeout(() => {
      // Simplified baccarat (just 0-9)
      const pScore = Math.floor(Math.random() * 10);
      const bScore = Math.floor(Math.random() * 10);
      setResult({ pScore, bScore });
      setSpinning(false);

      let winner: 'player' | 'banker' | 'tie';
      if (pScore > bScore) winner = 'player';
      else if (bScore > pScore) winner = 'banker';
      else winner = 'tie';

      if (winner === selectedSide) {
        let payout = bet * 2;
        if (winner === 'tie') payout = bet * 9;
        if (winner === 'banker') payout = bet * 1.95; // Banker commission
        updateBalance(payout);
        setMessage('WINNER!');
      } else {
        setMessage('HOUSE WINS');
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-8 items-center justify-center">
        <div className={`p-8 rounded-3xl border-2 transition-all ${result?.pScore ?? 0 > (result?.bScore ?? 0) ? 'bg-indigo-500/10 border-indigo-500' : 'bg-zinc-900 border-white/5'}`}>
          <div className="text-4xl font-black mono text-center mb-2">{result?.pScore ?? '--'}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Player</div>
        </div>
        <div className="text-xl font-black text-zinc-700">VS</div>
        <div className={`p-8 rounded-3xl border-2 transition-all ${result?.bScore ?? 0 > (result?.pScore ?? 0) ? 'bg-rose-500/10 border-rose-500' : 'bg-zinc-900 border-white/5'}`}>
          <div className="text-4xl font-black mono text-center mb-2">{result?.bScore ?? '--'}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Banker</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {(['player', 'tie', 'banker'] as const).map(side => (
          <button
            key={side}
            onClick={() => setSelectedSide(side)}
            className={`py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${selectedSide === side ? 'bg-white text-black ring-4 ring-white/10' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
          >
            {side}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
          {[10, 50, 100].map(v => (
            <button key={v} onClick={() => setBet(v)} className={`px-4 py-2 rounded-lg text-sm font-bold ${bet === v ? 'bg-indigo-600 text-white' : 'text-zinc-500'}`}>${v}</button>
          ))}
        </div>
        <button
          onClick={deal}
          disabled={spinning || !selectedSide || balance < bet}
          className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl"
        >
          {spinning ? 'DEALING...' : 'DEAL'}
        </button>
      </div>
      
      {message && <div className="text-xl font-black">{message}</div>}
    </div>
  );
};
