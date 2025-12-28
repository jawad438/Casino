
import React, { useState, useEffect, useRef } from 'react';

export const Crowd: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [prediction, setPrediction] = useState<'authoritarian' | 'libertarian' | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'simulating' | 'result'>('idle');
  const [sentiment, setSentiment] = useState(50);
  const [message, setMessage] = useState('');

  const intervalRef = useRef<number>(0);

  const start = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (!prediction || balance < validBet || validBet <= 0) return;
    
    updateBalance(-validBet);
    setGameState('simulating');
    setLocked?.(true);
    setMessage('');
    
    let currentSentiment = 50;
    setSentiment(50);
    let ticks = 0;
    const maxTicks = 50;

    intervalRef.current = window.setInterval(() => {
      ticks++;
      const drift = (Math.random() - 0.5) * 6;
      currentSentiment = Math.max(5, Math.min(95, currentSentiment + drift));
      setSentiment(currentSentiment);

      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current);
        finish(currentSentiment, validBet);
      }
    }, 80);
  };

  const finish = (finalSentiment: number, stake: number) => {
    setGameState('result');
    setLocked?.(false);
    
    const won = (prediction === 'authoritarian' && finalSentiment > 50) || (prediction === 'libertarian' && finalSentiment < 50);
    
    if (won) {
      const payout = stake * 1.95;
      updateBalance(payout);
      setMessage(prediction === 'authoritarian' ? 'AUTHORITARIAN DOMINANCE' : 'LIBERTARIAN VICTORY');
    } else {
      setMessage('OPPOSITION SUPPRESSED');
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      setLocked?.(false);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 py-8">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex justify-between items-end px-2">
          <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Far Libertarian</div>
          <div className="text-2xl font-black text-white italic tracking-tighter">SENTIMENT SPECTRUM</div>
          <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest text-right">Far Authoritarian</div>
        </div>

        <div className="relative h-24 bg-zinc-950 rounded-[2rem] border border-white/5 p-2 overflow-hidden shadow-2xl">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-600 via-zinc-800 to-emerald-600 transition-all duration-300"
            style={{ width: '100%' }}
          />
          <div className="absolute inset-0 bg-zinc-950 opacity-80" />
          
          <div 
            className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_20px_white] z-10 transition-all duration-200"
            style={{ left: `${sentiment}%`, transform: 'translateX(-50%)' }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-white opacity-20 mono">{sentiment.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPrediction('libertarian')}
            disabled={gameState === 'simulating'}
            className={`py-6 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs flex flex-col items-center gap-2 ${prediction === 'libertarian' ? 'bg-rose-600 border-rose-400 text-white shadow-xl shadow-rose-600/20' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'}`}
          >
            <span className="text-2xl">⚖️</span>
            LIBERTARIAN
          </button>
          <button
            onClick={() => setPrediction('authoritarian')}
            disabled={gameState === 'simulating'}
            className={`py-6 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs flex flex-col items-center gap-2 ${prediction === 'authoritarian' ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/20' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'}`}
          >
            <span className="text-2xl">✊</span>
            AUTHORITARIAN
          </button>
        </div>

        <div className="bg-zinc-950/50 p-8 rounded-[2.5rem] border border-white/10 space-y-4 shadow-xl">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block text-center">Stake Political Capital</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={gameState === 'simulating'}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 text-center mono text-white font-bold focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <button
            onClick={start}
            disabled={gameState === 'simulating' || !prediction || balance < bet || bet <= 0}
            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-50"
          >
            {gameState === 'simulating' ? 'POLLING...' : 'CAST VOTE'}
          </button>
        </div>

        {message && <div className={`text-center font-black uppercase tracking-[0.2em] text-2xl animate-in zoom-in ${message.includes('DOMINANCE') || message.includes('VICTORY') ? 'text-emerald-400 text-neon' : 'text-zinc-600'}`}>{message}</div>}
      </div>
    </div>
  );
};
