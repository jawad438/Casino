
import React, { useState, useEffect } from 'react';
import { Card } from '../types';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const VideoPoker: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [gameState, setGameState] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [message, setMessage] = useState('');

  const createDeck = () => {
    const deck: Card[] = [];
    SUITS.forEach(s => VALUES.forEach(v => deck.push({ id: `${s}-${v}-${Math.random().toString(36).substring(2, 11)}`, suit: s, value: v, rank: VALUES.indexOf(v) })));
    return deck.sort(() => Math.random() - 0.5);
  };

  const initialDeal = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setLocked?.(true);
    const deck = createDeck();
    setHand(deck.slice(0, 5));
    setHeld([false, false, false, false, false]);
    setGameState('dealing');
    setMessage('SELECT CARDS TO HOLD');
  };

  const finalDraw = () => {
    const deck = createDeck().filter(c => !hand.some(h => h.suit === c.suit && h.value === c.value));
    const newHand = hand.map((c, i) => (held[i] ? c : deck.pop()!));
    setHand(newHand);
    setGameState('result');
    evaluateHand(newHand);
    setLocked?.(false);
  };

  const evaluateHand = (h: Card[]) => {
    const counts: Record<string, number> = {};
    h.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
    const values = Object.values(counts);
    if (values.includes(4)) { updateBalance(bet * 25); setMessage('FOUR OF A KIND! +$' + (bet * 25)); }
    else if (values.includes(3) && values.includes(2)) { updateBalance(bet * 9); setMessage('FULL HOUSE! +$' + (bet * 9)); }
    else if (values.includes(3)) { updateBalance(bet * 3); setMessage('THREE OF A KIND! +$' + (bet * 3)); }
    else if (values.filter(v => v === 2).length === 2) { updateBalance(bet * 2); setMessage('TWO PAIR! +$' + (bet * 2)); }
    else if (values.includes(2)) {
      const pairValue = Object.keys(counts).find(k => counts[k] === 2);
      if (['J', 'Q', 'K', 'A'].includes(pairValue!)) { updateBalance(bet); setMessage('JACKS OR BETTER! +$' + bet); }
      else { setMessage('NO PAIR'); }
    } else setMessage('GAME OVER');
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-2">
        {hand.length > 0 ? hand.map((c, i) => (
          <button key={i} onClick={() => gameState === 'dealing' && setHeld(prev => { const n = [...prev]; n[i] = !n[i]; return n; })} className={`relative flex flex-col items-center justify-center w-14 h-20 sm:w-24 sm:h-36 rounded-xl border-2 transition-all ${held[i] ? 'border-yellow-500 bg-white scale-105' : 'border-zinc-700 bg-white'}`}>
            <span className={`text-xl font-bold ${['hearts', 'diamonds'].includes(c.suit) ? 'text-red-500' : 'text-black'}`}>{c.value}</span>
            <span className="text-3xl">{c.suit === 'hearts' ? '♥️' : c.suit === 'diamonds' ? '♦️' : c.suit === 'clubs' ? '♣️' : '♠️'}</span>
            {held[i] && <span className="absolute -top-3 bg-yellow-500 text-black text-[10px] px-2 font-black rounded-full uppercase">Held</span>}
          </button>
        )) : Array.from({ length: 5 }).map((_, i) => (<div key={i} className="w-14 h-20 sm:w-24 sm:h-36 rounded-xl border-2 border-zinc-800 bg-zinc-900/50" />))}
      </div>
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {gameState === 'betting' || gameState === 'result' ? (
          <div className="w-full bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 space-y-4">
            <div className="space-y-2 text-center"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Wager</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span><input type="number" min="1" max={balance} value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold" /></div>
            </div>
            <button onClick={initialDeal} disabled={balance < bet || bet <= 0} className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl uppercase tracking-widest text-lg">DEAL CARDS</button>
          </div>
        ) : (
          <button onClick={finalDraw} className="w-full py-6 bg-yellow-500 text-black font-black rounded-2xl uppercase tracking-[0.2em] text-xl transition-all active:scale-95">DRAW NEW CARDS</button>
        )}
        {message && <div className="text-xl font-black text-white uppercase tracking-widest text-center">{message}</div>}
      </div>
    </div>
  );
};
