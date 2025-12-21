
import React, { useState } from 'react';
import { Card } from '../types';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const VideoPoker: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [hand, setHand] = useState<Card[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [gameState, setGameState] = useState<'betting' | 'dealing' | 'result'>('betting');
  const [message, setMessage] = useState('');

  const createDeck = () => {
    const deck: Card[] = [];
    SUITS.forEach(s => VALUES.forEach(v => deck.push({ suit: s, value: v, rank: VALUES.indexOf(v) })));
    return deck.sort(() => Math.random() - 0.5);
  };

  const initialDeal = () => {
    if (balance < bet) return;
    updateBalance(-bet);
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
  };

  const evaluateHand = (h: Card[]) => {
    const counts: Record<string, number> = {};
    h.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
    const values = Object.values(counts);
    
    if (values.includes(4)) { updateBalance(bet * 25); setMessage('FOUR OF A KIND! +$' + bet * 25); }
    else if (values.includes(3) && values.includes(2)) { updateBalance(bet * 9); setMessage('FULL HOUSE! +$' + bet * 9); }
    else if (values.includes(3)) { updateBalance(bet * 3); setMessage('THREE OF A KIND! +$' + bet * 3); }
    else if (values.filter(v => v === 2).length === 2) { updateBalance(bet * 2); setMessage('TWO PAIR! +$' + bet * 2); }
    else if (values.includes(2)) {
      // Check for Jacks or Better
      const pairValue = Object.keys(counts).find(k => counts[k] === 2);
      if (['J', 'Q', 'K', 'A'].includes(pairValue!)) {
        updateBalance(bet);
        setMessage('JACKS OR BETTER! +$' + bet);
      } else {
        setMessage('NO PAIR');
      }
    }
    else setMessage('GAME OVER');
  };

  const toggleHold = (i: number) => {
    if (gameState !== 'dealing') return;
    const newHeld = [...held];
    newHeld[i] = !newHeld[i];
    setHeld(newHeld);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-2">
        {hand.length > 0 ? hand.map((c, i) => (
          <button 
            key={i} 
            onClick={() => toggleHold(i)}
            className={`relative flex flex-col items-center justify-center w-14 h-20 sm:w-24 sm:h-36 rounded-xl border-2 transition-all ${held[i] ? 'border-yellow-500 bg-white scale-105 shadow-yellow-500/20 shadow-xl' : 'border-zinc-700 bg-white'}`}
          >
            <span className={`text-xl font-bold ${['hearts', 'diamonds'].includes(c.suit) ? 'text-red-500' : 'text-black'}`}>{c.value}</span>
            <span className="text-3xl">{c.suit === 'hearts' ? '♥️' : c.suit === 'diamonds' ? '♦️' : c.suit === 'clubs' ? '♣️' : '♠️'}</span>
            {held[i] && <span className="absolute -top-3 bg-yellow-500 text-black text-[10px] px-2 font-black rounded-full uppercase">Held</span>}
          </button>
        )) : Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-14 h-20 sm:w-24 sm:h-36 rounded-xl border-2 border-zinc-800 bg-zinc-900/50" />
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        {gameState === 'betting' || gameState === 'result' ? (
          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900 rounded-xl p-1">
              {[10, 20, 50].map(v => (
                <button key={v} onClick={() => setBet(v)} className={`px-4 py-2 rounded-lg text-sm font-bold ${bet === v ? 'bg-rose-600 text-white' : 'text-zinc-500'}`}>${v}</button>
              ))}
            </div>
            <button onClick={initialDeal} className="px-10 py-3 bg-rose-600 text-white font-black rounded-xl">DEAL</button>
          </div>
        ) : (
          <button onClick={finalDraw} className="px-12 py-4 bg-yellow-500 text-black font-black rounded-xl uppercase tracking-widest">DRAW</button>
        )}
        {message && <div className="text-xl font-black text-white">{message}</div>}
      </div>
    </div>
  );
};
