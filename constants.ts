import { Trade, ChecklistItem, Strategy } from './types';

export const MOCK_TRADES: Trade[] = [];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  // Analysis Group
  { id: '1', label: '4H timeframe analysis', category: 'Analysis', group: 'Analysis', isChecked: false },
  { id: '2', label: '1H timeframe analysis', category: 'Analysis', group: 'Analysis', isChecked: false },
  { id: '3', label: '15M timeframe analysis', category: 'Analysis', group: 'Analysis', isChecked: false },

  // Setup Group
  { id: '4', label: 'Confirm market structure (trend continuation or reversal shift)', category: 'Setup', group: 'Setup', isChecked: false },
  { id: '5', label: 'Identify recent swing high/low and mark POI', category: 'Setup', group: 'Setup', isChecked: false },
  { id: '6', label: 'Confirm MACD and EMA with the direction', category: 'Setup', group: 'Setup', isChecked: false },
  { id: '7', label: 'Price returns to POI', category: 'Setup', group: 'Setup', isChecked: false },

  // Entry Group
  { id: '8', label: 'Market Structure Shift in the desired direction', category: 'Entry', group: 'Entry', isChecked: false },
  { id: '9', label: 'Price returns to micro POI', category: 'Entry', group: 'Entry', isChecked: false },
  { id: '10', label: 'Ensure MACD and EMA align', category: 'Entry', group: 'Entry', isChecked: false },

  // Risk Group
  { id: '11', label: 'Risk/Reward 1/2 or more', category: 'Risk', group: 'Risk Management', isChecked: false },
  { id: '12', label: 'TP and SL placed accurately', category: 'Risk', group: 'Risk Management', isChecked: false },
];

export const DEFAULT_STRATEGIES: Strategy[] = [
  {
      id: '1',
      title: "Market Structure Shift",
      winRate: "0%",
      isActive: true,
      rules: {
        analysis: [
          "Identify market structure (e.g., higher highs/lows or lower highs/lows)",
          "Identify trend direction"
        ],
        setup: [
          "Wait for a break of the current market structure (e.g., a significant low in an uptrend or high in a downtrend)",
          "Identify a potential Point of Interest (POI) after the structure break"
        ],
        entry: [
          "Entry on pullback to the POI",
          "Look for confirmation signals like candlestick patterns or volume"
        ],
        risk: [
          "Place stop loss beyond the POI or structure break point",
          "Target a minimum Risk/Reward ratio of 1:2"
        ]
      },
      type: "Trend Following"
  },
  {
      id: '2',
      title: "Break & Retest",
      winRate: "0%",
      isActive: false,
      rules: {
        analysis: ["Identify key support/resistance levels on 4H/1H", "Determine overall trend direction"],
        setup: ["Price breaks key level with momentum", "Wait for pullback to the broken level"],
        entry: ["Bullish/Bearish engulfing on retest", "Volume confirmation"],
        risk: ["Stop loss below/above the retest candle", "R:R minimum 1:2"]
      },
      type: "Trend Following"
  }
];

export const getMindsetColor = (mindset?: string) => {
  if (!mindset) return 'text-slate-900 dark:text-slate-200';
  const m = mindset.toLowerCase();
  const green = ['calm', 'confident', 'mindful'];
  const yellow = ['hesitant', 'nervous'];
  
  if (green.includes(m)) return 'text-green-600 dark:text-green-400';
  if (yellow.includes(m)) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};