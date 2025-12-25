import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  row: number;
  bet: number;
  active: boolean;
  color: string;
}

const ROWS = 12; 
const PEG_RADIUS = 3;
const BALL_RADIUS = 6;
const GRAVITY = 0.22;
const FRICTION = 0.98;
const BOUNCE_X = 1.6; // Increased bounce slightly
const WIDTH = 600;
const HEIGHT = 550;
const STAGGER_MS = 100;

// High-value outer zones
const MULTIPLIERS = [30, 15, 8, 4, 1.5, 0.7, 0.7, 0.7, 0.7, 1.5, 4, 8, 15, 30];

const BALL_COLORS = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24'];

export const Plinko: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
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
    setSessionWin(0);

    for (let i = 0; i < ballCount; i++) {
      const color = BALL_COLORS[i % BALL_COLORS.length];
      const newBall: Ball = {
        id: idCounter.current++,
        x: WIDTH / 2 + (Math.random() - 0.5) * 30, // Wider drop variance
        y: 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0,
        row: 0,
        bet: betPerBall,
        active: true,
        color: color,
      };
      
      ballsRef.current.push(newBall);
      setActiveBalls([...ballsRef.current]);
      await new Promise(resolve => setTimeout(resolve, STAGGER_MS));
    }
    setIsLaunching(false);
  }, [balance, betPerBall, ballCount, updateBalance, isLaunching, totalStake]);

  const update = useCallback(() => {
    let stateChanged = false;
    const nextBalls = ballsRef.current.map(ball => {
      if (!ball.active) return ball;
      stateChanged = true;

      let { x, y, vx, vy, row } = ball;
      vy += GRAVITY;
      vx *= FRICTION;
      x += vx;
      y += vy;

      const currentPegY = 60 + row * rowHeight;
      if (y >= currentPegY && row < ROWS) {
        // EASY BIAS: Calculate distance from center
        // Balls further from center get an extra push away from center
        const centerDist = x - WIDTH / 2;
        const bias = centerDist / (WIDTH / 2) * 0.75; // Increased bias from 0.4 to 0.75 for extra "ease"
        
        vx = (Math.random() - 0.5 + bias) * BOUNCE_X * 5.5;
        vy = 1.1;
        row += 1;
      }

      if (y >= HEIGHT - 45) {
        const slotWidth = WIDTH / MULTIPLIERS.length;
        const slotIndex = Math.floor(x / slotWidth);
        const clampedIndex = Math.min(Math.max(slotIndex, 0), MULTIPLIERS.length - 1);
        const mult = MULTIPLIERS[clampedIndex];
        const win = ball.bet * mult;
        
        updateBalance(win);
        setSessionWin(prev => prev + win);
        setHistory(prev => [{ win, mult }, ...prev].slice(0, 15));
        return { ...ball, active: false, y: HEIGHT + 200 };
      }

      if (x < 15) { x = 15; vx *= -0.8; }
      if (x > WIDTH - 15) { x = WIDTH - 15; vx *= -0.8; }

      return { ...ball, x, y, vx, vy, row };
    });

    if (stateChanged) {
      ballsRef.current = nextBalls.filter(b => b.y < HEIGHT + 100);
      setActiveBalls([...ballsRef.current]);
    }
    
    requestRef.current = requestAnimationFrame(update);
  }, [updateBalance, rowHeight]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  return (
    <div className="flex flex-col xl:flex-row gap-10 items-start justify-center">
      <div className="relative bg-[#020617] rounded-[3rem] border-4 border-white/10 p-4 flex-grow w-full max-w-[640px] shadow-2xl overflow-hidden shadow-pink-500/10">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto drop-shadow-2xl">
          {Array.from({ length: ROWS }).map((_, r) => {
            const pegCount = r + 1;
            const rowXStart = WIDTH / 2 - (r * colSpacing) / 2;
            return Array.from({ length: pegCount }).map((_, c) => (
              <circle
                key={`peg-${r}-${c}`}
                cx={rowXStart + c * colSpacing}
                cy={60 + r * rowHeight}
                r={PEG_RADIUS}
                className="fill-white/20"
              />
            ));
          })}

          {MULTIPLIERS.map((m, i) => {
            const slotWidth = WIDTH / MULTIPLIERS.length;
            const color = m >= 1.5 ? 'fill-pink-500' : 'fill-zinc-800';
            return (
              <g key={`slot-${i}`}>
                <rect
                  x={i * slotWidth + 4}
                  y={HEIGHT - 50}
                  width={slotWidth - 8}
                  height={36}
                  rx={10}
                  className={`${color} stroke-white/20 transition-colors`}
                />
                <text
                  x={i * slotWidth + slotWidth / 2}
                  y={HEIGHT - 28}
                  textAnchor="middle"
                  className="fill-white text-[11px] font-black pointer-events-none text-neon"
                >
                  {m}x
                </text>
              </g>
            );
          })}

          {activeBalls.map(ball => ball.active && (
            <circle
              key={ball.id}
              cx={ball.x}
              cy={ball.y}
              r={BALL_RADIUS}
              fill={ball.color}
              style={{ filter: `drop-shadow(0 0 10px ${ball.color})` }}
            />
          ))}
        </svg>
      </div>

      <div className="w-full xl:w-96 flex flex-col gap-6 bg-zinc-900/80 p-8 rounded-[3rem] border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-3xl font-black italic tracking-tighter text-pink-400 text-neon">PLINKO PRO</h3>
          <div className="text-right">
             <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Total Stake</div>
             <div className="text-xl font-black text-white">${totalStake.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 block">Stake Per Ball</label>
            <input
              type="number"
              step="0.1"
              value={betPerBall}
              onChange={(e) => setBetPerBall(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 px-6 mono text-white font-black text-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 block">Burst Count</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                max="50"
                value={ballCount}
                onChange={(e) => setBallCount(Math.min(50, parseInt(e.target.value) || 1))}
                className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-4 px-6 mono text-white font-black text-xl focus:outline-none focus:ring-4 focus:ring-pink-500/20"
              />
              <div className="flex gap-2">
                {[10, 25].map(v => (
                  <button key={v} onClick={() => setBallCount(v)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-black transition-all">x{v}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
          <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Session Returns</div>
          <div className={`text-2xl font-black ${sessionWin >= totalStake ? 'text-emerald-400' : sessionWin > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
            ${sessionWin.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-600 font-bold mt-1">Net: ${(sessionWin - totalStake).toFixed(2)}</div>
        </div>

        <button
          onClick={launch}
          disabled={isLaunching || balance < totalStake || betPerBall <= 0}
          className="w-full py-6 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-2xl shadow-pink-500/30 uppercase tracking-[0.3em] text-xl transition-all active:scale-[0.95]"
        >
          {isLaunching ? 'DEPLOYING...' : 'DROP BALLS'}
        </button>

        <div className="flex flex-wrap gap-2 pt-4">
          {history.map((h, i) => (
            <div key={i} className={`text-xs font-black px-3 py-1.5 rounded-xl border animate-in fade-in slide-in-from-right-2 duration-300 ${h.mult >= 1.5 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-zinc-500/20 bg-zinc-800 text-zinc-500'}`}>
              {h.mult}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};