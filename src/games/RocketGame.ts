// Rocket Game types and constants
export interface RocketPlayer {
  id: string;
  name: string;
  avatar: string;
  bet: number;
  cashedMultiplier?: number;
  cashedProfit?: number;
  isCashedOut?: boolean;
}

export interface RocketRoundData {
  roundId: number;
  crashMultiplier: number;
  hash: string;
  timestamp: number;
}
