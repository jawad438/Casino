
export type GameID = 
  | 'slots' 
  | 'blackjack' 
  | 'roulette' 
  | 'crash' 
  | 'mines' 
  | 'plinko' 
  | 'dice' 
  | 'baccarat' 
  | 'poker' 
  | 'wheel'
  | 'limbo'
  | 'keno'
  | 'coinflip'
  | 'hilo'
  | 'towers'
  | 'rockpaperscissors'
  | 'investor'
  | 'momentum'
  | 'crowd'
  | 'decay';

export interface GameInfo {
  id: GameID;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Card {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  rank: number;
}
