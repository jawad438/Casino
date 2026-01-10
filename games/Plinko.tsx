
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Ball { 
  id: number; 
  x: number; 
  y: number; 
  targetX: number;
  row: number;
  bet: number; 
  active: boolean; 
  color: string; 
}

type RiskLevel = 'low' | 'medium' | 'high';

// BOARD CONFIGURATION
const ROWS = 16; 
const WIDTH = 1200; 
const HEIGHT = 1100; 
const LAUNCH_COOLDOWN = 200; 
const DROP_SPEED = 22; // Reduced by ~30% from 32
const HORIZONTAL_SPEED = 0.24; // Reduced by ~30% from 0.35 to match vertical deceleration

const MULTIPLIERS: Record<RiskLevel, number[]> = {
  low: [16, 9, 4, 2, 1.4, 1.1, 1, 0.5, 0.5, 1, 1.1, 1.4, 2, 4, 9, 16, 20],
  medium: [33, 18, 10, 5, 2, 1.5, 1, 0.5, 0.2, 0.5, 1, 1.5, 2, 5, 10, 18, 33],
  high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.1, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
};

const BALL_COLORS = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#818cf8'];

// Component to render static board elements (pegs and slots)
const StaticBoard = React.memo(({ risk, rowHeight, colSpacing, pegRadius }: { risk: RiskLevel, rowHeight: number, colSpacing: number, pegRadius: number }) => {
  return (
    <>
      {/* Peg Pyramid */}
      {Array.from({ length: ROWS }).map((_, r) => {
        const pegCount = r + 1; 
        const rowXStart = WIDTH / 2 - (r * colSpacing) / 2;
        return Array.from({ length: pegCount }).map((_, c) => (
          <circle 
            key={`peg-${r}-${c}`} 
            cx={rowXStart + c * colSpacing} 
            cy={150 + r * rowHeight} 
            r={pegRadius} 
            className="fill-zinc-700/60" 
          />
        ));
      })}

      {/* Multiplier Slots */}
      {MULTIPLIERS[risk].map((m, i) => {
        const slotWidth = WIDTH / MULTIPLIERS[risk].length;
        const x = i * slotWidth;
        const colorClass = m >= 10 ? 'fill-rose-600' : m >= 1.5 ? 'fill-indigo-600' : 'fill-zinc-800';
        return (
          <g key={`slot-${i}`}>
            <rect 
              x={x + 4} 
              y={HEIGHT - 120} 
              width={slotWidth - 8} 
              height={100} 
              rx={20} 
              className="fill-white/5 stroke-white/10" 
            />
            <rect 
              x={x + 8} 
              y={HEIGHT - 115} 
              width={slotWidth - 16} 
              height={90} 
              rx={16} 
              className={`${colorClass} stroke-white/20 transition-all duration-700`} 
            />
            <text 
              x={x + slotWidth / 2} 
              y={HEIGHT - 60} 
              textAnchor="middle" 
              className="fill-white text-[22px] font-black pointer-events-none filter drop-shadow-lg"
            >
              {m}x
            </text>
          </g>
        );
      })}
    </>
  );
});

export const Plinko: React.FC<{ balance: number; updateBalance: (a: number) => void; setLocked?: (l: boolean) => void }> = ({ balance, updateBalance, setLocked }) => {
  const [bet, setBet] = useState<number>(1.00);
  const [risk, setRisk] = useState<RiskLevel>('medium');
  const [activeBalls, setActiveBalls] = useState<Ball[]>([]);
  const [lastLaunch, setLastLaunch] = useState(0);

  const requestRef = useRef<number>(0);
  const ballsRef = useRef<Ball[]>([]);
  const idCounter = useRef(0);

  const rowHeight = useMemo(() => (HEIGHT - 320) / ROWS, []);
  const colSpacing = useMemo(() => WIDTH / (ROWS + 2), []);
  const pegRadius = 8;
  
  // Ball size remains compact (50% smaller than the previous large version)
  const ballRadius = useMemo(() => ((colSpacing - pegRadius * 2) / 1.55) * 0.5, [colSpacing]);

  const launch = useCallback(() => {
    const now = Date.now();
    if (balance < bet || bet <= 0 || now - lastLaunch < LAUNCH_COOLDOWN) return;

    updateBalance(-bet);
    setLastLaunch(now);
    
    const newBall: Ball = { 
      id: idCounter.current++, 
      x: WIDTH / 2, 
      y: 50, 
      targetX: WIDTH / 2,
      row: -1, 
      bet: bet, 
      active: true, 
      color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)] 
    };

    ballsRef.current.push(newBall);
    setActiveBalls([...ballsRef.current]);
    setLocked?.(true);
  }, [balance, bet, updateBalance, lastLaunch, setLocked]);

  const update = useCallback(() => {
    if (ballsRef.current.length === 0) {
      setLocked?.(false);
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    let anyActive = false;
    const currentMults = MULTIPLIERS[risk];
    
    const nextBalls = ballsRef.current.map(ball => {
      if (!ball.active) return ball;
      anyActive = true;

      let { x, y, targetX, row } = ball;

      // Move Y down (30% slower than before)
      y += DROP_SPEED;

      // Check if we hit the Y level of the next row
      const nextRowY = 150 + (row + 1) * rowHeight;
      if (y >= nextRowY && row < ROWS - 1) {
        row += 1;
        // 50/50 Math Choice
        const direction = Math.random() < 0.5 ? -1 : 1;
        targetX += (direction * colSpacing) / 2;
      }

      // Smooth horizontal interpolation to the targetX (30% slower than before)
      x += (targetX - x) * HORIZONTAL_SPEED;

      // Final payout check
      if (y >= HEIGHT - 110) {
        const slotWidth = WIDTH / currentMults.length;
        const slotIndex = Math.floor(x / slotWidth);
        const mult = currentMults[Math.min(Math.max(slotIndex, 0), currentMults.length - 1)];
        const win = ball.bet * mult;
        
        updateBalance(win);
        return { ...ball, active: false, y: HEIGHT + 1000 };
      }

      return { ...ball, x, y, targetX, row };
    });

    ballsRef.current = nextBalls.filter(b => b.y < HEIGHT + 500);
    setActiveBalls([...ballsRef.current]);

    if (!anyActive && ballsRef.current.length === 0) {
      setLocked?.(false);
    } else {
      setLocked?.(true);
    }

    requestRef.current = requestAnimationFrame(update);
  }, [updateBalance, rowHeight, colSpacing, risk, setLocked]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestRef.current);
      setLocked?.(false);
    };
  }, [update]);

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-stretch justify-center w-full min-h-[85vh]">
      {/* FULLSCREEN PLINKO BOARD AREA */}
      <div className="relative bg-[#020617] rounded-[3rem] sm:rounded-[4rem] border-[10px] border-white/5 p-4 sm:p-6 flex-grow shadow-3xl overflow-hidden ring-1 ring-white/10 flex items-center justify-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <svg 
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`} 
          className="w-full h-full max-h-[85vh] drop-shadow-[0_40px_80px_rgba(0,0,0,1)]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Static Board Elements (Memoized) */}
          <StaticBoard risk={risk} rowHeight={rowHeight} colSpacing={colSpacing} pegRadius={pegRadius} />

          {/* Dynamic Math-Based Balls - Now 30% Slower */}
          {activeBalls.map(ball => ball.active && (
            <circle 
              key={ball.id} 
              cx={ball.x} 
              cy={ball.y} 
              r={ballRadius} 
              fill={ball.color} 
              className="drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              style={{ filter: `drop-shadow(0 0 25px ${ball.color})`, willChange: 'transform' }} 
            />
          ))}
        </svg>
      </div>

      {/* COMPACT STICKY CONTROL PANEL */}
      <div className="w-full xl:w-[400px] flex flex-col gap-8 bg-[#0a0a0b] p-8 sm:p-10 rounded-[3rem] border border-white/10 shadow-3xl h-fit sticky top-24 self-start">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase text-neon">Plinko</h3>
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <span className="text-xl">🏐</span>
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Balanced Pace Mode</p>
        </div>

        <div className="space-y-8">
          {/* Risk Toggle */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em] block text-center">Multiplier Risk</label>
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-2 rounded-[1.5rem] border border-white/5">
              {(['low', 'medium', 'high'] as RiskLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setRisk(level)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${risk === level ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Stake Amount */}
          <div className="space-y-3 text-center">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Drop Wager</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-xl group-focus-within:text-pink-500 transition-colors">$</span>
              <input 
                type="number" 
                step="0.1" 
                value={bet} 
                onChange={(e) => setBet(parseFloat(e.target.value) || 0)} 
                className="w-full bg-zinc-950 border border-white/10 rounded-[1.5rem] py-5 px-12 mono text-white font-black text-4xl focus:border-pink-500/50 outline-none transition-all text-center" 
              />
            </div>
          </div>
        </div>

        {/* Rapid Launch Button */}
        <button 
          onClick={launch} 
          disabled={balance < bet || bet <= 0 || Date.now() - lastLaunch < LAUNCH_COOLDOWN} 
          className="w-full py-8 bg-gradient-to-br from-pink-500 to-rose-600 hover:scale-[1.02] text-white font-black rounded-[2rem] shadow-3xl shadow-pink-600/30 uppercase tracking-[0.4em] text-2xl transition-all active:scale-[0.96] disabled:opacity-20 disabled:grayscale group relative overflow-hidden"
        >
          <span className="relative z-10">DROP BALL</span>
          <div 
            className="absolute bottom-0 left-0 h-1.5 bg-white/40 transition-all duration-75" 
            style={{ 
              width: `${Math.min(100, (Date.now() - lastLaunch) / LAUNCH_COOLDOWN * 100)}%`,
              transition: Date.now() - lastLaunch >= LAUNCH_COOLDOWN ? 'none' : 'width 200ms linear'
            }} 
          />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950/50 p-5 rounded-[1.5rem] border border-white/5 text-center">
            <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Interval</div>
            <div className="text-sm font-black text-white">0.2s</div>
          </div>
          <div className="bg-zinc-950/50 p-5 rounded-[1.5rem] border border-white/5 text-center">
            <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Speed</div>
            <div className="text-sm font-black text-emerald-500 uppercase">30% Slower</div>
          </div>
        </div>
      </div>
    </div>
  );
};
