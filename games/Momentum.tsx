
import React, { useState, useEffect, useRef } from 'react';

export const Momentum: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [duration, setDuration] = useState(5);
  const [prediction, setPrediction] = useState<'forward' | 'backward' | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'result'>('idle');
  const [velocity, setVelocity] = useState(0);
  const [position, setPosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState('');

  const requestRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const velRef = useRef<number>(0);
  const posRef = useRef<number>(0);

  const start = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (!prediction || balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setGameState('running');
    setLocked?.(true);
    setTimeLeft(duration);
    setMessage('');
    velRef.current = (Math.random() - 0.5) * 5; posRef.current = 0;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); cancelAnimationFrame(requestRef.current); finish(velRef.current, validBet); return 0; }
        return prev - 1;
      });
    }, 1000);
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = () => {
    velRef.current += (Math.random() - 0.5) * 0.8; velRef.current *= 0.98; posRef.current += velRef.current;
    if (Math.abs(posRef.current) > 100) { velRef.current *= -0.8; posRef.current = posRef.current > 0 ? 100 : -100; }
    setVelocity(velRef.current); setPosition(posRef.current);
    requestRef.current = requestAnimationFrame(animate);
  };

  const finish = (finalVel: number, stake: number) => {
    setGameState('result'); setLocked?.(false);
    const won = (prediction === 'forward' && finalVel > 0) || (prediction === 'backward' && finalVel < 0);
    if (won) { updateBalance(stake * 1.9); setMessage('MOMENTUM GAINED!'); }
    else { setMessage('FRICTION LOSS'); }
  };

  useEffect(() => {
    return () => { clearInterval(timerRef.current); cancelAnimationFrame(requestRef.current); setLocked?.(false); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-10 py-6">
      <div className="w-full max-w-2xl h-48 bg-zinc-950 rounded-[2.5rem] border border-cyan-500/20 relative overflow-hidden flex items-center shadow-inner">
        <div className="absolute left-10 right-10 h-[2px] bg-white/10" />
        <div className="absolute left-1/2 w-10 h-10 -ml-5 transition-all duration-75" style={{ transform: `translateX(${position * 2}px)` }}>
          <div className={`w-full h-full rounded-2xl shadow-2xl ${velocity > 0 ? 'bg-cyan-400' : 'bg-rose-500'} flex items-center justify-center`}><span className="text-xl">{velocity > 0 ? '▶' : '◀'}</span></div>
        </div>
        <div className="absolute top-4 right-8 text-right font-mono"><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Velocity Vector</div><div className={`text-2xl font-black ${velocity > 0 ? 'text-cyan-400' : 'text-rose-400'}`}>{velocity > 0 ? '+' : ''}{velocity.toFixed(2)}</div></div>
        <div className="absolute bottom-4 left-8 font-mono"><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Time Rem.</div><div className="text-xl text-white font-black">{timeLeft}s</div></div>
      </div>
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-4">
           <button onClick={() => setPrediction('forward')} disabled={gameState === 'running'} className={`py-6 rounded-2xl border-2 transition-all font-black uppercase text-[10px] flex flex-col items-center gap-1 ${prediction === 'forward' ? 'bg-cyan-500 border-cyan-300 text-zinc-950' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'}`}><span className="text-2xl">▶</span>Forward</button>
           <button onClick={() => setPrediction('backward')} disabled={gameState === 'running'} className={`py-6 rounded-2xl border-2 transition-all font-black uppercase text-[10px] flex flex-col items-center gap-1 ${prediction === 'backward' ? 'bg-rose-500 border-rose-300 text-zinc-950' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'}`}><span className="text-2xl">◀</span>Backward</button>
        </div>
        <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
          <div className="space-y-4 text-center"><label className="text-[10px] font-black uppercase text-zinc-500 block">Initial Thrust (Stake)</label><input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={gameState === 'running'} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 text-center mono text-white font-bold" /></div>
          <button onClick={start} disabled={gameState === 'running' || !prediction || balance < bet || bet <= 0} className="w-full py-5 bg-white text-zinc-950 font-black rounded-2xl uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50">{gameState === 'running' ? 'ACCELERATING...' : 'ENGAGE THRUSTERS'}</button>
        </div>
        {message && <div className={`text-center font-black uppercase tracking-[0.3em] text-2xl animate-in zoom-in ${message.includes('GAINED') ? 'text-cyan-400' : 'text-zinc-600'}`}>{message}</div>}
      </div>
    </div>
  );
};
