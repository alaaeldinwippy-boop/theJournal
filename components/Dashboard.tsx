import React, { useMemo, useState } from 'react';
import { Trade, Outcome } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DashboardProps {
  trades: Trade[];
  onAddTrade: () => void;
  onDeleteTrade?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ trades, onAddTrade, onDeleteTrade }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.outcome === Outcome.WIN).length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    
    let totalPnL = 0;
    let winPnL = 0;
    let totalRR = 0;
    
    trades.forEach(t => {
        // Use realized PnL if available, otherwise fallback to estimation logic
        let tradePnL = 0;
        
        if (t.realizedPnL !== undefined && t.realizedPnL !== null) {
            tradePnL = t.realizedPnL;
        } else {
             // Fallback estimation
             if (t.outcome === Outcome.WIN) tradePnL = 100 * (t.riskReward || 2);
             else if (t.outcome === Outcome.LOSS) tradePnL = -100;
        }
        
        totalPnL += tradePnL;

        if (t.outcome === Outcome.WIN) {
             winPnL += tradePnL;
             totalRR += (t.riskReward || 0);
        }
    });

    const avgWin = wins > 0 ? winPnL / wins : 0;
    const avgRR = wins > 0 ? totalRR / wins : 0;

    return { totalTrades, winRate, totalPnL, avgWin, avgRR };
  }, [trades]);

  const chartData = useMemo(() => {
    // Sort trades by date
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;

    if (sorted.length === 0) return [];

    const data = sorted.map(t => {
        let pnl = 0;
        if (t.realizedPnL !== undefined && t.realizedPnL !== null) {
            pnl = t.realizedPnL;
        } else {
            if (t.outcome === Outcome.WIN) pnl = 100 * (t.riskReward || 2);
            else if (t.outcome === Outcome.LOSS) pnl = -100;
        }

        cumulative += pnl;
        return {
            date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            fullDate: t.date,
            value: cumulative,
            pnl: pnl,
            isPositive: cumulative >= 0
        };
    });

    // Add a starting point if desired, or just show trades
    return [{ date: 'Start', value: 0, pnl: 0, fullDate: '', isPositive: true }, ...data];
  }, [trades]);

  const recentTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  }

  const confirmDelete = () => {
    if (deleteId && onDeleteTrade) {
        onDeleteTrade(deleteId);
        setDeleteId(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Track your trading performance</p>
        </div>
        <button onClick={onAddTrade} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20">
            <Plus size={18} />
            Add Trade
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
            label="Total P&L" 
            value={`$${stats.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            subValue="" 
            subColor="text-emerald-500 dark:text-emerald-400"
            positive={stats.totalPnL >= 0}
        />
        <StatCard 
            label="Win Rate" 
            value={`${stats.winRate.toFixed(0)}%`} 
            subValue="Target: 60%"
            subColor="text-slate-500"
        />
        <StatCard 
            label="Avg R/R" 
            value={`${stats.avgRR.toFixed(2)}R`} 
            subValue="Target: 2.0R"
            subColor="text-slate-500"
        />
        <StatCard 
            label="Total Trades" 
            value={stats.totalTrades.toString()} 
            subValue="Lifetime"
            subColor="text-slate-500"
        />
        <StatCard 
            label="Avg Win" 
            value={`$${stats.avgWin.toFixed(0)}`} 
            subValue=""
            subColor="text-emerald-500 dark:text-emerald-400" 
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance Curve</h3>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={{fill: '#64748b', fontSize: 12}}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{fill: '#64748b', fontSize: 12}}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#10b981' }}
                        formatter={(value: number) => {
                            const color = value >= 0 ? '#10b981' : '#ef4444';
                            return [`$${value.toFixed(2)}`, 'Cumulative P&L'];
                        }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPositive)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Trades List */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Trades</h3>
        <div className="space-y-3">
            {recentTrades.length === 0 && (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
                    No trades yet. Start by adding one!
                </div>
            )}
            {recentTrades.map(trade => {
                let displayPnL = 0;
                if (trade.realizedPnL !== undefined && trade.realizedPnL !== null) {
                    displayPnL = trade.realizedPnL;
                } else {
                     if (trade.outcome === Outcome.WIN) displayPnL = 100 * (trade.riskReward || 2);
                     else if (trade.outcome === Outcome.LOSS) displayPnL = -100;
                }

                return (
                <div key={trade.id} className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all group shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        
                        {/* Left: Instrument & Tags */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs">
                                {trade.instrument.substring(0,3)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white">{trade.instrument}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${trade.direction === 'Long' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                                        {trade.direction}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                        trade.outcome === 'Win' ? 'bg-blue-500 text-white' : 
                                        trade.outcome === 'Loss' ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}>
                                        {trade.outcome}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-4">
                                    <span>Entry <span className="text-slate-700 dark:text-slate-200">{trade.entryPrice}</span></span>
                                    {trade.takeProfitPrice > 0 && <span>Exit <span className="text-slate-700 dark:text-slate-200">{trade.takeProfitPrice}</span></span>}
                                </div>
                            </div>
                        </div>

                        {/* Middle: P&L */}
                        <div className="flex flex-col md:items-end">
                             <div className="text-xs text-slate-500 mb-1">P&L</div>
                             <div className={`text-xl font-bold ${
                                 displayPnL > 0 ? 'text-emerald-500 dark:text-emerald-400' : 
                                 displayPnL < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'
                             }`}>
                                 {displayPnL > 0 ? '+' : ''}${Math.abs(displayPnL).toFixed(2)}
                             </div>
                        </div>
                    </div>

                    {/* Footer: Notes & Date */}
                    {trade.notes && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                                "{trade.notes}"
                            </p>
                            <div className="flex items-center gap-4 shrink-0">
                                <span className="text-xs text-slate-500 dark:text-slate-600">{new Date(trade.date).toLocaleString()}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeleteClick(trade.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                );
            })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Trade?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Are you sure you want to delete this trade? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => setDeleteId(null)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, subValue, subColor, positive }: any) => (
    <div className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-sm">
        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</h3>
        <div className={`text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight`}>
            {value}
        </div>
        {subValue && (
            <div className={`text-xs font-bold ${subColor}`}>
                {subValue}
            </div>
        )}
    </div>
);

export default Dashboard;