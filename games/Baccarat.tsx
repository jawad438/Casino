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
      // 50/50 logic: 4% Tie, 48% Player, 48% Banker
      const rand = Math.random();
      let winner: 'player' | 'banker' | 'tie';
      let pScore, bScore;

      if (rand < 0.04) {
        winner = 'tie';
        pScore = bScore = Math.floor(Math.random() * 10);
      } else if (rand < 0.52) { // (0.52 - 0.04) = 0.48 which is exactly 50% of the non-tie space
        winner = 'player';
        pScore = 7 + Math.floor(Math.random() * 3); // High score for winner
        bScore = Math.floor(Math.random() * 7);
      } else {
        winner = 'banker';
        bScore = 7 + Math.floor(Math.random() * 3);
        pScore = Math.floor(Math.random() * 7);
      }

      setResult({ pScore, bScore });
      setSpinning(false);

      if (winner === selectedSide) {
        let payout = validBet * 2;
        if (winner === 'tie') payout = validBet * 9;
        // Banker now pays full 2x to maintain 50/50 fairness
        updateBalance(payout);
        setMessage('YOU WIN!');
      } else {
        setMessage('HOUSE WINS');
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-12 items-center justify-center py-6">
        <div className={`p-10 rounded-[2.5rem] border-4 transition-all duration-500 shadow-2xl ${result && result.pScore > result.bScore ? 'bg-indigo-500/20 border-indigo-400' : 'bg-zinc-950/50 border-white/10'}`}>
          <div className={`text-6xl font-black mono text-center mb-2 ${result && result.pScore > result.bScore ? 'text-indigo-400 text-neon' : 'text-zinc-700'}`}>{result?.pScore ?? '--'}</div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 text-center">Player</div>
        </div>
        <div className="text-3xl font-black text-white/10 italic">VS</div>
        <div className={`p-10 rounded-[2.5rem] border-4 transition-all duration-500 shadow-2xl ${result && result.bScore > result.pScore ? 'bg-blue-500/20 border-blue-400' : 'bg-zinc-950/50 border-white/10'}`}>
          <div className={`text-6xl font-black mono text-center mb-2 ${result && result.bScore > result.pScore ? 'text-blue-400 text-neon' : 'text-zinc-700'}`}>{result?.bScore ?? '--'}</div>
          <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 text-center">Banker</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {(['player', 'tie', 'banker'] as const).map(side => (
          <button
            key={side}
            onClick={() => setSelectedSide(side)}
            className={`py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-all shadow-lg ${selectedSide === side ? 'bg-white text-zinc-950 ring-8 ring-white/10 scale-105' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
          >
            {side}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 block text-center">Wager</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input
                type="number"
                min="1"
                max={balance}
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={spinning}
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 pl-10 pr-4 mono text-white font-bold text-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>
          <button
            onClick={deal}
            disabled={spinning || !selectedSide || balance < bet || bet <= 0}
            className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 uppercase tracking-[0.2em] text-xl transition-all active:scale-95"
          >
            {spinning ? 'SHUFFLING...' : 'DEAL HAND'}
          </button>
        </div>
      </div>
      
      {message && <div className={`text-3xl font-black uppercase tracking-[0.2em] text-neon animate-in zoom-in ${message.includes('WIN') ? 'text-emerald-400' : 'text-zinc-500'}`}>{message}</div>}
    </div>
  );
};