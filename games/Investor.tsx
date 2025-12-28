
import React, { useState, useEffect, useRef } from 'react';

export const Investor: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [duration, setDuration] = useState(10); // seconds
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'result'>('idle');
  const [prices, setPrices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState('');

  const timerRef = useRef<number>(0);
  const priceIntervalRef = useRef<number>(0);

  const startTrade = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (!direction || balance < validBet || validBet <= 0) return;

    updateBalance(-validBet);
    setGameState('running');
    setLocked?.(true);
    setTimeLeft(duration);
    setMessage('');

    const startPrice = 100.00;
    const initialPrices = [startPrice];
    setPrices(initialPrices);

    let currentPrice = startPrice;
    let ticks = 0;
    let currentTrend = (Math.random() - 0.5) * 0.15;

    priceIntervalRef.current = window.setInterval(() => {
      ticks++;
      
      if (ticks % 15 === 0) {
        if (Math.random() < 0.45) {
          currentTrend = -currentTrend * (0.8 + Math.random() * 0.4);
        } else {
          currentTrend += (Math.random() - 0.5) * 0.2;
        }
        currentTrend = Math.max(-0.4, Math.min(0.4, currentTrend));
      }

      const volatility = 0.5;
      const change = currentTrend + (Math.random() - 0.5) * volatility;
      
      currentPrice = Math.max(5, currentPrice + change);
      setPrices(prev => [...prev, currentPrice].slice(-60));
    }, 100);

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(priceIntervalRef.current);
          finishTrade(startPrice, currentPrice, validBet);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishTrade = (startPrice: number, endPrice: number, stake: number) => {
    setGameState('result');
    setLocked?.(false);
    const won = direction === 'up' ? endPrice > startPrice : endPrice < startPrice;
    
    if (won) {
      const payout = stake * 1.85;
      updateBalance(payout);
      setMessage(`PROFIT! $${payout.toFixed(2)}`);
    } else {
      setMessage('POSITION LIQUIDATED');
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(priceIntervalRef.current);
      setLocked?.(false);
    };
  }, []);

  const currentPrice = prices[prices.length - 1] || 100;
  const entryPrice = prices[0] || 100;
  const isUp = currentPrice >= entryPrice;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full bg-zinc-950 rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden h-64 flex items-end">
        <div className="absolute inset-0 flex items-end px-2 pb-4 opacity-50">
          <div className="flex items-end gap-[1px] w-full h-full">
            {prices.map((p, i) => (
              <div 
                key={i} 
                className={`flex-grow transition-all duration-300 ${p > (prices[i-1] || p) ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ height: `${(p / 250) * 100}%` }}
              />
            ))}
          </div>
        </div>
        
        <div className="absolute top-6 left-6 z-10">
          <div className={`text-4xl font-black mono tracking-tighter drop-shadow-lg ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${currentPrice.toFixed(2)}
            <span className="text-xs ml-2 opacity-50 uppercase tracking-widest">{isUp ? '▲' : '▼'} Live</span>
          </div>
          {gameState === 'running' && (
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Order: <span className={direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}>{direction}</span> • {timeLeft}s Left
            </div>
          )}
        </div>

        {gameState === 'running' && (
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-white/30 z-0 pointer-events-none" 
            style={{ bottom: `${(entryPrice / 250) * 100}%` }}
          >
            <span className="absolute right-2 -top-4 text-[8px] font-bold text-white/40 uppercase">Entry: $100.00</span>
          </div>
        )}
      </div>

      <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-inner">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] block text-center">Duration</label>
            <div className="flex gap-2">
              {[10, 30, 60].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  disabled={gameState === 'running'}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${duration === d ? 'bg-zinc-700 text-white border-white/20' : 'bg-zinc-950 text-zinc-600'}`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] block text-center">Wager</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={gameState === 'running'}
              className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 text-center mono text-white font-bold focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setDirection('up')}
            disabled={gameState === 'running'}
            className={`flex-1 py-6 rounded-2xl font-black text-xl transition-all shadow-lg ${direction === 'up' ? 'bg-emerald-500 text-zinc-950 scale-105 shadow-emerald-500/20' : 'bg-zinc-900 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10'}`}
          >
            CALL (UP)
          </button>
          <button
            onClick={() => setDirection('down')}
            disabled={gameState === 'running'}
            className={`flex-1 py-6 rounded-2xl font-black text-xl transition-all shadow-lg ${direction === 'down' ? 'bg-rose-500 text-zinc-950 scale-105 shadow-rose-500/20' : 'bg-zinc-900 text-rose-500 border border-rose-500/20 hover:bg-rose-500/10'}`}
          >
            PUT (DOWN)
          </button>
        </div>
      </div>

      <button
        onClick={startTrade}
        disabled={gameState === 'running' || !direction || balance < bet || bet <= 0}
        className="w-full max-w-lg py-6 bg-zinc-100 hover:bg-white text-zinc-950 font-black rounded-2xl uppercase tracking-[0.3em] shadow-xl text-xl transition-all active:scale-95 disabled:opacity-50"
      >
        {gameState === 'running' ? 'EXECUTING TRADE...' : 'OPEN POSITION'}
      </button>

      {message && (
        <div className={`text-2xl font-black uppercase tracking-widest animate-in zoom-in ${message.includes('PROFIT') ? 'text-emerald-400 text-neon' : 'text-zinc-600'}`}>
          {message}
        </div>
      )}
    </div>
  );
};
