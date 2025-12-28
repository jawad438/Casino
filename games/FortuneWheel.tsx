
import React, { useState, useEffect } from 'react';

const SEGMENTS = [{ val: 1.5, color: 'fill-emerald-600' }, { val: 2.0, color: 'fill-indigo-600' }, { val: 0.1, color: 'fill-zinc-900' }, { val: 3.0, color: 'fill-purple-600' }, { val: 0.5, color: 'fill-zinc-950' }, { val: 1.2, color: 'fill-amber-600' }, { val: 10.0, color: 'fill-rose-600' }, { val: 0.8, color: 'fill-zinc-900' }, { val: 1.5, color: 'fill-emerald-600' }, { val: 2.0, color: 'fill-indigo-600' }, { val: 0.0, color: 'fill-red-950' }, { val: 1.2, color: 'fill-amber-600' }, { val: 5.0, color: 'fill-cyan-600' }, { val: 0.5, color: 'fill-zinc-900' }];

export const FortuneWheel: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const spin = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || spinning || validBet <= 0) return;
    updateBalance(-validBet);
    setSpinning(true);
    setLocked?.(true);
    setResult(null);
    const segmentAngle = 360 / SEGMENTS.length; const spins = 10 + Math.floor(Math.random() * 5); const targetSegmentIndex = Math.floor(Math.random() * SEGMENTS.length); const segmentCenterAngle = (targetSegmentIndex * segmentAngle) + (segmentAngle / 2); const nextRotation = rotation + (spins * 360) - (rotation % 360) - segmentCenterAngle;
    setRotation(nextRotation);
    setTimeout(() => {
      setSpinning(false);
      setLocked?.(false);
      const mult = SEGMENTS[targetSegmentIndex].val; const win = validBet * mult; updateBalance(win); setResult(win);
    }, 4000);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 perspective-[1000px]">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40"><svg width="40" height="40" viewBox="0 0 40 40"><path d="M20 40 L5 0 L35 0 Z" className="fill-yellow-500 stroke-zinc-950 stroke-2" /></svg></div>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)" style={{ transform: `rotate(${rotation}deg)` }}>
          <circle cx="100" cy="100" r="98" className="fill-zinc-800 stroke-zinc-700 stroke-4" />
          {SEGMENTS.map((s, i) => {
            const angle = (i * 360) / SEGMENTS.length; const nextAngle = ((i + 1) * 360) / SEGMENTS.length; const startAngle = angle - 90 - (360 / SEGMENTS.length / 2); const endAngle = nextAngle - 90 - (360 / SEGMENTS.length / 2); const x1 = 100 + 90 * Math.cos(startAngle * Math.PI / 180); const y1 = 100 + 90 * Math.sin(startAngle * Math.PI / 180); const x2 = 100 + 90 * Math.cos(endAngle * Math.PI / 180); const y2 = 100 + 90 * Math.sin(endAngle * Math.PI / 180);
            return ( <g key={i}><path d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`} className={`${s.color} stroke-white/5`} /><text x="100" y="30" transform={`rotate(${angle}, 100, 100)`} textAnchor="middle" className="fill-white font-black text-[9px] mono pointer-events-none drop-shadow-md">{s.val}x</text></g> );
          })}
          <circle cx="100" cy="100" r="24" className="fill-zinc-950 stroke-white/10 stroke-2" /><circle cx="100" cy="100" r="8" className="fill-yellow-500" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="w-full bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/10 space-y-4 shadow-xl">
          <div className="space-y-2 text-center"><label className="text-[10px] font-black uppercase text-zinc-500">Wager</label>
            <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span><input type="number" min="1" max={balance} value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={spinning} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold" /></div>
          </div>
          <button onClick={spin} disabled={spinning || balance < bet || bet <= 0} className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black rounded-2xl uppercase tracking-widest text-xl transition-all active:scale-95">{spinning ? 'SPINNING...' : 'SPIN WHEEL'}</button>
        </div>
        <div className="h-12 flex items-center justify-center">{result !== null && ( <div className={`text-3xl font-black uppercase text-neon animate-in zoom-in ${result >= bet ? 'text-cyan-400' : 'text-zinc-500'}`}>{result >= bet ? `WON $${result.toFixed(2)}!` : 'NO WIN'}</div> )}</div>
      </div>
    </div>
  );
};
