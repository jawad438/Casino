
import React, { useState, useEffect } from 'react';
import { Card } from '../types';

const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

const getRandomCard = (): Card => {
  const v = VALUES[Math.floor(Math.random() * VALUES.length)];
  const s = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { id: Math.random().toString(), suit: s, value: v, rank: VALUES.indexOf(v) };
};

export const Hilo: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [currentCard, setCurrentCard] = useState<Card>(getRandomCard());
  const [status, setStatus] = useState<'betting' | 'playing' | 'gameOver'>('betting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [message, setMessage] = useState('');

  const start = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setLocked?.(true);
    setCurrentCard(getRandomCard());
    setMultiplier(1.0);
    setStatus('playing');
    setMessage('');
  };

  const predict = (prediction: 'high' | 'low') => {
    const nextCard = getRandomCard();
    let win = prediction === 'high' ? nextCard.rank >= currentCard.rank : nextCard.rank <= currentCard.rank;
    if (win) {
      const chance = prediction === 'high' ? (VALUES.length - currentCard.rank) / VALUES.length : (currentCard.rank + 1) / VALUES.length;
      setMultiplier(prev => prev * (0.98 / chance)); setCurrentCard(nextCard); setMessage('CORRECT!');
    } else {
      setStatus('gameOver'); setLocked?.(false); setMessage('WRONG PREDICTION'); setCurrentCard(nextCard);
    }
  };

  const cashout = () => {
    updateBalance(bet * multiplier); setStatus('betting'); setLocked?.(false); setMessage(`CASHED OUT $${(bet * multiplier).toFixed(2)}`); setMultiplier(1.0);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4">
        <div className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Current Card</div>
        <div className="w-28 h-40 bg-white rounded-2xl flex flex-col items-center justify-center border-4 border-zinc-200 shadow-2xl">
           <span className={`text-2xl font-black ${['hearts', 'diamonds'].includes(currentCard.suit) ? 'text-red-500' : 'text-zinc-900'}`}>{currentCard.value}</span>
           <span className="text-5xl">{currentCard.suit === 'hearts' ? '♥️' : currentCard.suit === 'diamonds' ? '♦️' : currentCard.suit === 'clubs' ? '♣️' : '♠️'}</span>
        </div>
      </div>
      <div className="w-full max-w-sm flex flex-col gap-6">
        {status === 'playing' ? (
          <>
            <div className="flex gap-4"><button onClick={() => predict('high')} className="flex-1 py-6 bg-zinc-800 rounded-2xl border border-white/10 text-xl font-black text-white">HI OR SAME</button><button onClick={() => predict('low')} className="flex-1 py-6 bg-zinc-800 rounded-2xl border border-white/10 text-xl font-black text-white">LO OR SAME</button></div>
            <div className="bg-zinc-950 p-6 rounded-[2rem] flex flex-col items-center"><div className="text-4xl font-black text-emerald-400 text-neon">{multiplier.toFixed(2)}x</div><div className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-widest">Worth: ${(bet * multiplier).toFixed(2)}</div><button onClick={cashout} className="mt-6 w-full py-4 bg-emerald-500 text-zinc-950 font-black rounded-xl hover:bg-emerald-400 transition-all">CASHOUT</button></div>
          </>
        ) : (
          <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
            <div className="space-y-2 text-center"><label className="text-xs font-black uppercase text-zinc-500 block tracking-widest">Bet</label><input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 text-center mono text-white font-bold" /></div>
            <button onClick={start} disabled={balance < bet || bet <= 0} className="w-full py-5 bg-purple-600 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest">PLAY HI-LO</button>
          </div>
        )}
        {message && <div className={`text-center font-black uppercase tracking-widest animate-in zoom-in ${message.includes('CORRECT') ? 'text-emerald-400' : 'text-zinc-600'}`}>{message}</div>}
      </div>
    </div>
  );
};
