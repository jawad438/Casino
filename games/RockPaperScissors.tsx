
import React, { useState, useEffect } from 'react';

type Choice = 'rock' | 'paper' | 'scissors';
const CHOICES: { id: Choice; icon: string; beats: Choice }[] = [{ id: 'rock', icon: '✊', beats: 'scissors' }, { id: 'paper', icon: '✋', beats: 'rock' }, { id: 'scissors', icon: '✌️', beats: 'paper' }];

export const RockPaperScissors: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState(10);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [houseChoice, setHouseChoice] = useState<Choice | null>(null);
  const [status, setStatus] = useState<'idle' | 'playing' | 'result'>('idle');
  const [message, setMessage] = useState('');

  const play = (choice: Choice) => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || status === 'playing') return;
    updateBalance(-validBet);
    setPlayerChoice(choice); setHouseChoice(null); setStatus('playing'); setLocked?.(true); setMessage('');
    setTimeout(() => {
      const hChoice = CHOICES[Math.floor(Math.random() * 3)].id; setHouseChoice(hChoice); setStatus('result'); setLocked?.(false);
      if (choice === hChoice) { updateBalance(validBet); setMessage('DRAW!'); }
      else if (CHOICES.find(c => c.id === choice)?.beats === hChoice) { updateBalance(validBet * 2); setMessage('VICTORY!'); }
      else { setMessage('DEFEAT!'); }
    }, 1000);
  };

  useEffect(() => {
    return () => setLocked?.(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex justify-center items-center gap-20 py-8 relative">
        <div className="flex flex-col items-center gap-4"><div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl transition-all duration-500 border-4 ${status === 'playing' ? 'bg-zinc-800 border-zinc-700 animate-pulse' : playerChoice ? 'bg-orange-600 border-orange-400' : 'bg-zinc-900 border-white/5'}`}>{playerChoice ? CHOICES.find(c => c.id === playerChoice)?.icon : '?'}</div><span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Player</span></div>
        <div className="text-4xl font-black text-white/10 italic">VS</div>
        <div className="flex flex-col items-center gap-4"><div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl transition-all duration-500 border-4 ${status === 'playing' ? 'bg-zinc-800 border-zinc-700 animate-pulse' : houseChoice ? 'bg-zinc-700 border-zinc-500' : 'bg-zinc-900 border-white/5'}`}>{houseChoice ? CHOICES.find(c => c.id === houseChoice)?.icon : '?'}</div><span className="text-xs font-black uppercase text-zinc-500 tracking-widest">House</span></div>
      </div>
      {status !== 'playing' && (
        <div className="w-full max-w-sm flex flex-col gap-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-3 gap-3">{CHOICES.map(c => (<button key={c.id} onClick={() => play(c.id)} disabled={balance < bet || bet <= 0} className="py-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-4xl shadow-xl transition-all active:scale-95 disabled:opacity-50">{c.icon}<div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">{c.id}</div></button>))}</div>
          <div className="bg-zinc-950/50 p-6 rounded-[2rem] border border-white/10 space-y-1"><label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block text-center">Wager</label><input type="number" value={bet} onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 text-center mono text-white font-bold" /></div>
        </div>
      )}
      {status === 'playing' && <div className="h-32 flex items-center justify-center"><div className="text-2xl font-black text-zinc-500 uppercase animate-bounce tracking-widest">Shooting...</div></div>}
      {status === 'result' && message && <div className={`text-3xl font-black uppercase tracking-widest animate-in zoom-in text-neon ${message.includes('VICTORY') ? 'text-orange-400' : 'text-zinc-600'}`}>{message}</div>}
    </div>
  );
};
