
import React, { useState, useEffect } from 'react';

const NUMBERS = Array.from({ length: 40 }, (_, i) => i + 1);
const PAYOUTS: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 1.5, 4: 4, 5: 12, 6: 25, 7: 60, 8: 150, 9: 500, 10: 1000 };

export const Keno: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');

  const draw = async () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || selected.length === 0 || spinning) return;
    updateBalance(-validBet);
    setSpinning(true);
    setLocked?.(true);
    setDrawn([]);
    setMessage('');
    const pool = [...NUMBERS]; const results: number[] = [];
    for (let i = 0; i < 10; i++) {
      const val = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      results.push(val); setDrawn(prev => [...prev, val]);
      await new Promise(r => setTimeout(r, 200));
    }
    const matches = results.filter(r => selected.includes(r)).length; const multiplier = PAYOUTS[matches] || 0;
    if (multiplier > 0) { updateBalance(validBet * multiplier); setMessage(`MATCHED ${matches}! +$${validBet * multiplier}`); }
    else { setMessage('NO MATCH'); }
    setSelected([]);
    setSpinning(false);
    setLocked?.(false);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="grid grid-cols-8 gap-2 flex-grow">
        {NUMBERS.map(n => {
          const isSelected = selected.includes(n); const isDrawn = drawn.includes(n); const isMatch = isSelected && isDrawn;
          return ( <button key={n} onClick={() => !spinning && setSelected(prev => prev.includes(n) ? prev.filter(x => x !== n) : (prev.length < 10 ? [...prev, n] : prev))} className={`aspect-square rounded-xl text-xs font-black transition-all border ${isMatch ? 'bg-sky-500 border-sky-400 text-white' : isDrawn ? 'bg-white text-zinc-900 border-white' : isSelected ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/20'}`}>{n}</button> );
        })}
      </div>
      <div className="w-full lg:w-72 flex flex-col gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
        <div className="space-y-4">
          <div className="flex justify-between items-end"><div className="text-[10px] font-black uppercase text-zinc-500">Selected</div><div className="text-xl font-black text-white">{selected.length}/10</div></div>
          <div className="space-y-2 text-center"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block">Wager</label><input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={spinning} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 mono text-white font-bold" /></div>
          <button onClick={draw} disabled={spinning || selected.length === 0 || balance < bet || bet <= 0} className="w-full py-5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black rounded-2xl shadow-xl uppercase tracking-widest text-sm transition-all">{spinning ? 'DRAWING...' : 'START DRAW'}</button>
        </div>
        {message && <div className="text-center font-black uppercase text-sky-400 text-sm animate-bounce">{message}</div>}
      </div>
    </div>
  );
};
