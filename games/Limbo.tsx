
import React, { useState, useEffect } from 'react';

export const Limbo: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [target, setTarget] = useState(2.0);
  const [result, setResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const play = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || spinning || target < 1.01) return;
    updateBalance(-validBet);
    setSpinning(true);
    setLocked?.(true);
    setResult(null);
    setTimeout(() => {
      const outcome = 0.99 / (1 - Math.random());
      setResult(outcome);
      setSpinning(false);
      setLocked?.(false);
      if (outcome >= target) updateBalance(validBet * target);
    }, 600);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-full h-48 bg-zinc-950 rounded-3xl flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
        <div className={`text-7xl sm:text-9xl font-black mono transition-all ${spinning ? 'opacity-20 blur-sm' : result === null ? 'text-zinc-800' : result >= target ? 'text-lime-400 text-neon' : 'text-rose-500'}`}>{result ? result.toFixed(2) : '1.00'}x</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 space-y-4">
          <label className="text-[10px] font-black uppercase text-zinc-500 block text-center">Bet Amount</label>
          <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span><input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseFloat(e.target.value) || 0))} disabled={spinning} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 pl-9 pr-4 mono text-white font-bold" /></div>
        </div>
        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 space-y-4">
          <label className="text-[10px] font-black uppercase text-zinc-500 block text-center">Target Multiplier</label>
          <div className="relative"><input type="number" step="0.01" min="1.01" value={target} onChange={(e) => setTarget(Math.max(1.01, parseFloat(e.target.value) || 1.01))} disabled={spinning} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 mono text-white font-bold" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">x</span></div>
        </div>
      </div>
      <button onClick={play} disabled={spinning || balance < bet || bet <= 0} className="w-full py-6 bg-lime-500 text-zinc-950 font-black rounded-2xl shadow-xl uppercase tracking-[0.3em] text-xl transition-all active:scale-95 disabled:opacity-50">{spinning ? 'FLIGHT...' : 'BET'}</button>
    </div>
  );
};
