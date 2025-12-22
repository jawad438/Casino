
import React, { useState, useEffect, useRef } from 'react';

export const Crash: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState<'idle' | 'running' | 'crashed' | 'cashedOut'>('idle');
  const [cashoutAmount, setCashoutAmount] = useState(0);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);
  const betRef = useRef<number>(10);
  const multRef = useRef<number>(1.0);

  const startGame = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    
    updateBalance(-validBet);
    betRef.current = validBet;
    multRef.current = 1.0;
    setMultiplier(1.0);
    setStatus('running');
    runningRef.current = true;
    
    const now = performance.now();
    startTimeRef.current = now;
    lastTickRef.current = now;
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    if (!runningRef.current) return;

    const elapsed = (time - startTimeRef.current) / 1000;
    
    // Multiplier growth: 1.08x every 0.1s (approx 8% increase per tick)
    const currentMult = Math.pow(1.08, elapsed * 10);
    multRef.current = currentMult;
    setMultiplier(currentMult);

    // Every 0.1 seconds (100ms), there's a 5% chance of crashing
    if (time - lastTickRef.current >= 100) {
      lastTickRef.current = time;
      if (Math.random() < 0.05) {
        runningRef.current = false;
        setStatus('crashed');
        return;
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  const cashOut = () => {
    if (!runningRef.current || status !== 'running') return;
    
    runningRef.current = false;
    const win = betRef.current * multRef.current;
    updateBalance(win);
    setCashoutAmount(win);
    setStatus('cashedOut');
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (requestRef.current !== 0) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative w-full h-48 bg-zinc-950 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden">
        {/* Glow effect that builds as multiplier increases */}
        <div 
          className="absolute inset-0 bg-purple-500 opacity-0 transition-opacity duration-1000"
          style={{ opacity: status === 'running' ? Math.min(0.2, (multiplier - 1) * 0.05) : 0 }}
        />
        
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-20 transition-all duration-100 ${status === 'running' ? 'scale-x-100' : 'scale-x-0'}`} />
        
        <div className={`text-7xl sm:text-9xl font-black mono transition-colors z-10 ${status === 'crashed' ? 'text-red-500' : status === 'cashedOut' ? 'text-green-400' : 'text-white'}`}>
          {multiplier.toFixed(2)}x
        </div>
        
        {status === 'running' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="w-full h-px bg-white/20 animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {status !== 'running' ? (
          <div className="w-full space-y-4 bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5">
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
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[10, 50, 100].map(v => (
                <button
                  key={v}
                  onClick={() => setBet(v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${bet === v ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                >
                  ${v}
                </button>
              ))}
            </div>
            <button
              onClick={startGame}
              disabled={balance < bet || bet <= 0}
              className="w-full py-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-purple-600/30 uppercase tracking-widest text-lg transition-transform active:scale-95"
            >
              LAUNCH ROCKET
            </button>
          </div>
        ) : (
          <button
            onClick={cashOut}
            className="w-full max-w-sm py-8 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl shadow-lg shadow-green-500/30 uppercase tracking-[0.2em] text-3xl transition-transform active:scale-95"
          >
            CASH OUT (${(betRef.current * multiplier).toFixed(2)})
          </button>
        )}
        
        <div className="h-8 flex items-center justify-center">
          {status === 'crashed' && (
            <div className="text-xl font-bold text-red-400 uppercase tracking-widest animate-pulse">
              CRASHED AT {multiplier.toFixed(2)}x
            </div>
          )}
          {status === 'cashedOut' && (
            <div className="text-xl font-bold text-green-400 uppercase tracking-widest animate-in fade-in zoom-in">
              PROFIT: +${(cashoutAmount - betRef.current).toFixed(2)}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.1em] text-center max-w-xs">
        System: 5% crash risk per 0.1s. Multiplier increases exponentially with flight time.
      </div>
    </div>
  );
};
