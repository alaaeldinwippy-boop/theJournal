export enum Platform {
  FTMO_ACCOUNT = 'FTMO Account',
  FTMO_CHALLENGE = 'FTMO Challenge',
  FTMO_VERIFICATION = 'FTMO Verification',
  TOPSTEP_COMBINE = 'Topstep Combine',
  TOPSTEP_XFA = 'Topstep XFA',
  TOPSTEP_LIVE = 'Topstep Live',
}

export enum Session {
  TOKYO = 'Tokyo',
  LONDON = 'London',
  NEW_YORK = 'New York',
}

export enum Timeframe {
  M1 = 'M1',
  M5 = 'M5',
  M15 = 'M15',
  M30 = 'M30',
  H1 = 'H1',
  H4 = 'H4',
  D = 'D',
  W = 'W',
}

export enum Instrument {
  XAUUSD = 'XAUUSD',
  NASDAQ100 = 'NASDAQ 100',
  SP500 = 'S&P 500',
  EURUSD = 'EURUSD',
  GBPJPY = 'GBPJPY',
}

export enum Direction {
  LONG = 'Long',
  SHORT = 'Short',
}

export enum Outcome {
  WIN = 'Win',
  LOSS = 'Loss',
  BREAKEVEN = 'Breakeven',
  PENDING = 'Pending',
}

export enum Setup {
  MSS = 'MSS',
  REVERSAL = 'Reversal',
  TREND = 'Trend',
  ORB = 'ORB',
}

export enum Confluence {
  EMA = 'EMA',
  FIBONACCI = 'Fibonacci',
  MACD = 'MACD',
  CANDLESTICK = 'Candlestick',
}

export enum Mindset {
  FRUSTRATED = 'Frustrated',
  FOMO = 'FOMO',
  OVERCONFIDENT = 'Overconfident',
  OVERTRADING = 'Overtrading',
  REVENGE_TRADING = 'Revenge Trading',
  HESITANT = 'Hesitant',
  NERVOUS = 'Nervous',
  MINDFUL = 'Mindful',
  CONFIDENT = 'Confident',
  CALM = 'Calm',
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  weight: number;
  category: string;
}

export interface Trade {
  id: string;
  date: string;
  platform: Platform[]; // Changed to array for multiselect
  session: Session;
  timeframe: Timeframe;
  instrument: Instrument;
  direction: Direction;
  entryPrice: number;
  takeProfitPrice: number;
  stopLevelPrice: number;
  points: number;
  outcome: Outcome;
  riskReward: number;
  realizedPnL?: number; // Added realized P&L
  setups: Setup[];
  confluences: Confluence[];
  mindset: Mindset;
  followedPlan: boolean;
  notes: string;
  imageUrl?: string;
  checklistScore: number;
  checklistData: Record<string, boolean>;
}