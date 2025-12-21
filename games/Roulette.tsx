
import React, { useState } from 'react';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export const Roulette: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [selectedBet, setSelectedBet] = useState<string | number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const spin = () => {
    if (!selectedBet || balance < bet) return;
    updateBalance(-bet);
    setSpinning(true);
    setResult(null);
    setMessage('');

    setTimeout(() => {
      const outcome = Math.floor(Math.random() * 37);
      setResult(outcome);
      setSpinning(false);
      
      let won = false;
      if (typeof selectedBet === 'number') {
        if (outcome === selectedBet) won = true;
      } else if (selectedBet === 'red') {
        if (RED_NUMBERS.includes(outcome)) won = true;
      } else if (selectedBet === 'black') {
        if (BLACK_NUMBERS.includes(outcome)) won = true;
      } else if (selectedBet === 'even') {
        if (outcome !== 0 && outcome % 2 === 0) won = true;
      } else if (selectedBet === 'odd') {
        if (outcome % 2 !== 0) won = true;
      }

      if (won) {
        const multiplier = typeof selectedBet === 'number' ? 35 : 2;
        updateBalance(bet * multiplier);
        setMessage(`WIN! Result: ${outcome}`);
      } else {
        setMessage(`LOSS. Result: ${outcome}`);
      }
    }, 2000);
  };

  const getNumColor = (n: number) => {
    if (n === 0) return 'bg-green-600';
    return RED_NUMBERS.includes(n) ? 'bg-red-600' : 'bg-zinc-900';
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border-8 border-zinc-800 flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 border-[24px] border-zinc-900 rounded-full ${spinning ? 'animate-spin' : ''}`} style={{ borderStyle: 'dotted' }} />
        <div className="z-10 text-4xl sm:text-6xl font-black mono">
          {spinning ? '?' : result ?? '--'}
        </div>
      </div>

      <div className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 max-h-48 overflow-y-auto p-1 bg-zinc-950 rounded-xl border border-white/5">
          {Array.from({ length: 37 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedBet(i)}
              className={`aspect-square flex items-center justify-center rounded text-xs font-bold transition-all ${selectedBet === i ? 'ring-2 ring-white scale-90' : 'hover:opacity-80'} ${getNumColor(i)}`}
            >
              {i}
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          {['red', 'black', 'even', 'odd'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedBet(type)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${selectedBet === type ? 'ring-2 ring-white' : 'border-white/5'} ${type === 'red' ? 'bg-red-600' : type === 'black' ? 'bg-zinc-900' : 'bg-zinc-800'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
          {[10, 50, 100].map(v => (
            <button key={v} onClick={() => setBet(v)} className={`px-4 py-2 rounded-lg text-sm font-bold ${bet === v ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>${v}</button>
          ))}
        </div>
        <button
          onClick={spin}
          disabled={spinning || !selectedBet || balance < bet}
          className="px-8 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 uppercase tracking-widest"
        >
          {spinning ? 'Spinning...' : 'Spin Wheel'}
        </button>
      </div>

      {message && <div className="text-xl font-bold animate-bounce">{message}</div>}
    </div>
  );
};
