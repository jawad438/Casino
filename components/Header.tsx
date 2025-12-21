
import React from 'react';

interface HeaderProps {
  balance: number;
  onReset: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ balance, onReset, onGoHome }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
      <button 
        onClick={onGoHome}
        className="flex items-center gap-2 group"
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
          <span className="text-xl font-black italic tracking-tighter">V</span>
        </div>
        <div className="text-left hidden sm:block">
          <h1 className="text-lg font-bold leading-none tracking-tight">VELVET VAULT</h1>
          <span className="text-[10px] text-zinc-500 font-semibold tracking-[0.2em] uppercase">Digital Casino</span>
        </div>
      </button>

      <div className="flex items-center gap-4">
        {balance === 0 && (
          <button 
            onClick={onReset}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg transition-colors border border-white/5"
          >
            FREE TOP-UP
          </button>
        )}
        <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/10 px-4 py-2 rounded-2xl">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Balance</span>
          <span className="mono text-xl text-green-400 font-bold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </header>
  );
};
