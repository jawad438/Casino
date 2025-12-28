
import React, { useState, useEffect } from 'react';

export const DiceDuel: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [rolls, setRolls] = useState({ player: 1, house: 1 });
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState('');

  const roll = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setRolling(true);
    setLocked?.(true);
    setMessage('');

    setTimeout(() => {
      const playerTarget = Math.floor(Math.random() * 6) + 1;
      const houseTarget = Math.floor(Math.random() * 6) + 1;
      setRolls({ player: playerTarget, house: houseTarget });
      setRolling(false);
      setLocked?.(false);

      if (playerTarget > houseTarget) {
        updateBalance(validBet * 2);
        setMessage('Victory!');
      } else if (playerTarget < houseTarget) {
        setMessage('Defeat!');
      } else {
        updateBalance(validBet);
        setMessage('Tie! Bet returned.');
      }
    }, 400);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  const DieFace = ({ value }: { value: number }) => {
    const renderPips = () => {
      const positions = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 3, 6, 2, 5, 8] };
      const dots = positions[value as keyof typeof positions] || [];
      return Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center w-full h-full">{dots.includes(i) && <div className="w-3 h-3 sm:w-4 sm:h-4 bg-zinc-900 rounded-full" />}</div>
      ));
    };
    return (
      <div className={`w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 grid grid-cols-3 grid-rows-3 gap-1 transition-all ${rolling ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}>
        {!rolling ? renderPips() : <div className="col-span-3 row-span-3 flex items-center justify-center text-4xl text-zinc-300">?</div>}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-8 sm:gap-16 items-center">
        <div className="flex flex-col items-center gap-6"><DieFace value={rolls.player} /><span className="text-xs font-black uppercase text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">Player</span></div>
        <div className="text-4xl italic font-black text-white/10 select-none">VS</div>
        <div className="flex flex-col items-center gap-6"><DieFace value={rolls.house} /><span className="text-xs font-black uppercase text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">House</span></div>
      </div>
      <div className="flex flex-col items-center gap-6 w-full max-w-md bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5">
        <div className="w-full space-y-4">
          <div className="space-y-2 text-center"><label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block">Wager</label>
            <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span><input type="number" min="1" max={balance} value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} disabled={rolling} className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50" /></div>
          </div>
          <button onClick={roll} disabled={rolling || balance < bet || bet <= 0} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-lg uppercase tracking-[0.2em] text-lg transition-all active:scale-95">{rolling ? 'SHAKING...' : 'SHOOT DICE'}</button>
        </div>
        <div className="h-10 flex items-center justify-center">{message && <div className={`text-2xl font-black uppercase tracking-widest animate-in zoom-in ${message.includes('Victory') ? 'text-green-400' : 'text-zinc-400'}`}>{message}</div>}</div>
      </div>
    </div>
  );
};
