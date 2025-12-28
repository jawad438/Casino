
import React, { useState, useEffect } from 'react';

export const CoinFlip: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [side, setSide] = useState<'heads' | 'tails' | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [message, setMessage] = useState('');
  const [rotation, setRotation] = useState(0);

  const flip = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (!side || flipping || balance < validBet) return;
    
    updateBalance(-validBet);
    setFlipping(true);
    setLocked?.(true);
    setResult(null);
    setMessage('');

    const extraSpins = 12 + Math.floor(Math.random() * 4);
    const win = Math.random() < 0.5;
    const outcome = win ? side : (side === 'heads' ? 'tails' : 'heads');
    const targetBase = outcome === 'heads' ? 0 : 180;
    const newRotation = rotation + (extraSpins * 360) - (rotation % 360) + targetBase;
    setRotation(newRotation);

    setTimeout(() => {
      setResult(outcome);
      setFlipping(false);
      setLocked?.(false);
      if (win) {
        updateBalance(validBet * 2);
        setMessage('WINNER!');
      } else {
        setMessage('TRY AGAIN');
      }
    }, 2000);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 py-8">
      <div className="w-64 h-64 flex items-center justify-center" style={{ perspective: '1200px' }}>
        <div 
          className="relative w-56 h-56 transition-transform duration-[2000ms] cubic-bezier(0.15, 0, 0.15, 1)"
          style={{ transformStyle: 'preserve-3d', transform: `rotateY(${rotation}deg)` }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-500 to-amber-700 border-[8px] border-yellow-100 flex flex-col items-center justify-center overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
             <svg viewBox="0 0 24 24" className="w-32 h-32 fill-amber-950"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
             <div className="absolute bottom-6 font-black uppercase text-amber-950/60 text-[10px]">Heads</div>
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-100 via-slate-400 to-slate-700 border-[8px] border-slate-50 flex flex-col items-center justify-center overflow-hidden" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
             <div className="text-slate-950 font-black text-9xl">1</div>
             <div className="absolute bottom-6 font-black uppercase text-slate-900/60 text-[10px]">Tails</div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex gap-4">
           {(['heads', 'tails'] as const).map(s => (
             <button key={s} onClick={() => setSide(s)} disabled={flipping} className={`flex-1 py-5 rounded-3xl font-black uppercase tracking-widest border-2 transition-all ${side === s ? 'bg-yellow-500 border-yellow-300 text-amber-950 scale-105' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>
               <span className="text-3xl mb-1">{s === 'heads' ? '👤' : '1️⃣'}</span><span className="text-[10px]">{s}</span>
             </button>
           ))}
        </div>
        <div className="bg-zinc-950/50 p-6 rounded-[2.5rem] border border-white/10 space-y-4 shadow-xl">
          <div className="space-y-2 text-center"><label className="text-[10px] font-black uppercase text-zinc-500 block">Stake</label><input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={flipping} className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 text-center mono text-white font-black text-xl" /></div>
          <button onClick={flip} disabled={flipping || !side || balance < bet || bet <= 0} className="w-full py-5 bg-yellow-500 text-amber-950 font-black rounded-2xl uppercase tracking-[0.2em] transition-all active:scale-95">{flipping ? 'FLIPPING...' : 'FLIP COIN'}</button>
        </div>
        {message && <div className={`text-center font-black uppercase tracking-[0.3em] text-3xl animate-in zoom-in ${message.includes('WIN') ? 'text-yellow-400 text-neon' : 'text-zinc-500'}`}>{message}</div>}
      </div>
    </div>
  );
};
