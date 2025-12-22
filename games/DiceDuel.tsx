
import React, { useState } from 'react';

interface DiceRotation {
  x: number;
  y: number;
  z: number;
}

const FACE_ROTATIONS: Record<number, DiceRotation> = {
  1: { x: 0, y: 0, z: 0 },
  2: { x: 0, y: -90, z: 0 },
  3: { x: -90, y: 0, z: 0 },
  4: { x: 90, y: 0, z: 0 },
  5: { x: 0, y: 90, z: 0 },
  6: { x: 180, y: 0, z: 0 },
};

export const DiceDuel: React.FC<{ balance: number; updateBalance: (a: number) => void }> = ({ balance, updateBalance }) => {
  const [bet, setBet] = useState(10);
  const [rolls, setRolls] = useState({ player: 1, house: 1 });
  const [rotations, setRotations] = useState({ 
    player: { x: 0, y: 0, z: 0 }, 
    house: { x: 0, y: 0, z: 0 } 
  });
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState('');

  const roll = () => {
    const validBet = Math.min(Math.max(1, bet), balance);
    if (balance < validBet || validBet <= 0) return;
    updateBalance(-validBet);
    setRolling(true);
    setMessage('');

    const playerTarget = Math.floor(Math.random() * 6) + 1;
    const houseTarget = Math.floor(Math.random() * 6) + 1;

    // Tumble effect with hidden faces during spin
    const extraX = 1440 + Math.random() * 360; 
    const extraY = 1440 + Math.random() * 360;
    const extraZ = 720 + Math.random() * 360;

    setRotations({
      player: { 
        x: FACE_ROTATIONS[playerTarget].x + extraX, 
        y: FACE_ROTATIONS[playerTarget].y + extraY,
        z: extraZ
      },
      house: { 
        x: FACE_ROTATIONS[houseTarget].x + extraX, 
        y: FACE_ROTATIONS[houseTarget].y + extraY,
        z: extraZ
      }
    });

    setTimeout(() => {
      setRolls({ player: playerTarget, house: houseTarget });
      setRolling(false);

      if (playerTarget > houseTarget) {
        updateBalance(validBet * 2);
        setMessage('Victory!');
      } else if (playerTarget < houseTarget) {
        setMessage('Defeat!');
      } else {
        updateBalance(validBet);
        setMessage('Tie! Bet returned.');
      }
    }, 1500);
  };

  const Cube = ({ rotation, value, isRolling }: { rotation: DiceRotation, value: number, isRolling: boolean }) => (
    <div className="scene w-24 h-24 sm:w-32 sm:h-32">
      <div 
        className={`cube w-full h-full relative preserve-3d ${isRolling ? 'animate-tumble' : ''}`}
        style={{ 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transition: isRolling ? 'none' : 'transform 1.5s cubic-bezier(0.15, 0, 0.15, 1)'
        }}
      >
        <div className="face front">{!isRolling ? 1 : ''}</div>
        <div className="face back">{!isRolling ? 6 : ''}</div>
        <div className="face right">{!isRolling ? 2 : ''}</div>
        <div className="face left">{!isRolling ? 5 : ''}</div>
        <div className="face top">{!isRolling ? 3 : ''}</div>
        <div className="face bottom">{!isRolling ? 4 : ''}</div>
      </div>
      <style>{`
        .scene { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .cube { position: relative; }
        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
          border: 1px solid rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 900;
          color: #0f172a;
          border-radius: 12px;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.05), 0 5px 15px rgba(0,0,0,0.1);
          backface-visibility: visible;
        }
        .front  { transform: rotateY(0deg) translateZ(calc(48px)); }
        .back   { transform: rotateY(180deg) translateZ(calc(48px)); }
        .right  { transform: rotateY(90deg) translateZ(calc(48px)); }
        .left   { transform: rotateY(-90deg) translateZ(calc(48px)); }
        .top    { transform: rotateX(90deg) translateZ(calc(48px)); }
        .bottom { transform: rotateX(-90deg) translateZ(calc(48px)); }
        
        @media (min-width: 640px) {
          .front  { transform: rotateY(0deg) translateZ(calc(64px)); }
          .back   { transform: rotateY(180deg) translateZ(calc(64px)); }
          .right  { transform: rotateY(90deg) translateZ(calc(64px)); }
          .left   { transform: rotateY(-90deg) translateZ(calc(64px)); }
          .top    { transform: rotateX(90deg) translateZ(calc(64px)); }
          .bottom { transform: rotateX(-90deg) translateZ(calc(64px)); }
        }

        @keyframes tumble {
          0% { transform: rotateX(0) rotateY(0) rotateZ(0); }
          25% { transform: rotateX(90deg) rotateY(180deg) rotateZ(45deg); }
          50% { transform: rotateX(180deg) rotateY(360deg) rotateZ(90deg); }
          75% { transform: rotateX(270deg) rotateY(180deg) rotateZ(135deg); }
          100% { transform: rotateX(360deg) rotateY(0) rotateZ(180deg); }
        }
        .animate-tumble {
          animation: tumble 0.4s infinite linear;
        }
      `}</style>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex gap-8 sm:gap-16 items-center">
        <div className="flex flex-col items-center gap-6">
          <Cube rotation={rotations.player} value={rolls.player} isRolling={rolling} />
          <span className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em] bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">Player</span>
        </div>
        <div className="text-4xl italic font-black text-white/10 select-none">VS</div>
        <div className="flex flex-col items-center gap-6">
          <Cube rotation={rotations.house} value={rolls.house} isRolling={rolling} />
          <span className="text-xs font-black uppercase text-zinc-500 tracking-[0.2em] bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">House</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-md bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5">
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block text-center">Wager</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input
                type="number"
                min="1"
                max={balance}
                value={bet}
                onChange={(e) => setBet(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={rolling}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-9 pr-4 mono text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[10, 50, 100].map(v => (
              <button
                key={v}
                onClick={() => setBet(v)}
                disabled={rolling}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${bet === v ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
              >
                ${v}
              </button>
            ))}
          </div>
          <button
            onClick={roll}
            disabled={rolling || balance < bet || bet <= 0}
            className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-600/20 uppercase tracking-[0.2em] text-lg transition-all active:scale-95"
          >
            {rolling ? 'ROLLING...' : 'SHOOT DICE'}
          </button>
        </div>
        
        <div className="h-10 flex items-center justify-center">
          {message && (
            <div className={`text-2xl font-black tracking-widest animate-in zoom-in duration-300 ${message.includes('Victory') ? 'text-green-400' : message.includes('Tie') ? 'text-zinc-400' : 'text-red-400'}`}>
              {message.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
