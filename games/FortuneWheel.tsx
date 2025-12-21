
import React, { useState } from 'react';

const SEGMENTS = [1.5, 2, 0.5, 3, 1.2, 0.2, 5, 0.8, 1.5, 2, 0, 1.2];

export const FortuneWheel: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);

  const spin = () => {
    if (balance < bet || spinning) return;
    updateBalance(-bet);
    setSpinning(true);
    setResult(null);

    const segmentAngle = 360 / SEGMENTS.length;
    const spins = 5 + Math.floor(Math.random() * 5);
    const targetSegment = Math.floor(Math.random() * SEGMENTS.length);
    const extraAngle = targetSegment * segmentAngle;
    const newRotation = rotation + (spins * 360) + extraAngle;

    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      // Determine winner based on rotation
      const actualRotation = newRotation % 360;
      const idx = Math.floor(actualRotation / segmentAngle);
      const mult = SEGMENTS[idx];
      const win = bet * mult;
      updateBalance(win);
      setResult(win);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-4 h-8 bg-red-500 z-20 clip-path-triangle" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
        <div 
          className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-8 border-zinc-800 relative overflow-hidden transition-transform duration-[3000ms] ease-out shadow-2xl"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {SEGMENTS.map((m, i) => (
            <div 
              key={i} 
              className={`absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-start justify-center pt-4 border-l border-zinc-800/50 ${m >= 2 ? 'bg-indigo-600' : m >= 1 ? 'bg-zinc-800' : 'bg-zinc-900'}`}
              style={{ transform: `rotate(${i * (360 / SEGMENTS.length)}deg)` }}
            >
              <span className="text-[10px] font-black rotate-90 origin-left ml-6">{m}x</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex bg-zinc-900 rounded-xl p-1">
          {[10, 20, 50].map(v => (
            <button key={v} onClick={() => setBet(v)} disabled={spinning} className={`px-4 py-2 rounded-lg text-sm font-bold ${bet === v ? 'bg-cyan-600 text-white' : 'text-zinc-500'}`}>${v}</button>
          ))}
        </div>
        <button
          onClick={spin}
          disabled={spinning || balance < bet}
          className="px-12 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-cyan-600/20"
        >
          {spinning ? 'SPINNING...' : 'SPIN FOR LUCK'}
        </button>
        {result !== null && (
          <div className={`text-2xl font-black ${result >= bet ? 'text-green-400 animate-bounce' : 'text-zinc-500'}`}>
            {result >= bet ? `YOU WON $${result.toFixed(2)}!` : 'BETTER LUCK NEXT TIME'}
          </div>
        )}
      </div>
    </div>
  );
};
