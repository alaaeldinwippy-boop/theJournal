import React, { useState, useMemo } from 'react';
import { Trade, Strategy, FormOptions } from '../types';
import { ChevronLeft, ChevronRight, X, Edit2, TrendingUp, TrendingDown, Eye, Trash2, Minus } from 'lucide-react';
import AddTradeModal from './AddTradeModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getMindsetColor } from '../constants';

interface DailyStats {
  pnl: number;
  count: number;
  trades: Trade[];
}

interface CalendarViewProps {
  trades: Trade[];
  onSave: (trade: Trade) => void;
  onDelete: (id: string) => void;
  strategies: Strategy[];
  formOptions: FormOptions;
}

const CalendarView: React.FC<CalendarViewProps> = ({ trades, onSave, onDelete, strategies, formOptions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
  
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const startDayOffset = getFirstDayOfMonth(currentDate);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const toggleMonthPicker = () => {
    if (!isMonthPickerOpen) {
        setPickerYear(currentDate.getFullYear());
    }
    setIsMonthPickerOpen(!isMonthPickerOpen);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(pickerYear, monthIndex, 1));
    setIsMonthPickerOpen(false);
    setSelectedDay(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm('Are you sure you want to delete this trade?')) {
          onDelete(id);
      }
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Group trades by day for the calendar grid
  const dailyPnL = useMemo(() => {
    const dailyData: Record<number, DailyStats> = {};
    const currentMonthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === currentDate.getMonth() && tradeDate.getFullYear() === currentDate.getFullYear();
    });

    currentMonthTrades.forEach(trade => {
      const day = parseInt(trade.date.split('-')[2]);
      if (!dailyData[day]) dailyData[day] = { pnl: 0, count: 0, trades: [] };
      dailyData[day].pnl += trade.pnl;
      dailyData[day].count += 1;
      dailyData[day].trades.push(trade);
    });
    return dailyData;
  }, [trades, currentDate]);

  // Calculate Weekly Stats
  const weeklyStats = useMemo(() => {
    const stats = [];
    const weeksCount = Math.ceil((daysInMonth + startDayOffset) / 7);
    
    for (let i = 0; i < weeksCount; i++) {
      let weekPnL = 0;
      let weekWin = 0;
      let weekCount = 0;
      
      const startDay = (i * 7) - startDayOffset + 1;
      const endDay = startDay + 6;

      Object.entries(dailyPnL).forEach(([dayStr, d]) => {
          const data = d as DailyStats;
          const day = parseInt(dayStr);
          if (day >= startDay && day <= endDay) {
              weekPnL += data.pnl;
              weekCount += data.count;
              weekWin += data.trades.filter(t => t.pnl > 0).length;
          }
      });

      if (startDay <= daysInMonth) {
          stats.push({
              week: i + 1,
              pnl: weekPnL,
              trades: weekCount,
              winRate: weekCount > 0 ? Math.round((weekWin / weekCount) * 100) : 0
          });
      }
    }
    return stats;
  }, [dailyPnL, daysInMonth, startDayOffset]);

  // Prepare Chart Data (Daily Aggregated P&L)
  const chartData = useMemo(() => Object.entries(dailyPnL)
    .map(([day, d]) => {
      const data = d as DailyStats;
      return {
        name: day,
        pnl: data.pnl,
        count: data.count
      };
    })
    .sort((a, b) => parseInt(a.name) - parseInt(b.name)), [dailyPnL]);

  const handleDayClick = (day: number) => {
      if (dailyPnL[day]) {
          setSelectedDay(day);
      }
  };

  const renderDays = () => {
    const days = [];
    
    for (let i = 0; i < startDayOffset; i++) {
        days.push(<div key={`empty-${i}`} className="bg-slate-50 dark:bg-[#11141f] border border-slate-200 dark:border-slate-800/50 min-h-[100px] opacity-50"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const data = dailyPnL[i];
        days.push(
            <div 
                key={i} 
                onClick={() => handleDayClick(i)}
                className={`bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 min-h-[100px] p-2 relative group dark:hover:border-indigo-500 transition-colors ${data ? (data.pnl >= 0 ? 'bg-green-50 dark:bg-green-900/10 cursor-pointer' : 'bg-red-50 dark:bg-red-900/10 cursor-pointer') : ''}`}
            >
                <span className="text-slate-500 dark:text-slate-500 text-sm font-medium">{i}</span>
                {data && (
                    <div className="flex flex-col items-center justify-center h-full -mt-4">
                        <span className={`font-bold text-lg ${data.pnl > 0 ? 'text-green-600 dark:text-green-400' : data.pnl < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {data.pnl > 0 ? '+' : data.pnl < 0 ? '-' : ''}${Math.abs(data.pnl).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.count} trade{data.count > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
        );
    }
    return days;
  };

  // Custom Tooltip for Bar Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pnl = payload[0].value;
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between gap-4 mb-1">
             <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Day {label}</span>
             <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{data.count} Trades</span>
          </div>
          <p className={`text-sm font-bold ${pnl > 0 ? 'text-green-600 dark:text-green-400' : pnl < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {pnl > 0 ? '+' : pnl < 0 ? '-' : ''}${Math.abs(pnl).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Calendar</h1>
            <div className="relative">
                <div className="flex items-center gap-4 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" type="button"><ChevronLeft size={20}/></button>
                    <button 
                        onClick={toggleMonthPicker}
                        className="text-slate-900 dark:text-white font-medium min-w-[150px] text-center px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        type="button"
                    >
                        {monthName} {year}
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" type="button"><ChevronRight size={20}/></button>
                </div>

                {isMonthPickerOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsMonthPickerOpen(false)} />
                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 w-64 p-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <button 
                                    onClick={() => setPickerYear(pickerYear - 1)} 
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    type="button"
                                >
                                    <ChevronLeft size={16}/>
                                </button>
                                <span className="font-bold text-slate-900 dark:text-white">{pickerYear}</span>
                                <button 
                                    onClick={() => setPickerYear(pickerYear + 1)} 
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    type="button"
                                >
                                    <ChevronRight size={16}/>
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {months.map((m, idx) => (
                                    <button
                                        key={m}
                                        onClick={() => handleMonthSelect(idx)}
                                        className={`text-sm py-2 rounded-lg transition-colors ${
                                            currentDate.getMonth() === idx && currentDate.getFullYear() === pickerYear 
                                            ? 'bg-indigo-600 text-white font-medium' 
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        type="button"
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Calendar & Chart */}
            <div className="flex-1 flex flex-col gap-6">
                {/* Calendar Grid */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111111]">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {renderDays()}
                    </div>
                </div>

                {/* Monthly P&L Chart */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Monthly Performance</h3>
                    <div className="h-64 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                        content={<CustomTooltip />}
                                    />
                                    <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#22c55e' : entry.pnl < 0 ? '#ef4444' : '#64748b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                                No trades recorded this month
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Weekly Summary */}
            <div className="w-full lg:w-80 shrink-0 space-y-4">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white px-1">Weekly Summary</h3>
                 {weeklyStats.map((week) => (
                    <div key={week.week} className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">Week {week.week}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                week.pnl > 0 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                    : week.pnl < 0 
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                {week.winRate}% Win Rate
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${
                                    week.pnl > 0 
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                                        : week.pnl < 0 
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}>
                                    {week.pnl > 0 ? <TrendingUp size={20} /> : week.pnl < 0 ? <TrendingDown size={20} /> : <Minus size={20} />}
                                </div>
                                <div>
                                    <div className={`text-xl font-bold ${
                                        week.pnl > 0 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : week.pnl < 0 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                        {week.pnl > 0 ? '+' : week.pnl < 0 ? '-' : ''}${Math.abs(week.pnl).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500">{week.trades} Trades</div>
                                </div>
                             </div>
                        </div>
                    </div>
                ))}
                {weeklyStats.length === 0 && (
                     <div className="bg-slate-50 dark:bg-[#11141f] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-500 border-dashed">
                         No data for this month
                     </div>
                )}
            </div>
        </div>

        {selectedDay && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-[#111111] w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111111]">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                             {String(selectedDay).padStart(2, '0')}/{String(currentDate.getMonth() + 1).padStart(2, '0')}/{year}
                        </h3>
                        <button onClick={() => setSelectedDay(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" type="button">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto space-y-3">
                        {dailyPnL[selectedDay]?.trades.map((trade) => (
                            <div key={trade.id} className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex justify-between items-center group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900 dark:text-white">{trade.symbol}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold uppercase ${trade.direction === 'Long' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>{trade.direction}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-2 flex-wrap">
                                        <span>{trade.setup}</span>
                                        <span>•</span>
                                        <span>{trade.timeframe}</span>
                                        {trade.mindset && (
                                            <>
                                                <span>•</span>
                                                <span className={getMindsetColor(trade.mindset)}>{trade.mindset}</span>
                                            </>
                                        )}
                                    </div>
                                    {trade.riskReward && (
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            R:R <span className="font-medium text-slate-700 dark:text-slate-300">{trade.riskReward}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className={`font-bold ${trade.pnl > 0 ? 'text-green-600 dark:text-green-400' : trade.pnl < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {trade.pnl > 0 ? '+' : trade.pnl < 0 ? '-' : ''}${Math.abs(trade.pnl).toLocaleString()}
                                        </div>
                                        <div className={`text-xs font-bold uppercase ${trade.status === 'WIN' ? 'text-green-600 dark:text-green-500' : trade.status === 'LOSS' ? 'text-red-600 dark:text-red-500' : 'text-slate-500'}`}>{trade.status}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => setViewingTrade(trade)}
                                            className="p-1.5 bg-white dark:bg-[#111111] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-700"
                                            title="View Trade"
                                            type="button"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => setEditingTrade(trade)}
                                            className="p-1.5 bg-white dark:bg-[#111111] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-700"
                                            title="Edit Trade"
                                            type="button"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(trade.id, e)}
                                            className="p-1.5 bg-white dark:bg-[#111111] hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-700"
                                            title="Delete Trade"
                                            type="button"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {editingTrade && (
            <AddTradeModal
                isOpen={!!editingTrade}
                onClose={() => setEditingTrade(null)}
                strategies={strategies}
                onSave={(trade) => {
                    onSave(trade);
                    setEditingTrade(null);
                }}
                initialData={editingTrade}
                formOptions={formOptions}
            />
        )}
        
        {viewingTrade && (
            <AddTradeModal
                isOpen={!!viewingTrade}
                onClose={() => setViewingTrade(null)}
                strategies={strategies}
                onSave={() => {}}
                initialData={viewingTrade}
                readOnly={true}
                formOptions={formOptions}
            />
        )}
    </div>
  );
};

export default CalendarView;