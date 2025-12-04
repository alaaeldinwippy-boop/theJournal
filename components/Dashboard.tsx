import React, { useState, useMemo } from 'react';
import { Trade, User } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Filter, ChevronDown, Trophy, XCircle, MinusCircle, Activity } from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
  user?: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ trades, user }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All Platforms');

  // Extract all unique platforms
  const allPlatforms = useMemo(() => {
    const platforms = new Set<string>();
    trades.forEach(trade => {
      if (trade.platform && Array.isArray(trade.platform)) {
        trade.platform.forEach(p => platforms.add(p));
      }
    });
    return Array.from(platforms).sort();
  }, [trades]);

  // Filter trades based on selection
  const filteredTrades = useMemo(() => {
    if (selectedPlatform === 'All Platforms') return trades;
    return trades.filter(t => t.platform && t.platform.includes(selectedPlatform));
  }, [trades, selectedPlatform]);

  // Calculate stats based on FILTERED trades
  const totalPnL = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);
  const winCount = filteredTrades.filter(t => t.status === 'WIN').length;
  const lossCount = filteredTrades.filter(t => t.status === 'LOSS').length;
  const beCount = filteredTrades.filter(t => t.status === 'BREAK_EVEN').length;
  const totalTrades = filteredTrades.length;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  
  const winningTrades = filteredTrades.filter(t => t.pnl > 0);
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((acc, t) => acc + t.pnl, 0) / winningTrades.length : 0;

  // Calculate Average R/R
  const tradesWithRR = filteredTrades.filter(t => t.riskReward && t.riskReward > 0);
  const avgRR = tradesWithRR.length > 0 
    ? tradesWithRR.reduce((acc, t) => acc + t.riskReward, 0) / tradesWithRR.length 
    : 0;

  // Prepare chart data (cumulative PnL) - Aggregated by Date for Accuracy
  const chartData = useMemo(() => {
    // 1. Group P&L by date
    const dailyMap = filteredTrades.reduce((acc, trade) => {
        const date = trade.date;
        acc[date] = (acc[date] || 0) + trade.pnl;
        return acc;
    }, {} as Record<string, number>);

    // 2. Sort dates chronologically
    const sortedDates = Object.keys(dailyMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // 3. Calculate cumulative line
    let cumulative = 0;
    const data = sortedDates.map(date => {
        cumulative += dailyMap[date];
        return {
            name: date,
            value: Number(cumulative.toFixed(2)),
            dailyPnL: dailyMap[date]
        };
    });

    // 4. Prepend Start point if we have data
    if (data.length > 0) {
        data.unshift({ name: 'Start', value: 0, dailyPnL: 0 });
    }
    return data;
  }, [filteredTrades]);

  // Calculate Platform Performance (memoized for performance)
  const platforms = useMemo(() => {
      const platformStats: Record<string, number> = {};
      trades.forEach(trade => {
        if (trade.platform && Array.isArray(trade.platform)) {
          trade.platform.forEach(plat => {
             if (!platformStats[plat]) platformStats[plat] = 0;
             platformStats[plat] += trade.pnl;
          });
        }
      });
      return Object.keys(platformStats)
        .map(plat => ({
            name: plat,
            pnl: platformStats[plat]
        }))
        .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const PLATFORM_COLORS = [
    'bg-indigo-500', 
    'bg-emerald-500', 
    'bg-amber-500', 
    'bg-rose-500', 
    'bg-purple-500', 
    'bg-cyan-500', 
    'bg-pink-500'
  ];

  // Pie chart data for outcomes
  const outcomeData = [
      { name: 'Wins', value: winCount, color: '#22c55e' },
      { name: 'Losses', value: lossCount, color: '#ef4444' },
      { name: 'Breakeven', value: beCount, color: '#94a3b8' }
  ].filter(d => d.value > 0);

  const StatCard = ({ title, value, subValue }: { title: string, value: string, subValue?: string }) => (
    <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center min-h-[140px]">
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{value}</h2>
      {subValue && (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{subValue}</span>
      )}
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            {user && (
                <p className="text-slate-500 dark:text-slate-400 mt-1 italic">
                    "{user.welcomeMessage || 'Here is your trading performance overview.'}"
                </p>
            )}
        </div>
        
        {/* Platform Filter */}
        <div className="relative group">
            <div className="flex items-center gap-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 cursor-pointer hover:border-indigo-500 transition-colors">
                <Filter size={16} className="text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[120px]">
                    {selectedPlatform}
                </span>
                <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
            </div>
            
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                    <button
                        onClick={() => setSelectedPlatform('All Platforms')}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            selectedPlatform === 'All Platforms' 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        type="button"
                    >
                        All Platforms
                    </button>
                    {allPlatforms.map(platform => (
                        <button
                            key={platform}
                            onClick={() => setSelectedPlatform(platform)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                selectedPlatform === platform 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                            type="button"
                        >
                            {platform}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
            title="TOTAL P&L" 
            value={`${totalPnL >= 0 ? '$' : '-$'}${Math.abs(totalPnL).toFixed(2)}`} 
        />
        <StatCard 
            title="WIN RATE" 
            value={`${winRate.toFixed(0)}%`} 
            subValue="Target: 60%"
        />
        <StatCard 
            title="AVG R/R" 
            value={`${avgRR.toFixed(2)}R`} 
            subValue="Target: 2.0R"
        />
        <StatCard 
            title="TOTAL TRADES" 
            value={totalTrades.toString()}
            subValue="Lifetime"
        />
        <StatCard 
            title="AVG WIN" 
            value={`$${avgWin.toFixed(0)}`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative P&L Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Net Cumulative P&L</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" vertical={false} opacity={0.1} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#64748b" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(str) => {
                                if (str === 'Start') return '';
                                try {
                                    const [y, m, d] = str.split('-').map(Number);
                                    return `${d}/${m}`;
                                } catch (e) {
                                    return str;
                                }
                            }}
                            minTickGap={30}
                        />
                        <YAxis 
                            stroke="#64748b" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                            itemStyle={{ color: '#818cf8' }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
                            labelFormatter={(label) => {
                                if (label === 'Start') return 'Start';
                                try {
                                    const [y, m, d] = label.split('-').map(Number);
                                    return `${d}/${m}/${y}`;
                                } catch(e) {
                                    return label;
                                }
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#6366f1" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPnL)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right Panel: Platform Performance OR Trade Outcomes */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                {selectedPlatform === 'All Platforms' ? 'Platform Performance' : 'Trade Outcomes'}
            </h3>
            
            {selectedPlatform === 'All Platforms' ? (
                // --- Platform Performance View ---
                platforms.length > 0 ? (
                    <div className="space-y-6">
                        {platforms.map((plat, index) => {
                            const colorClass = PLATFORM_COLORS[index % PLATFORM_COLORS.length];
                            const totalAbsPnl = platforms.reduce((acc, p) => acc + Math.abs(p.pnl), 0);
                            const widthPercentage = totalAbsPnl > 0 ? (Math.abs(plat.pnl) / totalAbsPnl) * 100 : 0;

                            return (
                                <div key={plat.name}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">{plat.name}</span>
                                        <span className={`font-bold ${plat.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {plat.pnl >= 0 ? '+' : '-'}${Math.abs(plat.pnl).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div 
                                            className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                                            style={{ width: `${Math.max(widthPercentage, 5)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 italic">
                        No platform data available
                    </div>
                )
            ) : (
                // --- Trade Outcomes View (Filtered by Platform) ---
                <div className="flex flex-col gap-6">
                     <div className="h-[240px] w-full min-h-[200px]">
                        {outcomeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={outcomeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {outcomeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                         contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                         itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600 italic">
                                No trades recorded
                            </div>
                        )}
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                    <Trophy size={18} />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Wins</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{winCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                                    <XCircle size={18} />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Losses</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{lossCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400">
                                    <MinusCircle size={18} />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Breakeven</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{beCount}</span>
                        </div>
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;