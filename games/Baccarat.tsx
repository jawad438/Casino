
import React, { useState } from 'react';

export const Baccarat: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [selectedSide, setSelectedSide] = useState<'player' | 'banker' | 'tie' | null>(null);
  const [result, setResult] = useState<{ pScore: number; bScore: number } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');

  const deal = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (!selectedSide || balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setSpinning(true);
    setResult(null);
    setMessage('');

    setTimeout(() => {
      const pScore = Math.floor(Math.random() * 10);
      const bScore = Math.floor(Math.random() * 10);
      setResult({ pScore, bScore });
      setSpinning(false);

      let winner: 'player' | 'banker' | 'tie';
      if (pScore > bScore) winner = 'player';
      else if (bScore > pScore) winner = 'banker';
      else winner = 'tie';

      if (winner === selectedSide) {
        let payout = validBet * 2;
        if (winner === 'tie') payout = validBet * 9;
        if (winner === 'banker') payout = validBet * 1.95;
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

      <div className="flex flex-col items-center gap-6 w-full max-w-md bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5">
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block text-center">Stake</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input
                type="number"
                min="1"
                max={balance}
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={spinning}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <button
            onClick={deal}
            disabled={spinning || !selectedSide || balance < bet || bet <= 0}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-lg"
          >
            {spinning ? 'DEALING...' : 'PLACE BET'}
          </button>
        </div>
      </div>
      
      {message && <div className="text-2xl font-black uppercase tracking-widest animate-in zoom-in">{message}</div>}
    </div>
  );
};
