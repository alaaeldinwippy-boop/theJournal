import React from 'react';

export type TradeStatus = 'WIN' | 'LOSS' | 'BREAK_EVEN' | 'OPEN';
export type Direction = 'Long' | 'Short';

export interface User {
  email: string;
  name: string;
  welcomeMessage?: string; // New field for custom dashboard text
}

export interface Trade {
  id: string;
  symbol: string;
  date: string;
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  status: TradeStatus;
  setup: string; // This corresponds to the Strategy used
  timeframe: string;
  session: string;
  mindset: string;
  notes: string;
  checklistScore: number;
  // New fields
  platform: string[]; // Multiselect
  takeProfit: number;
  stopLoss: number;
  points: number;
  riskReward: number;
  confluences: string[]; // Multiselect
  followedPlan: boolean;
  screenshot?: string; // Placeholder for image URL
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'Analysis' | 'Setup' | 'Entry' | 'Risk';
  group: string;
  isChecked: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface StrategyRules {
  analysis: string[];
  setup: string[];
  entry: string[];
  risk: string[];
}

export interface Strategy {
  id: string;
  title: string;
  winRate: string; // Calculated field (string for display)
  rules: StrategyRules;
  type: string;
  isActive?: boolean;
}

export interface FormOptions {
  platforms: string[];
  sessions: string[];
  timeframes: string[];
  instruments: string[];
}