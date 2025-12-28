
import React, { useState, useEffect } from 'react';

export const Echo: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<'idle' | 'seeding' | 'echoing' | 'result'>('idle');
  const [prediction, setPrediction] = useState<'faithful' | 'drift' | null>(null);
  const [pulses, setPulses] = useState<number[]>([]);
  const [message, setMessage] = useState('');

  const play = async () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (!prediction || balance < validBet || validBet <= 0) return;

    updateBalance(-validBet);
    setGameState('seeding');
    setMessage('');
    setPulses([]);

    // Play initial "Seed" pulses
    const seed = Array.from({ length: 3 }, () => Math.random() * 100);
    for (const s of seed) {
      setPulses(prev => [...prev, s]);
      await new Promise(r => setTimeout(r, 400));
    }

    setGameState('echoing');
    await new Promise(r => setTimeout(r, 600));

    // Generate Echo sequence
    const echoDrift = Math.random() < 0.5; // True outcome
    const newPulses = [...seed];
    
    for (let i = 0; i < 5; i++) {
      const last = newPulses[newPulses.length - 1];
      const variance = echoDrift ? (Math.random() * 40 - 20) : (Math.random() * 10 - 5);
      newPulses.push(Math.max(10, Math.min(90, last + variance)));
      setPulses([...newPulses]);
      await new Promise(r => setTimeout(r, 300));
    }

    const won = (prediction === 'faithful' && !echoDrift) || (prediction === 'drift' && echoDrift);
    setGameState('result');
    
    if (won) {
      const payout = validBet * 1.9;
      updateBalance(payout);
      setMessage(`HARMONY! +$${payout.toFixed(2)}`);
    } else {
      setMessage('DISSONANCE');
    }
  };

  return (
    <div className="flex flex-col items-center gap-12 py-8">
      <div className="w-full max-w-lg h-64 bg-zinc-950/50 rounded-[3rem] border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
        {/* Pulsing Nodes */}
        <div className="flex items-center gap-6">
          {pulses.map((p, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-500 shadow-lg ${gameState === 'result' ? (message.includes('HARMONY') ? 'bg-cyan-400 shadow-cyan-400/40' : 'bg-rose-400 shadow-rose-400/40') : 'bg-white shadow-white/20'}`}
              style={{ 
                transform: `scale(${1 + p / 100})`,
                opacity: 0.3 + p / 100 
              }}
            />
          ))}
          {pulses.length === 0 && <div className="text-zinc-700 font-black uppercase tracking-[0.5em] text-xs">Waiting for seed</div>}
        </div>

        {/* Ethereal background rings */}
        <div className="absolute inset-0 border-[40px] border-white/5 rounded-full animate-pulse scale-150" />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPrediction('faithful')}
            disabled={gameState !== 'idle' && gameState !== 'result'}
            className={`py-6 rounded-2xl border-2 transition-all font-black uppercase tracking-widest ${prediction === 'faithful' ? 'bg-cyan-500 border-cyan-300 text-zinc-950 shadow-xl' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
          >
            FAITHFUL
          </button>
          <button
            onClick={() => setPrediction('drift')}
            disabled={gameState !== 'idle' && gameState !== 'result'}
            className={`py-6 rounded-2xl border-2 transition-all font-black uppercase tracking-widest ${prediction === 'drift' ? 'bg-zinc-400 border-white text-zinc-950 shadow-xl' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
          >
            DRIFT
          </button>
        </div>

        <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/10 space-y-4 shadow-xl">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block text-center">Concentration (Stake)</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={gameState !== 'idle' && gameState !== 'result'}
              className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 text-center mono text-white font-bold focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <button
            onClick={play}
            disabled={(gameState !== 'idle' && gameState !== 'result') || !prediction || balance < bet || bet <= 0}
            className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-600/30 uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50"
          >
            {gameState === 'seeding' ? 'SEEDING...' : gameState === 'echoing' ? 'WATCHING...' : 'BEGIN ECHO'}
          </button>
        </div>

        {message && <div className={`text-center font-black uppercase tracking-[0.3em] text-2xl animate-in zoom-in ${message.includes('HARMONY') ? 'text-cyan-400 text-neon' : 'text-zinc-600'}`}>{message}</div>}
      </div>
    </div>
  );
};
