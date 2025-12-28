
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Ball { id: number; x: number; y: number; vx: number; vy: number; row: number; bet: number; active: boolean; color: string; }

const ROWS = 12; const PEG_RADIUS = 3; const BALL_RADIUS = 6; const GRAVITY = 0.22; const FRICTION = 0.98; const BOUNCE_X = 1.8; const WIDTH = 600; const HEIGHT = 550; const STAGGER_MS = 100;
const MULTIPLIERS = [25, 12, 7, 4, 1.5, 0.5, 0.2, 0.5, 1.5, 4, 7, 12, 25];
const BALL_COLORS = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24'];

export const Plinko: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [betPerBall, setBetPerBall] = useState<number>(1.00);
  const [ballCount, setBallCount] = useState<number>(10);
  const [activeBalls, setActiveBalls] = useState<Ball[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [history, setHistory] = useState<{win: number, mult: number}[]>([]);
  const [sessionWin, setSessionWin] = useState(0);

  const requestRef = useRef<number>(0);
  const ballsRef = useRef<Ball[]>([]);
  const idCounter = useRef(0);

  const rowHeight = (HEIGHT - 120) / ROWS;
  const colSpacing = WIDTH / (ROWS + 2);
  const totalStake = betPerBall * ballCount;

  const launch = useCallback(async () => {
    if (balance < totalStake || isLaunching || betPerBall <= 0) return;
    updateBalance(-totalStake);
    setIsLaunching(true);
    setLocked?.(true);
    setSessionWin(0);
    for (let i = 0; i < ballCount; i++) {
      const newBall: Ball = { id: idCounter.current++, x: WIDTH / 2 + (Math.random() - 0.5) * 4, y: 20, vx: 0, vy: 0, row: 0, bet: betPerBall, active: true, color: BALL_COLORS[i % BALL_COLORS.length] };
      ballsRef.current.push(newBall);
      setActiveBalls([...ballsRef.current]);
      await new Promise(resolve => setTimeout(resolve, STAGGER_MS));
    }
    setIsLaunching(false);
  }, [balance, betPerBall, ballCount, updateBalance, isLaunching, totalStake, setLocked]);

  const update = useCallback(() => {
    let activeAny = false;
    const nextBalls = ballsRef.current.map(ball => {
      if (!ball.active) return ball;
      activeAny = true;
      let { x, y, vx, vy, row } = ball;
      vy += GRAVITY; vx *= FRICTION; x += vx; y += vy;
      const currentPegY = 60 + row * rowHeight;
      if (y >= currentPegY && row < ROWS) {
        vx = (Math.random() < 0.5 ? -1 : 1) * (BOUNCE_X + Math.random() * 1.5);
        vy = 1.2; row += 1;
      }
      if (y >= HEIGHT - 45) {
        const slotIndex = Math.floor(x / (WIDTH / MULTIPLIERS.length));
        const mult = MULTIPLIERS[Math.min(Math.max(slotIndex, 0), MULTIPLIERS.length - 1)];
        const win = ball.bet * mult;
        updateBalance(win);
        setSessionWin(prev => prev + win);
        setHistory(prev => [{ win, mult }, ...prev].slice(0, 15));
        return { ...ball, active: false, y: HEIGHT + 200 };
      }
      if (x < 15) { x = 15; vx *= -0.8; } if (x > WIDTH - 15) { x = WIDTH - 15; vx *= -0.8; }
      return { ...ball, x, y, vx, vy, row };
    });
    if (activeAny || isLaunching) {
      setLocked?.(true);
    } else if (!isLaunching && !activeAny && ballsRef.current.length > 0) {
      setLocked?.(false);
    }
    ballsRef.current = nextBalls.filter(b => b.y < HEIGHT + 100);
    setActiveBalls([...ballsRef.current]);
    requestRef.current = requestAnimationFrame(update);
  }, [updateBalance, rowHeight, isLaunching, setLocked]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => { cancelAnimationFrame(requestRef.current); setLocked?.(false); };
  }, [update]);

  return (
    <div className="flex flex-col xl:flex-row gap-10 items-start justify-center">
      <div className="relative bg-[#020617] rounded-[3rem] border-4 border-white/10 p-4 flex-grow w-full max-w-[640px] shadow-2xl overflow-hidden shadow-pink-500/10">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto drop-shadow-2xl">
          {Array.from({ length: ROWS }).map((_, r) => {
            const pegCount = r + 1; const rowXStart = WIDTH / 2 - (r * colSpacing) / 2;
            return Array.from({ length: pegCount }).map((_, c) => ( <circle key={`peg-${r}-${c}`} cx={rowXStart + c * colSpacing} cy={60 + r * rowHeight} r={PEG_RADIUS} className="fill-white/20" /> ));
          })}
          {MULTIPLIERS.map((m, i) => (
            <g key={`slot-${i}`}><rect x={i * (WIDTH / MULTIPLIERS.length) + 4} y={HEIGHT - 50} width={(WIDTH / MULTIPLIERS.length) - 8} height={36} rx={10} className={`${m >= 1.5 ? 'fill-pink-500' : m >= 0.5 ? 'fill-zinc-700' : 'fill-zinc-900'} stroke-white/20`} />
              <text x={i * (WIDTH / MULTIPLIERS.length) + (WIDTH / MULTIPLIERS.length) / 2} y={HEIGHT - 28} textAnchor="middle" className="fill-white text-[10px] font-black pointer-events-none text-neon">{m}x</text>
            </g>
          ))}
          {activeBalls.map(ball => ball.active && ( <circle key={ball.id} cx={ball.x} cy={ball.y} r={BALL_RADIUS} fill={ball.color} style={{ filter: `drop-shadow(0 0 10px ${ball.color})` }} /> ))}
        </svg>
      </div>
      <div className="w-full xl:w-96 flex flex-col gap-6 bg-zinc-900/80 p-8 rounded-[3rem] border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center"><h3 className="text-3xl font-black italic tracking-tighter text-pink-400 uppercase">Plinko</h3>
          <div className="text-right"><div className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Stake</div><div className="text-xl font-black text-white">${totalStake.toFixed(2)}</div></div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2 text-center"><label className="text-xs font-black uppercase text-zinc-500">Stake Per Ball</label><input type="number" step="0.1" value={betPerBall} onChange={(e) => setBetPerBall(parseFloat(e.target.value) || 0)} disabled={isLaunching || activeBalls.some(b => b.active)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 px-6 mono text-white font-black text-2xl" /></div>
          <div className="space-y-2 text-center"><label className="text-xs font-black uppercase text-zinc-500">Burst Count</label>
            <div className="grid grid-cols-2 gap-3"><input type="number" min="1" max="50" value={ballCount} onChange={(e) => setBallCount(Math.min(50, parseInt(e.target.value) || 1))} disabled={isLaunching || activeBalls.some(b => b.active)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 px-6 mono text-white font-black text-xl" />
              <div className="flex gap-2">{[10, 25].map(v => ( <button key={v} onClick={() => setBallCount(v)} disabled={isLaunching || activeBalls.some(b => b.active)} className="flex-1 bg-zinc-800 rounded-xl text-xs font-black">x{v}</button> ))}</div>
            </div>
          </div>
        </div>
        <button onClick={launch} disabled={isLaunching || activeBalls.some(b => b.active) || balance < totalStake || betPerBall <= 0} className="w-full py-6 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-2xl uppercase tracking-[0.3em] text-xl transition-all active:scale-[0.95]">{isLaunching || activeBalls.some(b => b.active) ? 'ACTIVE' : 'DROP BALLS'}</button>
      </div>
    </div>
  );
};
