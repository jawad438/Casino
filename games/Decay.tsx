
import React, { useState, useEffect, useRef } from 'react';

export const Decay: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [integrity, setIntegrity] = useState(100);
  const [duration, setDuration] = useState(10);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'failed' | 'survived'>('idle');
  const [message, setMessage] = useState('');
  const [isHealing, setIsHealing] = useState(false);

  const intervalRef = useRef<number>(0);

  const startMission = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setGameState('running');
    setLocked?.(true);
    setIntegrity(100); setMessage('');
    let currentIntegrity = 100; let ticks = 0; const totalTicks = duration * 10;
    intervalRef.current = window.setInterval(() => {
      ticks++;
      const damage = Math.random() < 0.2 ? Math.random() * 8 : 0;
      const healingChance = Math.random() < 0.12; const heal = healingChance ? Math.random() * 5 : 0;
      if (healingChance) { setIsHealing(true); setTimeout(() => setIsHealing(false), 200); }
      currentIntegrity = Math.min(100, Math.max(0, currentIntegrity - damage + heal));
      setIntegrity(currentIntegrity);
      if (currentIntegrity <= 0) { clearInterval(intervalRef.current); setGameState('failed'); setLocked?.(false); setMessage('SYSTEM COLLAPSE'); }
      else if (ticks >= totalTicks) { clearInterval(intervalRef.current); setGameState('survived'); setLocked?.(false); updateBalance(validBet * (1 + (duration * 0.12))); setMessage('STABLE'); }
    }, 100);
  };

  useEffect(() => {
    return () => { clearInterval(intervalRef.current); setLocked?.(false); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 py-8 font-mono">
      <div className="w-full max-w-xl bg-[#0a0f0a] border-4 border-[#1a2e1a] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between mb-8 border-b border-[#1a2e1a] pb-4"><div className={`text-[#22c55e] text-xs font-bold uppercase tracking-widest ${isHealing ? 'text-white' : ''}`}>{isHealing ? '>> REPAIR <<' : 'CORE STATUS: NOMINAL'}</div><div className="text-[#22c55e] text-xs font-bold uppercase tracking-widest">Integrity Check</div></div>
        <div className="flex flex-col items-center gap-6 py-10"><div className={`text-6xl sm:text-8xl font-black ${isHealing ? 'text-white' : 'text-[#22c55e]'}`}>{integrity.toFixed(1)}%</div><div className="w-full bg-[#1a2e1a] h-4 rounded-full"><div className={`h-full transition-all duration-300 ${isHealing ? 'bg-white' : 'bg-[#22c55e]'}`} style={{ width: `${integrity}%` }} /></div></div>
      </div>
      <div className="w-full max-w-sm space-y-8">
        <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
          <div className="space-y-4 text-center"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block">Mission Time</label><div className="grid grid-cols-3 gap-2">{[10, 20, 30].map(d => (<button key={d} onClick={() => setDuration(d)} disabled={gameState === 'running'} className={`py-3 rounded-xl text-xs font-bold border ${duration === d ? 'border-emerald-500 text-emerald-400' : 'text-zinc-600'}`}>{d}s</button>))}</div></div>
          <div className="space-y-2 text-center"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block">Fuel (Stake)</label><input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={gameState === 'running'} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 text-center text-emerald-400 font-bold" /></div>
          <button onClick={startMission} disabled={gameState === 'running' || balance < bet || bet <= 0} className="w-full py-6 bg-emerald-600 text-zinc-950 font-black rounded-2xl uppercase tracking-widest text-xl">{gameState === 'running' ? 'RUNNING...' : 'INITIALIZE'}</button>
        </div>
        {message && <div className={`text-center font-black uppercase tracking-widest text-2xl animate-in zoom-in ${message.includes('STABLE') ? 'text-emerald-400' : 'text-rose-500'}`}>{message}</div>}
      </div>
    </div>
  );
};
