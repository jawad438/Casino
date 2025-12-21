
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

const ROWS = 14; // Increased rows for more complexity
const PEG_RADIUS = 2.5;
const BALL_RADIUS = 5.5;
const GRAVITY = 0.18;
const FRICTION = 0.99;
const BOUNCE_X = 1.35;
const WIDTH = 600;
const HEIGHT = 550;
const STAGGER_MS = 120; // Time between ball drops

// High variance multipliers
const MULTIPLIERS = [15, 8, 4, 2, 1.2, 0.5, 0.2, 0.2, 0.5, 1.2, 2, 4, 8, 15];

const BALL_COLORS = [
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
];

export const Plinko: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [betPerBall, setBetPerBall] = useState<number>(1.00);
  const [ballCount, setBallCount] = useState<number>(10);
  const [activeBalls, setActiveBalls] = useState<Ball[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [history, setHistory] = useState<{win: number, mult: number}[]>([]);

  const requestRef = useRef<number>(0);
  const ballsRef = useRef<Ball[]>([]);
  const idCounter = useRef(0);

  const rowHeight = (HEIGHT - 120) / ROWS;
  const colSpacing = WIDTH / (ROWS + 2);

  const launch = useCallback(async () => {
    const totalCost = betPerBall * ballCount;
    if (balance < totalCost || isLaunching || betPerBall <= 0) return;

    updateBalance(-totalCost);
    setIsLaunching(true);

    for (let i = 0; i < ballCount; i++) {
      const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
      const newBall: Ball = {
        id: idCounter.current++,
        x: WIDTH / 2 + (Math.random() - 0.5) * 8, 
        y: 20,
        vx: (Math.random() - 0.5) * 0.5,
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
  }, [balance, betPerBall, ballCount, updateBalance, isLaunching]);

  const update = useCallback(() => {
    let stateChanged = false;
    const nextBalls = ballsRef.current.map(ball => {
      if (!ball.active) return ball;
      stateChanged = true;

      let { x, y, vx, vy, row } = ball;

      // Physics
      vy += GRAVITY;
      vx *= FRICTION;
      x += vx;
      y += vy;

      // Peg Collision Detection
      const currentPegY = 60 + row * rowHeight;
      if (y >= currentPegY && row < ROWS) {
        const rowXStart = WIDTH / 2 - (row * colSpacing) / 2;
        
        // Find if we are hitting any peg in this row
        // Simplified collision: determine if we cross the peg row Y threshold
        // Then bounce based on proximity to nearest peg
        const direction = Math.random() > 0.5 ? 1 : -1;
        vx = direction * (BOUNCE_X + Math.random() * 0.5);
        vy = 1.2; // Energy loss/reset on bounce
        row += 1;
      }

      // Finish at bottom
      if (y >= HEIGHT - 45) {
        const slotWidth = WIDTH / MULTIPLIERS.length;
        const slotIndex = Math.floor(x / slotWidth);
        const clampedIndex = Math.min(Math.max(slotIndex, 0), MULTIPLIERS.length - 1);
        const mult = MULTIPLIERS[clampedIndex];
        const win = ball.bet * mult;
        
        updateBalance(win);
        setHistory(prev => [{ win, mult }, ...prev].slice(0, 12));
        return { ...ball, active: false, y: HEIGHT + 200 };
      }

      // Wall bounce
      if (x < 10 || x > WIDTH - 10) vx *= -0.6;

      return { ...ball, x, y, vx, vy, row };
    });

    if (stateChanged) {
      ballsRef.current = nextBalls.filter(b => b.y < HEIGHT + 100);
      setActiveBalls([...ballsRef.current]);
    }
    
    requestRef.current = requestAnimationFrame(update);
  }, [updateBalance, colSpacing, rowHeight]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  const getMultiplierColor = (m: number) => {
    if (m >= 10) return 'from-rose-600 to-rose-900';
    if (m >= 4) return 'from-orange-500 to-orange-800';
    if (m >= 1) return 'from-amber-400 to-amber-700';
    return 'from-zinc-700 to-zinc-900';
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
      {/* Simulation Area */}
      <div className="relative bg-[#050505] rounded-[2.5rem] border border-white/10 p-4 flex-grow w-full max-w-[640px] shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto drop-shadow-2xl">
          {/* Background Pegs */}
          {Array.from({ length: ROWS }).map((_, r) => {
            const pegCount = r + 1;
            const rowXStart = WIDTH / 2 - (r * colSpacing) / 2;
            return Array.from({ length: pegCount }).map((_, c) => (
              <circle
                key={`peg-${r}-${c}`}
                cx={rowXStart + c * colSpacing}
                cy={60 + r * rowHeight}
                r={PEG_RADIUS}
                className="fill-zinc-800/80 stroke-white/5"
              />
            ));
          })}

          {/* Multiplier Slots */}
          {MULTIPLIERS.map((m, i) => {
            const slotWidth = WIDTH / MULTIPLIERS.length;
            const isWinner = m >= 1;
            return (
              <g key={`slot-${i}`}>
                <rect
                  x={i * slotWidth + 3}
                  y={HEIGHT - 45}
                  width={slotWidth - 6}
                  height={32}
                  rx={8}
                  className={`fill-gradient bg-gradient-to-b ${getMultiplierColor(m)} opacity-90 stroke-white/10`}
                />
                <text
                  x={i * slotWidth + slotWidth / 2}
                  y={HEIGHT - 25}
                  textAnchor="middle"
                  className={`fill-white text-[10px] font-black pointer-events-none tracking-tighter ${isWinner ? 'opacity-100' : 'opacity-40'}`}
                >
                  {m}x
                </text>
              </g>
            );
          })}

          {/* Dynamic Balls */}
          {activeBalls.map(ball => ball.active && (
            <circle
              key={ball.id}
              cx={ball.x}
              cy={ball.y}
              r={BALL_RADIUS}
              fill={ball.color}
              className="shadow-xl"
              style={{ filter: `drop-shadow(0 0 6px ${ball.color})` }}
            />
          ))}
        </svg>
      </div>

      {/* Control Panel */}
      <div className="w-full xl:w-80 flex flex-col gap-5 bg-zinc-900/40 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl">
        <h3 className="text-xl font-black italic tracking-tighter text-pink-500">PLINKO PRO</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Bet per Ball</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={betPerBall}
                onChange={(e) => setBetPerBall(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Ball Sequence</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="1"
                max="50"
                value={ballCount}
                onChange={(e) => setBallCount(Math.min(50, parseInt(e.target.value) || 1))}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
              />
              <div className="flex gap-1">
                {[5, 10, 25].map(v => (
                  <button 
                    key={v}
                    onClick={() => setBallCount(v)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-black"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-widest">Total Risk</span>
            <span className="mono text-white font-black text-lg">${(betPerBall * ballCount).toFixed(2)}</span>
          </div>
          <button
            onClick={launch}
            disabled={isLaunching || balance < (betPerBall * ballCount) || betPerBall <= 0}
            className="w-full py-5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-pink-600/20 transition-all active:scale-[0.97] uppercase tracking-[0.2em] text-sm"
          >
            {isLaunching ? 'Launching...' : 'DEPLOY BALLS'}
          </button>
        </div>

        {/* Real-time Ticker */}
        <div className="mt-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">Live Multipliers</label>
          <div className="flex flex-wrap gap-1.5 overflow-hidden h-24">
            {history.length === 0 && <p className="text-[10px] text-zinc-700 italic">No drops recorded yet...</p>}
            {history.map((h, i) => (
              <div 
                key={i} 
                className={`text-[10px] font-black px-2 py-1 rounded-lg border animate-in fade-in slide-in-from-right-2 duration-300 ${h.mult >= 1 ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-zinc-500/20 bg-zinc-800/50 text-zinc-500'}`}
              >
                {h.mult}x
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
