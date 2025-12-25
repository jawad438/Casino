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
    
    // Multiplier growth
    const currentMult = Math.pow(1.08, elapsed * 10);
    multRef.current = currentMult;
    setMultiplier(currentMult);

    // To hit 45% crash chance per second (10 ticks):
    // (1-p)^10 = 0.55 => 1-p = 0.9416 => p = 0.0584
    if (time - lastTickRef.current >= 100) {
      lastTickRef.current = time;
      if (Math.random() < 0.0584) {
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
      <div className="relative w-full h-56 bg-zinc-950 rounded-[2.5rem] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
        <div 
          className="absolute inset-0 bg-fuchsia-600 opacity-0 transition-opacity duration-1000"
          style={{ opacity: status === 'running' ? Math.min(0.3, (multiplier - 1) * 0.1) : 0 }}
        />
        
        <div className={`absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-fuchsia-500 to-transparent opacity-40 transition-all duration-100 ${status === 'running' ? 'scale-x-100' : 'scale-x-0'}`} />
        
        <div className={`text-8xl sm:text-9xl font-black mono transition-colors z-10 ${status === 'crashed' ? 'text-red-500' : status === 'cashedOut' ? 'text-emerald-400' : 'text-white text-neon'}`}>
          {multiplier.toFixed(2)}x
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {status !== 'running' ? (
          <div className="w-full space-y-4 bg-zinc-900/80 p-8 rounded-[2.5rem] border border-white/10 shadow-xl">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 block text-center">Stake Amount</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  max={balance}
                  value={bet}
                  onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 pl-10 pr-4 mono text-white font-bold text-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-500/30 transition-all"
                />
              </div>
            </div>
            <button
              onClick={startGame}
              disabled={balance < bet || bet <= 0}
              className="w-full py-6 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-fuchsia-600/30 uppercase tracking-[0.2em] text-xl transition-all active:scale-95"
            >
              LAUNCH MISSION
            </button>
          </div>
        ) : (
          <button
            onClick={cashOut}
            className="w-full py-8 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-[2rem] shadow-2xl shadow-emerald-500/30 uppercase tracking-[0.3em] text-4xl transition-all active:scale-95"
          >
            CASH OUT
          </button>
        )}
        
        <div className="h-10">
          {status === 'crashed' && <div className="text-2xl font-black text-red-500 uppercase tracking-widest text-neon">CRASHED @ {multiplier.toFixed(2)}x</div>}
          {status === 'cashedOut' && <div className="text-2xl font-black text-emerald-400 uppercase tracking-widest text-neon animate-bounce">PROFIT: +${(cashoutAmount - betRef.current).toFixed(2)}</div>}
        </div>
      </div>
      
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center opacity-50">45% CRASH RISK PER SECOND • VOLATILE FLIGHT SYSTEM</p>
    </div>
  );
};