
import React, { useState, useEffect, useRef } from 'react';

export const Crash: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState<'idle' | 'running' | 'crashed' | 'cashedOut'>('idle');
  const [cashoutAmount, setCashoutAmount] = useState(0);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);
  const betRef = useRef<number>(10);

  const GROWTH_SPEED = 0.07;

  const startGame = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    
    updateBalance(-validBet);
    betRef.current = validBet;
    
    const random = Math.random();
    crashPointRef.current = Math.max(1.00, 0.98 / (1 - random));
    
    setMultiplier(1.0);
    setStatus('running');
    setLocked?.(true);
    runningRef.current = true;
    
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    if (!runningRef.current) return;
    const elapsed = (time - startTimeRef.current) / 1000;
    const currentMult = Math.pow(Math.E, GROWTH_SPEED * elapsed * 10);
    
    if (currentMult >= crashPointRef.current) {
      setMultiplier(crashPointRef.current);
      runningRef.current = false;
      setStatus('crashed');
      setLocked?.(false);
      return;
    }

    setMultiplier(currentMult);
    requestRef.current = requestAnimationFrame(animate);
  };

  const cashOut = () => {
    if (!runningRef.current || status !== 'running') return;
    runningRef.current = false;
    const currentMultiplier = multiplier;
    const win = betRef.current * currentMultiplier;
    updateBalance(win);
    setCashoutAmount(win);
    setStatus('cashedOut');
    setLocked?.(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (requestRef.current !== 0) cancelAnimationFrame(requestRef.current);
      setLocked?.(false);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative w-full h-64 bg-zinc-950 rounded-[3rem] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-fuchsia-600 opacity-0 transition-opacity duration-700" style={{ opacity: status === 'running' ? Math.min(0.4, (multiplier - 1) * 0.05) : 0, background: status === 'crashed' ? 'rgba(239, 68, 68, 0.1)' : undefined }} />
        {status === 'running' && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-[-10%] w-[120%] h-[1px] bg-white animate-pulse" />
            <div className="absolute top-2/4 left-[-10%] w-[120%] h-[1px] bg-white animate-pulse delay-75" />
            <div className="absolute top-3/4 left-[-10%] w-[120%] h-[1px] bg-white animate-pulse delay-150" />
          </div>
        )}
        <div className={`text-8xl sm:text-9xl font-black mono transition-all z-10 select-none ${status === 'crashed' ? 'text-red-500 scale-95' : status === 'cashedOut' ? 'text-emerald-400' : 'text-white text-neon'}`}>{multiplier.toFixed(2)}x</div>
      </div>
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {status !== 'running' ? (
          <div className="w-full space-y-4 bg-zinc-900/80 p-8 rounded-[2.5rem] border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="space-y-2 text-center"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block">Stake Amount</label>
              <div className="relative"><span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span><input type="number" min="1" max={balance} value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 pl-10 pr-4 mono text-white font-bold text-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-500/30 transition-all" /></div>
            </div>
            <button onClick={startGame} disabled={balance < bet || bet <= 0} className="w-full py-6 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-fuchsia-600/30 uppercase tracking-[0.2em] text-xl transition-all active:scale-95">LAUNCH MISSION</button>
          </div>
        ) : (
          <button onClick={cashOut} className="w-full py-8 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-[2rem] shadow-2xl shadow-emerald-500/30 uppercase tracking-[0.3em] text-4xl transition-all active:scale-95">CASH OUT<div className="text-xs opacity-70 mt-1 font-bold">WORTH: ${(betRef.current * multiplier).toFixed(2)}</div></button>
        )}
        <div className="h-12 flex items-center justify-center">
          {status === 'crashed' && <div className="text-2xl font-black text-red-500 uppercase tracking-widest text-neon animate-in zoom-in duration-300">CRASHED @ {multiplier.toFixed(2)}x</div>}
          {status === 'cashedOut' && <div className="text-2xl font-black text-emerald-400 uppercase tracking-widest text-neon animate-bounce">PROFIT: +${(cashoutAmount - betRef.current).toFixed(2)}</div>}
        </div>
      </div>
    </div>
  );
};
