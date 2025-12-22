
import React, { useState } from 'react';

const SEGMENTS = [
  { val: 1.5, color: 'fill-zinc-800' },
  { val: 2.0, color: 'fill-indigo-600' },
  { val: 0.5, color: 'fill-zinc-900' },
  { val: 3.0, color: 'fill-purple-600' },
  { val: 1.2, color: 'fill-zinc-800' },
  { val: 0.2, color: 'fill-zinc-950' },
  { val: 5.0, color: 'fill-rose-600' },
  { val: 0.8, color: 'fill-zinc-900' },
  { val: 1.5, color: 'fill-zinc-800' },
  { val: 2.0, color: 'fill-indigo-600' },
  { val: 0.0, color: 'fill-zinc-950' },
  { val: 1.2, color: 'fill-zinc-800' }
];

export const FortuneWheel: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const spin = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || spinning || validBet <= 0) return;
    updateBalance(-validBet);
    setSpinning(true);
    setResult(null);

    const segmentAngle = 360 / SEGMENTS.length;
    const spins = 10 + Math.floor(Math.random() * 5);
    const targetSegment = Math.floor(Math.random() * SEGMENTS.length);
    const randomOffset = (Math.random() * 0.8 + 0.1) * segmentAngle;
    const nextRotation = rotation + (spins * 360) - (targetSegment * segmentAngle) - randomOffset;

    setRotation(nextRotation);

    setTimeout(() => {
      setSpinning(false);
      const mult = SEGMENTS[targetSegment].val;
      const win = validBet * mult;
      updateBalance(win);
      setResult(win);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-yellow-500 drop-shadow-xl" />
        
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-2xl transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <circle cx="100" cy="100" r="98" className="fill-zinc-800 stroke-zinc-700 stroke-4" />
          {SEGMENTS.map((s, i) => {
            const angle = (i * 360) / SEGMENTS.length;
            const nextAngle = ((i + 1) * 360) / SEGMENTS.length;
            const x1 = 100 + 90 * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = 100 + 90 * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = 100 + 90 * Math.cos((nextAngle - 90) * Math.PI / 180);
            const y2 = 100 + 90 * Math.sin((nextAngle - 90) * Math.PI / 180);
            
            return (
              <g key={i}>
                <path 
                  d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`} 
                  className={`${s.color} stroke-zinc-800/30 stroke-1`}
                />
                <text
                  x="100"
                  y="35"
                  transform={`rotate(${angle + (180 / SEGMENTS.length)}, 100, 100)`}
                  textAnchor="middle"
                  className="fill-white font-black text-[8px] mono pointer-events-none tracking-tighter"
                >
                  {s.val}x
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="20" className="fill-zinc-950 stroke-zinc-800 stroke-2" />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <div className="w-full bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block text-center">Wager</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input
                type="number"
                min="1"
                max={balance}
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={spinning}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[5, 10, 25, 50].map(v => (
              <button 
                key={v} 
                onClick={() => setBet(v)} 
                disabled={spinning}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${bet === v ? 'bg-cyan-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                ${v}
              </button>
            ))}
          </div>
          <button
            onClick={spin}
            disabled={spinning || balance < bet || bet <= 0}
            className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-cyan-600/20 text-lg"
          >
            {spinning ? 'SPINNING...' : 'SPIN WHEEL'}
          </button>
        </div>

        <div className="h-12 flex items-center justify-center">
          {result !== null && (
            <div className={`text-xl font-black uppercase tracking-[0.2em] animate-in zoom-in duration-300 ${result >= bet ? 'text-cyan-400' : 'text-zinc-500'}`}>
              {result >= bet ? `WON $${result.toFixed(2)}!` : 'LOSS'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
