import React, { useState, useEffect } from 'react';
import { Card } from '../types';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      let rank = parseInt(value);
      if (['J', 'Q', 'K'].includes(value)) rank = 10;
      if (value === 'A') rank = 11;
      deck.push({ suit, value, rank });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calculateScore = (hand: Card[]) => {
  let score = hand.reduce((acc, card) => acc + card.rank, 0);
  let aces = hand.filter(c => c.value === 'A').length;
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
};

export const Blackjack: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'gameOver'>('betting');
  const [message, setMessage] = useState('');

  const startNewGame = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet) return;
    updateBalance(-validBet);
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');
    setMessage('');
  };

  const hit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(newDeck);
    if (calculateScore(newHand) > 21) {
      stand(newHand); // Automatically stand if bust to see if dealer busts too
    }
  };

  const stand = (finalPlayerHand?: Card[]) => {
    const pHand = finalPlayerHand || playerHand;
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    
    while (calculateScore(currentDealerHand) < 17) {
      currentDealerHand.push(currentDeck.pop()!);
    }
    
    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const pScore = calculateScore(pHand);
    const dScore = calculateScore(currentDealerHand);

    if (pScore > 21 && dScore > 21) {
      updateBalance(bet); // SYMMETRIC LOGIC: Both bust = Push
      endGame('Double Bust! Push.');
    } else if (pScore > 21) {
      endGame('You Bust!');
    } else if (dScore > 21 || pScore > dScore) {
      updateBalance(bet * 2);
      endGame('You Win!');
    } else if (pScore === dScore) {
      updateBalance(bet);
      endGame('Push.');
    } else {
      endGame('Dealer Wins.');
    }
  };

  const endGame = (msg: string) => {
    setMessage(msg);
    setGameState('gameOver');
  };

  const CardView: React.FC<{ card: Card; hidden?: boolean }> = ({ card, hidden = false }) => (
    <div className={`w-20 h-32 sm:w-24 sm:h-36 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-2xl transition-all shadow-xl ${hidden ? 'bg-indigo-900 border-white/20' : 'bg-white border-zinc-200 text-zinc-900'}`}>
      {!hidden ? (
        <>
          <span className={['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-zinc-900'}>{card.value}</span>
          <span className="text-4xl">{card.suit === 'hearts' ? '♥️' : card.suit === 'diamonds' ? '♦️' : card.suit === 'clubs' ? '♣️' : '♠️'}</span>
        </>
      ) : <div className="text-white/20 text-5xl">?</div>}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-4">
        <h4 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">Dealer</h4>
        <div className="flex gap-3">
          {dealerHand.map((c, i) => (
            <CardView key={i} card={c} hidden={gameState === 'playing' && i === 1} />
          ))}
        </div>
      </div>

      <div className="h-16 flex items-center justify-center">
        {message && (
          <div className="bg-white/10 px-10 py-3 rounded-full backdrop-blur-xl border border-white/20 text-2xl font-black text-white text-neon uppercase tracking-widest animate-in zoom-in">
            {message}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
          {playerHand.map((c, i) => <CardView key={i} card={c} />)}
        </div>
        <h4 className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">Your Hand ({calculateScore(playerHand)})</h4>
      </div>

      <div className="w-full max-w-sm">
        {gameState !== 'playing' ? (
          <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 block text-center">Wager</label>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 text-center mono text-white font-black text-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <button
              onClick={startNewGame}
              disabled={balance < bet || bet <= 0}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 uppercase tracking-[0.2em] text-xl transition-all active:scale-95"
            >
              DEAL CARDS
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button onClick={hit} className="flex-1 py-6 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl border border-white/10 text-xl shadow-lg transition-all active:scale-95">HIT</button>
            <button onClick={() => stand()} className="flex-1 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xl shadow-lg transition-all active:scale-95">STAND</button>
          </div>
        )}
      </div>
    </div>
  );
};