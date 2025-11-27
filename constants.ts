import { ChecklistItem, Platform, Session, Timeframe, Instrument, Direction, Outcome, Setup, Confluence, Mindset } from './types';

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Identify Trend and Leg of Elliot Wave
  { id: 'trend_4h', label: '4H timeframe analysis', weight: 6, category: 'Identify Trend and Leg of Elliot Wave' },
  { id: 'trend_1h', label: '1H timeframe analysis', weight: 6, category: 'Identify Trend and Leg of Elliot Wave' },
  { id: 'trend_15m', label: '15M timeframe analysis', weight: 6, category: 'Identify Trend and Leg of Elliot Wave' },

  // 15m Chart Setup
  { id: 'm15_structure', label: 'Confirm market structure (trend continuation or reversal shift)', weight: 8, category: '15m Chart Setup' },
  { id: 'm15_swing', label: 'Identify recent swing high/low and mark POI', weight: 8, category: '15m Chart Setup' },
  { id: 'm15_macd', label: 'Confirm MACD and EMA with the direction', weight: 5, category: '15m Chart Setup' },
  { id: 'm15_emas', label: 'Price returns to POI', weight: 5, category: '15m Chart Setup' },

  // Micro MSS on 1m
  { id: 'm1_sweep', label: 'Market Structure Shift in the desired direction', weight: 10, category: 'Micro MSS on 1m' },
  { id: 'm1_200ema', label: 'Price returns to micro POI', weight: 6, category: 'Micro MSS on 1m' },
  { id: 'm1_macd_align', label: 'Ensure MACD and EMA align', weight: 6, category: 'Micro MSS on 1m' },

  // Risk Management
  { id: 'rm_rr', label: 'Risk/Reward 1/2 or more', weight: 10, category: 'Risk Management' },
  { id: 'rm_candle', label: 'TP and SL placed accurately', weight: 8, category: 'Risk Management' },
  { id: 'rm_confluence', label: 'Candlestick Confluence', weight: 4, category: 'Risk Management' },
];

export const TOTAL_WEIGHT = CHECKLIST_ITEMS.reduce((acc, item) => acc + item.weight, 0);

export const PLATFORM_OPTIONS = Object.values(Platform);
export const SESSION_OPTIONS = Object.values(Session);
export const TIMEFRAME_OPTIONS = Object.values(Timeframe);
export const INSTRUMENT_OPTIONS = Object.values(Instrument);
export const DIRECTION_OPTIONS = Object.values(Direction);
export const OUTCOME_OPTIONS = Object.values(Outcome);
export const SETUP_OPTIONS = Object.values(Setup);
export const CONFLUENCE_OPTIONS = Object.values(Confluence);
export const MINDSET_OPTIONS = Object.values(Mindset);