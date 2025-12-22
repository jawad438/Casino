
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
      endGame('Bust! Dealer wins.');
    }
  };

  const stand = () => {
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    while (calculateScore(currentDealerHand) < 17) {
      currentDealerHand.push(currentDeck.pop()!);
    }
    setDealerHand(currentDealerHand);
    setDeck(currentDeck);

    const pScore = calculateScore(playerHand);
    const dScore = calculateScore(currentDealerHand);

    if (dScore > 21 || pScore > dScore) {
      updateBalance(bet * 2);
      endGame('You win!');
    } else if (pScore === dScore) {
      updateBalance(bet);
      endGame('Push.');
    } else {
      endGame('Dealer wins.');
    }
  };

  const endGame = (msg: string) => {
    setMessage(msg);
    setGameState('gameOver');
  };

  // Fixed: Added React.FC type to handle 'key' prop correctly in JSX
  const CardView: React.FC<{ card: Card; hidden?: boolean }> = ({ card, hidden = false }) => (
    <div className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl border flex flex-col items-center justify-center font-bold text-xl ${hidden ? 'bg-indigo-900 border-white/20' : 'bg-white border-zinc-200 text-zinc-900 shadow-lg'}`}>
      {!hidden ? (
        <>
          <span className={['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-zinc-900'}>{card.value}</span>
          <span className="text-2xl">{card.suit === 'hearts' ? '♥️' : card.suit === 'diamonds' ? '♦️' : card.suit === 'clubs' ? '♣️' : '♠️'}</span>
        </>
      ) : <span className="text-white opacity-20 text-3xl">?</span>}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Dealer</h4>
        <div className="flex gap-2">
          {dealerHand.map((c, i) => (
            <CardView key={i} card={c} hidden={gameState === 'playing' && i === 1} />
          ))}
        </div>
        {gameState !== 'playing' && <span className="text-zinc-400 font-mono">Score: {calculateScore(dealerHand)}</span>}
      </div>

      <div className="h-20 flex items-center justify-center">
        {message && (
          <div className="bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/10 text-lg font-bold">
            {message}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {playerHand.map((c, i) => <CardView key={i} card={c} />)}
        </div>
        <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Your Hand (Score: {calculateScore(playerHand)})</h4>
      </div>

      <div className="w-full flex flex-col items-center gap-4">
        {gameState === 'betting' || gameState === 'gameOver' ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="w-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block text-center">Custom Bet</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  max={balance}
                  value={bet}
                  onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-3 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
            <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5 w-full">
              {[10, 25, 50, 100].map(v => (
                <button
                  key={v}
                  onClick={() => setBet(v)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${bet === v ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  ${v}
                </button>
              ))}
            </div>
            <button
              onClick={startNewGame}
              disabled={balance < bet || bet <= 0}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 uppercase tracking-widest"
            >
              DEAL HAND
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button onClick={hit} className="px-10 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl border border-white/5">HIT</button>
            <button onClick={stand} className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl">STAND</button>
          </div>
        )}
      </div>
    </div>
  );
};
