
import React, { useState, useEffect, useRef } from 'react';

export const Pressure: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'exploded' | 'cashed'>('idle');
  const [payout, setPayout] = useState(0);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const failPointRef = useRef<number>(0);

  const start = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    
    // Generate fail point (House edge ~3%)
    failPointRef.current = Math.max(1.0, 0.97 / (1 - Math.random()));
    
    setGameState('running');
    setMultiplier(1.0);
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    const elapsed = (time - startTimeRef.current) / 1000;
    const currentMult = Math.pow(Math.E, 0.06 * elapsed * 10);

    if (currentMult >= failPointRef.current) {
      setMultiplier(failPointRef.current);
      setGameState('exploded');
      return;
    }

    setMultiplier(currentMult);
    requestRef.current = requestAnimationFrame(animate);
  };

  const cashout = () => {
    if (gameState !== 'running') return;
    cancelAnimationFrame(requestRef.current);
    const win = bet * multiplier;
    updateBalance(win);
    setPayout(win);
    setGameState('cashed');
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 py-6">
      <div className="relative w-72 h-72">
        {/* Steam Gauge Visual */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          <circle cx="100" cy="100" r="90" className="fill-zinc-900 stroke-zinc-700 stroke-[8]" />
          <circle cx="100" cy="100" r="82" className="fill-none stroke-zinc-800 stroke-[1]" />
          
          {/* Ticks */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line 
              key={i} 
              x1="100" y1="25" x2="100" y2="35" 
              className="stroke-zinc-600 stroke-2" 
              transform={`rotate(${i * 30}, 100, 100)`}
            />
          ))}

          {/* Warning Zone */}
          <path d="M 100 100 L 100 20 A 80 80 0 0 1 180 100 Z" className="fill-rose-500/20" transform="rotate(30, 100, 100)" />

          {/* Needle */}
          <g 
            className="transition-transform duration-75"
            style={{ 
              transformOrigin: '100px 100px', 
              transform: `rotate(${(Math.min(multiplier, 5) / 5) * 270 - 135}deg)` 
            }}
          >
            <path d="M100 100 L100 25" className={`stroke-rose-600 stroke-[4] ${gameState === 'running' ? 'animate-pulse' : ''}`} strokeLinecap="round" />
            <circle cx="100" cy="100" r="8" className="fill-zinc-700 stroke-zinc-900 stroke-2" />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={`text-6xl font-black mono tracking-tighter ${gameState === 'exploded' ? 'text-rose-500 scale-110' : 'text-white text-neon'}`}>
            {multiplier.toFixed(2)}x
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mt-2">PSI MULTIPLIER</div>
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6">
        {gameState === 'running' ? (
          <button
            onClick={cashout}
            className="w-full py-10 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-3xl shadow-2xl shadow-rose-600/30 uppercase tracking-[0.5em] text-4xl transition-all active:scale-95"
          >
            RELEASE
          </button>
        ) : (
          <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-xl">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-zinc-500 tracking-widest block text-center">Load Wager</label>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 text-center mono text-white font-black text-2xl focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
            <button
              onClick={start}
              disabled={balance < bet || bet <= 0}
              className="w-full py-6 bg-zinc-100 text-zinc-950 font-black rounded-2xl uppercase tracking-[0.3em] shadow-xl text-xl transition-all active:scale-95"
            >
              BUILD PRESSURE
            </button>
          </div>
        )}

        <div className="h-12 flex items-center justify-center">
          {gameState === 'exploded' && <div className="text-3xl font-black text-rose-600 uppercase tracking-widest animate-bounce">RUPTURED!</div>}
          {gameState === 'cashed' && <div className="text-3xl font-black text-emerald-400 uppercase tracking-widest animate-in zoom-in">SAVED: +${payout.toFixed(2)}</div>}
        </div>
      </div>
    </div>
  );
};
