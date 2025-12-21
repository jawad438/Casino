
import React, { useState, useEffect, useRef } from 'react';

export const Crash: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState<'idle' | 'running' | 'crashed' | 'cashedOut'>('idle');
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashoutAmount, setCashoutAmount] = useState(0);

  // Initialize useRef with 0 to satisfy type requirements and provide a stable handle for animation frames
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const startGame = () => {
    if (balance < bet) return;
    updateBalance(-bet);
    const point = 1 + Math.random() * Math.random() * 10; // Simple weighted curve
    setCrashPoint(point);
    setMultiplier(1.0);
    setStatus('running');
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time: number) => {
    const elapsed = (time - startTimeRef.current) / 1000;
    const currentMult = Math.pow(1.08, elapsed * 10);
    
    if (currentMult >= crashPoint) {
      setMultiplier(crashPoint);
      setStatus('crashed');
      cancelAnimationFrame(requestRef.current!);
    } else {
      setMultiplier(currentMult);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const cashOut = () => {
    if (status !== 'running') return;
    cancelAnimationFrame(requestRef.current!);
    const win = bet * multiplier;
    updateBalance(win);
    setCashoutAmount(win);
    setStatus('cashedOut');
  };

  useEffect(() => {
    // Safely cleanup the animation frame on unmount
    return () => {
      if (requestRef.current !== 0) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="relative w-full h-48 bg-zinc-950 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-20" />
        <div className={`text-7xl sm:text-9xl font-black mono transition-colors ${status === 'crashed' ? 'text-red-500' : status === 'cashedOut' ? 'text-green-400' : 'text-white'}`}>
          {multiplier.toFixed(2)}x
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full">
        {status === 'idle' || status === 'crashed' || status === 'cashedOut' ? (
          <div className="flex items-center gap-4 w-full justify-center">
            <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
              {[10, 50, 100].map(v => (
                <button key={v} onClick={() => setBet(v)} className={`px-4 py-2 rounded-lg text-sm font-bold ${bet === v ? 'bg-purple-600 text-white' : 'text-zinc-500'}`}>${v}</button>
              ))}
            </div>
            <button
              onClick={startGame}
              disabled={balance < bet}
              className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-lg shadow-purple-600/30 uppercase tracking-widest"
            >
              LAUNCH
            </button>
          </div>
        ) : (
          <button
            onClick={cashOut}
            className="w-full max-w-sm py-6 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl shadow-lg shadow-green-500/30 uppercase tracking-[0.2em] text-2xl"
          >
            CASH OUT (${(bet * multiplier).toFixed(2)})
          </button>
        )}
        
        {status === 'crashed' && <div className="text-xl font-bold text-red-400">CRASHED AT {multiplier.toFixed(2)}x</div>}
        {status === 'cashedOut' && <div className="text-xl font-bold text-green-400">YOU WON ${cashoutAmount.toFixed(2)}!</div>}
      </div>
    </div>
  );
};
