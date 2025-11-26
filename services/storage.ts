import { Trade } from '../types';

export const getTrades = (userId: string): Trade[] => {
  if (!userId) return [];
  try {
    const key = `perfect_trade_journal_data_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from storage', error);
    return [];
  }
};

export const saveTrade = (trade: Trade, userId: string): void => {
  if (!userId) return;
  const currentTrades = getTrades(userId);
  const key = `perfect_trade_journal_data_${userId}`;
  
  // Check if update or new
  const index = currentTrades.findIndex(t => t.id === trade.id);
  if (index >= 0) {
    currentTrades[index] = trade;
  } else {
    currentTrades.push(trade);
  }
  localStorage.setItem(key, JSON.stringify(currentTrades));
};

export const deleteTrade = (id: string, userId: string): void => {
  if (!userId) return;
  const currentTrades = getTrades(userId);
  const key = `perfect_trade_journal_data_${userId}`;
  
  const filtered = currentTrades.filter(t => t.id !== id);
  localStorage.setItem(key, JSON.stringify(filtered));
};