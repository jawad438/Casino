
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
  | 'wheel';

export interface GameInfo {
  id: GameID;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  rank: number;
}
