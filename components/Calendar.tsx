import React, { useMemo, useState } from 'react';
import { Trade, Outcome } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  trades: Trade[];
}

const Calendar: React.FC<CalendarProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const calendarData = useMemo(() => {
    const days = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const data = [];

    // Padding
    for (let i = 0; i < firstDay; i++) {
      data.push(null);
    }

    // Days
    for (let i = 1; i <= days; i++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayTrades = trades.filter(t => t.date === dateStr);
      data.push({ day: i, date: dateStr, trades: dayTrades });
    }
    return data;
  }, [currentDate, trades]);

  const weeklySummary = useMemo(() => {
    const weeks: Record<number, { pnl: number, count: number, wins: number }> = {};
    
    // Iterate through all days in current month view
    // Note: This calculates based on weeks of the current month being viewed
    const days = getDaysInMonth(currentDate);
    for(let i=1; i<=days; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        // Simple week calc: 1-7 = week 1, etc.
        const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
        
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayTrades = trades.filter(t => t.date === dateStr);

        if(!weeks[weekNum]) weeks[weekNum] = { pnl: 0, count: 0, wins: 0 };
        
        dayTrades.forEach(t => {
            let pnl = 0;
            if (t.realizedPnL !== undefined && t.realizedPnL !== null) {
                pnl = t.realizedPnL;
            } else {
                if(t.outcome === Outcome.WIN) {
                    pnl = 100 * (t.riskReward || 2);
                } else if (t.outcome === Outcome.LOSS) {
                    pnl = -100;
                }
            }

            if(t.outcome === Outcome.WIN) weeks[weekNum].wins++;
            weeks[weekNum].pnl += pnl;
            weeks[weekNum].count++;
        });
    }
    return weeks;
  }, [currentDate, trades]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-3 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h2>
            <div className="flex items-center gap-4">
                <span className="text-lg font-medium text-slate-600 dark:text-slate-300">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-2 bg-slate-200 dark:bg-custom-panel rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 bg-slate-200 dark:bg-custom-panel rounded-lg hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
             <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase">
                        {d}
                    </div>
                ))}
             </div>
             <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {calendarData.map((cell, idx) => {
                    if(!cell) return <div key={idx} className="bg-slate-50 dark:bg-custom-main/30 border-r border-b border-slate-200 dark:border-slate-800/50" />;
                    
                    const dayPnL = cell.trades.reduce((acc, t) => {
                        if (t.realizedPnL !== undefined && t.realizedPnL !== null) return acc + t.realizedPnL;
                        if(t.outcome === Outcome.WIN) return acc + (100 * (t.riskReward || 2));
                        if(t.outcome === Outcome.LOSS) return acc - 100;
                        return acc;
                    }, 0);
                    
                    const isPositive = dayPnL > 0;
                    const isNegative = dayPnL < 0;

                    return (
                        <div key={idx} className={`
                            relative border-r border-b border-slate-200 dark:border-slate-800/50 p-2 flex flex-col justify-between transition-colors
                            ${isPositive ? 'bg-emerald-50 dark:bg-emerald-900/10' : isNegative ? 'bg-rose-50 dark:bg-rose-900/10' : 'bg-white dark:bg-custom-panel'}
                            hover:bg-slate-100 dark:hover:bg-slate-800/50
                        `}>
                            <span className={`text-sm font-medium ${cell.trades.length > 0 ? 'text-slate-800 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>{cell.day}</span>
                            {cell.trades.length > 0 && (
                                <div className="mt-2">
                                    <div className={`text-sm font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                                        {dayPnL > 0 ? '+' : ''}${Math.abs(dayPnL).toFixed(0)}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        {cell.trades.length} trade{cell.trades.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
             </div>
        </div>
      </div>

      {/* Weekly Summary Sidebar */}
      <div className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-fit shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weekly Summary</h3>
        <div className="space-y-8">
            {Object.entries(weeklySummary).map(([week, stats]: any) => {
                if (stats.count === 0) return null;
                const winRate = (stats.wins / stats.count) * 100;
                return (
                    <div key={week}>
                        <div className="text-xs font-medium text-slate-500 mb-1">Week {week}</div>
                        <div className={`text-2xl font-bold mb-1 ${stats.pnl >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                            {stats.pnl > 0 ? '+' : ''}${stats.pnl.toFixed(0)}
                        </div>
                        <div className="text-xs text-slate-400">
                            {stats.count} trades • {winRate.toFixed(0)}% win rate
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="bg-slate-400 dark:bg-slate-600 h-full rounded-full" style={{ width: '100%' }}></div> 
                        </div>
                    </div>
                );
            })}
            {Object.keys(weeklySummary).length === 0 && (
                <div className="text-slate-500 text-sm">No data for this month.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;