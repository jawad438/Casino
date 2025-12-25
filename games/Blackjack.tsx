import React, { useState, useEffect, useMemo } from 'react';
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
      deck.push({ 
        id: `${suit}-${value}-${Math.random().toString(36).substr(2, 9)}`,
        suit, 
        value, 
        rank 
      });
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

interface CardViewProps {
  card: Card;
  hidden?: boolean;
  delay?: number;
  skipAnimation?: boolean;
}

const CardView: React.FC<CardViewProps> = ({ card, hidden = false, delay = 0, skipAnimation = false }) => {
  // We use separate state for flipped/rolled to allow granular control
  const [isFlipped, setIsFlipped] = useState(skipAnimation);
  const [isRolled, setIsRolled] = useState(skipAnimation);

  useEffect(() => {
    // If we're told to skip, immediately show in final state
    if (skipAnimation) {
      setIsFlipped(true);
      setIsRolled(true);
      return;
    }

    // Otherwise, schedule the sequences
    const rollTimer = setTimeout(() => setIsRolled(true), delay);
    const flipTimer = setTimeout(() => setIsFlipped(true), delay + 300);

    return () => {
      clearTimeout(rollTimer);
      clearTimeout(flipTimer);
    };
  }, [delay, skipAnimation]);

  return (
    <div 
      className={`w-20 h-32 sm:w-24 sm:h-36 perspective-[1000px] transition-all duration-700 ease-out ${isRolled ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500 shadow-2xl rounded-2xl"
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
        }}
      >
        {/* Back Face */}
        <div 
          className="absolute inset-0 bg-indigo-900 rounded-2xl border-2 border-white/20 flex items-center justify-center text-white/10 text-4xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          ♠️
        </div>
        {/* Front Face */}
        <div 
          className="absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-2xl bg-white border-zinc-200 text-zinc-900"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {!hidden ? (
            <>
              <span className={['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-zinc-900'}>{card.value}</span>
              <span className="text-4xl">{card.suit === 'hearts' ? '♥️' : card.suit === 'diamonds' ? '♦️' : card.suit === 'clubs' ? '♣️' : '♠️'}</span>
            </>
          ) : (
            <div className="text-zinc-300 text-5xl">?</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Blackjack: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'gameOver'>('betting');
  const [message, setMessage] = useState('');
  const [isDealing, setIsDealing] = useState(false);

  // We track which cards have already been rendered to avoid re-animating them
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set());

  const startNewGame = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet) return;
    updateBalance(-validBet);
    
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    
    setExistingIds(new Set());
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');
    setMessage('');
    setIsDealing(true);
    
    // Clear dealing status after initial animations
    setTimeout(() => setIsDealing(false), 1200);
  };

  const hit = () => {
    if (isDealing || gameState !== 'playing') return;
    
    // Add all current cards to the "existing" set so they don't animate again
    const newExisting = new Set(existingIds);
    playerHand.forEach(c => newExisting.add(c.id));
    dealerHand.forEach(c => newExisting.add(c.id));
    setExistingIds(newExisting);

    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    
    setPlayerHand(newHand);
    setDeck(newDeck);
    setIsDealing(true);
    
    setTimeout(() => {
      setIsDealing(false);
      if (calculateScore(newHand) > 21) {
        stand(newHand);
      }
    }, 600);
  };

  const stand = (finalPlayerHand?: Card[]) => {
    if (isDealing && !finalPlayerHand) return;
    
    // Again, mark current cards as existing
    const newExisting = new Set(existingIds);
    playerHand.forEach(c => newExisting.add(c.id));
    dealerHand.forEach(c => newExisting.add(c.id));
    setExistingIds(newExisting);

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

    // Short delay to let animations finish before showing result message
    setTimeout(() => {
      if (pScore > 21 && dScore > 21) {
        updateBalance(bet); 
        endGame('Push: Double Bust');
      } else if (pScore > 21) {
        endGame('You Bust!');
      } else if (dScore > 21 || pScore > dScore) {
        updateBalance(bet * 2);
        endGame('You Win!');
      } else if (pScore === dScore) {
        updateBalance(bet);
        endGame('Push');
      } else {
        endGame('Dealer Wins');
      }
    }, 1000);
  };

  const endGame = (msg: string) => {
    setMessage(msg);
    setGameState('gameOver');
  };

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Dealer Section */}
      <div className="flex flex-col items-center gap-4">
        <h4 className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">Dealer</h4>
        <div className="flex gap-3 min-h-[144px] justify-center">
          {dealerHand.map((c, i) => {
            const isNew = !existingIds.has(c.id);
            const isHidden = gameState === 'playing' && i === 1;
            // The hidden card (index 1) doesn't roll in, it's just there
            const shouldAnimate = isNew && i !== 1;
            
            return (
              <CardView 
                key={c.id} 
                card={c} 
                hidden={isHidden} 
                delay={shouldAnimate ? (i >= 2 ? (i - 2) * 200 : 0) : 0}
                skipAnimation={!shouldAnimate}
              />
            );
          })}
        </div>
      </div>

      {/* Center Message */}
      <div className="h-16 flex items-center justify-center">
        {message && (
          <div className="bg-white/10 px-10 py-3 rounded-full backdrop-blur-xl border border-white/20 text-2xl font-black text-white text-neon uppercase tracking-widest animate-in zoom-in">
            {message}
          </div>
        )}
      </div>

      {/* Player Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3 min-h-[144px] justify-center">
          {playerHand.map((c, i) => {
            const isNew = !existingIds.has(c.id);
            // On start, first 2 cards have a staggered delay
            const baseDelay = existingIds.size === 0 ? 400 : 0;
            const staggeredDelay = isNew ? (i * 200) + baseDelay : 0;

            return (
              <CardView 
                key={c.id} 
                card={c} 
                delay={staggeredDelay}
                skipAnimation={!isNew}
              />
            );
          })}
        </div>
        <h4 className="text-blue-400 text-xs font-black uppercase tracking-[0.3em]">
          Your Hand ({calculateScore(playerHand)})
        </h4>
      </div>

      {/* Controls */}
      <div className="w-full max-w-sm">
        {gameState !== 'playing' ? (
          <div className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 block text-center">Wager</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input
                  type="number"
                  value={bet}
                  onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 text-center mono text-white font-black text-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
                />
              </div>
            </div>
            <button
              onClick={startNewGame}
              disabled={balance < bet || bet <= 0 || isDealing}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 uppercase tracking-[0.2em] text-xl transition-all active:scale-95"
            >
              DEAL CARDS
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={hit} 
              disabled={isDealing} 
              className="flex-1 py-6 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl border border-white/10 text-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              HIT
            </button>
            <button 
              onClick={() => stand()} 
              disabled={isDealing} 
              className="flex-1 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              STAND
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
