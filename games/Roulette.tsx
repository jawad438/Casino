
import React, { useState, useRef, useEffect } from 'react';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const WHEEL_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

export const Roulette: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [selectedBet, setSelectedBet] = useState<string | number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  
  const spin = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (!selectedBet || balance < validBet || spinning) return;
    
    updateBalance(-validBet);
    setSpinning(true);
    setLocked?.(true);
    setResult(null);
    setMessage('');

    const spins = 8 + Math.floor(Math.random() * 5);
    const outcomeIndex = Math.floor(Math.random() * WHEEL_NUMBERS.length);
    const outcome = WHEEL_NUMBERS[outcomeIndex];
    
    const segmentAngle = 360 / 37;
    const targetRotation = rotation + (spins * 360) - (rotation % 360) - (outcomeIndex * segmentAngle);
    
    setRotation(targetRotation);

    setTimeout(() => {
      setResult(outcome);
      setSpinning(false);
      setLocked?.(false);
      
      let won = false;
      if (typeof selectedBet === 'number') {
        if (outcome === selectedBet) won = true;
      } else if (selectedBet === 'red') {
        if (RED_NUMBERS.includes(outcome)) won = true;
      } else if (selectedBet === 'black') {
        if (outcome !== 0 && !RED_NUMBERS.includes(outcome)) won = true;
      } else if (selectedBet === 'even') {
        if (outcome !== 0 && outcome % 2 === 0) won = true;
      } else if (selectedBet === 'odd') {
        if (outcome % 2 !== 0) won = true;
      }

      if (won) {
        const multiplier = typeof selectedBet === 'number' ? 35 : 2;
        updateBalance(validBet * multiplier);
        setMessage(`WINNER! ${outcome}`);
      } else {
        setMessage(`LOSS: ${outcome}`);
      }
    }, 4000);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  const getNumColor = (n: number) => {
    if (n === 0) return 'fill-green-600';
    return RED_NUMBERS.includes(n) ? 'fill-red-600' : 'fill-zinc-900';
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30 w-4 h-8 bg-yellow-500 rounded-b-full shadow-lg border-2 border-zinc-950" />
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)" style={{ transform: `rotate(${rotation}deg)` }}>
          <circle cx="100" cy="100" r="98" className="fill-zinc-800 stroke-zinc-700 stroke-2" />
          {WHEEL_NUMBERS.map((num, i) => {
            const angle = (i * 360) / 37;
            const nextAngle = ((i + 1) * 360) / 37;
            const x1 = 100 + 85 * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = 100 + 85 * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = 100 + 85 * Math.cos((nextAngle - 90) * Math.PI / 180);
            const y2 = 100 + 85 * Math.sin((nextAngle - 90) * Math.PI / 180);
            return (
              <g key={num}>
                <path d={`M 100 100 L ${x1} ${y1} A 85 85 0 0 1 ${x2} ${y2} Z`} className={`${getNumColor(num)} stroke-zinc-700/30 stroke-[0.5]`} />
                <text x="100" y="25" transform={`rotate(${angle + (180 / 37)}, 100, 100)`} textAnchor="middle" className="fill-white font-black text-[6px] mono pointer-events-none">{num}</text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="15" className="fill-zinc-950 stroke-zinc-800 stroke-1 shadow-inner" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-800 shadow-xl z-20">
              <span className={`text-2xl font-black mono ${result !== null ? (result === 0 ? 'text-green-500' : RED_NUMBERS.includes(result) ? 'text-red-500' : 'text-zinc-300') : 'text-zinc-600'}`}>
                {spinning ? '?' : result ?? '--'}
              </span>
           </div>
        </div>
      </div>
      <div className="w-full space-y-6">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 p-3 bg-zinc-950 rounded-2xl border border-white/5">
          {Array.from({ length: 37 }).map((_, i) => (
            <button key={i} onClick={() => setSelectedBet(i)} className={`aspect-square flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${selectedBet === i ? 'ring-2 ring-yellow-500 scale-105 z-10 shadow-lg' : 'hover:opacity-80'} ${i === 0 ? 'bg-green-600' : RED_NUMBERS.includes(i) ? 'bg-red-600' : 'bg-zinc-800'}`}>
              {i}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {[{ id: 'red', color: 'bg-red-600', label: 'RED' }, { id: 'black', color: 'bg-zinc-800', label: 'BLACK' }, { id: 'even', color: 'bg-zinc-700', label: 'EVEN' }, { id: 'odd', color: 'bg-zinc-700', label: 'ODD' }].map(betType => (
            <button key={betType.id} onClick={() => setSelectedBet(betType.id)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-[0.2em] border transition-all ${selectedBet === betType.id ? 'ring-2 ring-yellow-500 scale-105' : 'border-white/5 hover:border-white/20'} ${betType.color}`}>
              {betType.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/50 p-4 rounded-3xl border border-white/5 w-full max-w-lg">
        <div className="flex-grow w-full space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Wager Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
            <input type="number" min="1" max={balance} value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={spinning} className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-3 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-red-500/50" />
          </div>
        </div>
        <button onClick={spin} disabled={spinning || !selectedBet || balance < bet || bet <= 0} className="w-full sm:w-auto px-10 py-5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-red-600/30 uppercase tracking-widest text-sm self-end">{spinning ? 'SPINNING...' : 'SPIN WHEEL'}</button>
      </div>
      {message && <div className={`text-xl font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-300 ${message.includes('WINNER') ? 'text-green-400' : 'text-zinc-500'}`}>{message}</div>}
    </div>
  );
};
