import React, { useState, useMemo } from 'react';
import { BookOpen, CheckCircle, Plus, Edit2, Check, Trash2, X, Activity } from 'lucide-react';
import { Strategy, Trade, StrategyRules } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const StrategyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: Strategy) => void;
  initialData?: Strategy | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Strategy>({
    id: '',
    title: '',
    winRate: '0%', 
    rules: { analysis: [], setup: [], entry: [], risk: [] },
    type: ''
  });
  
  const [newRuleInput, setNewRuleInput] = useState<{ [key in keyof StrategyRules]: string }>({
    analysis: '',
    setup: '',
    entry: '',
    risk: ''
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: '',
        title: '',
        winRate: '0%',
        rules: { analysis: [], setup: [], entry: [], risk: [] },
        type: ''
      });
    }
    setNewRuleInput({ analysis: '', setup: '', entry: '', risk: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddRule = (section: keyof StrategyRules) => {
    if (newRuleInput[section].trim()) {
      setFormData({ 
        ...formData, 
        rules: {
          ...formData.rules,
          [section]: [...formData.rules[section], newRuleInput[section].trim()]
        }
      });
      setNewRuleInput({ ...newRuleInput, [section]: '' });
    }
  };

  const handleRemoveRule = (section: keyof StrategyRules, index: number) => {
      // Confirmation removed here as requested by "remove all delete buttons functions" previously, 
      // but re-added later. Keeping it simple/robust with confirm.
      if (window.confirm("Are you sure you want to remove this rule?")) {
          const updatedRules = [...formData.rules[section]];
          updatedRules.splice(index, 1);
          setFormData({
              ...formData,
              rules: {
                  ...formData.rules,
                  [section]: updatedRules
              }
          });
      }
  };

  const handleSubmit = () => {
    onSave({ ...formData, id: formData.id || Math.random().toString(36).substr(2, 9) });
  };

  const renderSectionInput = (section: keyof StrategyRules, title: string) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-500 dark:text-slate-300">{title}</label>
      <div className="space-y-2 mb-2">
        {formData.rules[section].map((rule, idx) => (
          <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-[#11141f] p-2 rounded border border-slate-200 dark:border-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <CheckCircle size={14} className="text-indigo-500" /> {rule}
            </span>
             <button 
                onClick={() => handleRemoveRule(section, idx)}
                className="text-slate-400 hover:text-red-500 p-1"
                type="button"
                title="Remove Rule"
            >
                <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newRuleInput[section]} 
          onChange={(e) => setNewRuleInput({ ...newRuleInput, [section]: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleAddRule(section)}
          placeholder={`Add ${title.toLowerCase()} rule...`}
          className="flex-1 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-600 text-sm" 
        />
        <button 
          onClick={() => handleAddRule(section)}
          className="px-3 py-2 bg-slate-100 dark:bg-[#111111] border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-md transition-colors"
          type="button"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111111] w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Strategy' : 'New Strategy'}</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" type="button">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-300">Strategy Name</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Break & Retest" 
                className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-600 text-sm" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-300">Type</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none text-sm"
              >
                <option value="">Select type...</option>
                <option value="Trend Following">Trend Following</option>
                <option value="Reversal">Reversal</option>
                <option value="Range Bound">Range Bound</option>
                <option value="Scalping">Scalping</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {renderSectionInput('analysis', 'Analysis')}
            {renderSectionInput('setup', 'Setup')}
            {renderSectionInput('entry', 'Entry')}
            {renderSectionInput('risk', 'Risk Management')}
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-[#111111] rounded-b-xl">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" type="button">
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20"
                type="button"
            >
                Save Strategy
            </button>
        </div>
      </div>
    </div>
  );
};

interface PlaybookProps {
    strategies: Strategy[];
    setStrategies: React.Dispatch<React.SetStateAction<Strategy[]>>;
    trades: Trade[];
    onSetActive: (id: string) => void;
}

const Playbook: React.FC<PlaybookProps> = ({ strategies, setStrategies, trades, onSetActive }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);

  const handleEdit = (strategy: Strategy, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStrategy(strategy);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStrategyToDelete(id);
  };

  const confirmDelete = () => {
    if (strategyToDelete) {
        setStrategies(prev => prev.filter(s => s.id !== strategyToDelete));
        setStrategyToDelete(null);
    }
  };

  const handleSave = (strategy: Strategy) => {
    if (editingStrategy) {
      setStrategies(strategies.map(s => s.id === strategy.id ? { ...strategy, isActive: s.isActive } : s));
    } else {
      setStrategies([...strategies, strategy]);
    }
    setIsModalOpen(false);
    setEditingStrategy(null);
  };

  const handleNew = () => {
    setEditingStrategy(null);
    setIsModalOpen(true);
  };

  // Calculate win rate logic
  const calculateWinRate = (strategyTitle: string) => {
    const strategyTrades = trades.filter(t => t.setup === strategyTitle);
    if (strategyTrades.length === 0) return '0%';
    const winCount = strategyTrades.filter(t => t.status === 'WIN').length;
    return `${Math.round((winCount / strategyTrades.length) * 100)}%`;
  };

  // Sort strategies to ensure active one is first
  const sortedStrategies = useMemo(() => {
    return [...strategies].sort((a, b) => {
      if (a.isActive === b.isActive) return 0;
      return a.isActive ? -1 : 1;
    });
  }, [strategies]);

  // --- Strategy Analytics Logic ---
  const strategyPerformance = useMemo(() => {
    const stats = strategies.map(strategy => {
        const strategyTrades = trades.filter(t => t.setup === strategy.title);
        const count = strategyTrades.length;
        const wins = strategyTrades.filter(t => t.status === 'WIN').length;
        const totalPnL = strategyTrades.reduce((acc, t) => acc + t.pnl, 0);
        const avgPnL = count > 0 ? totalPnL / count : 0;
        const winRate = count > 0 ? (wins / count) * 100 : 0;

        return {
            id: strategy.id,
            title: strategy.title,
            count,
            wins,
            totalPnL,
            avgPnL,
            winRate
        };
    }).filter(s => s.count > 0).sort((a, b) => b.totalPnL - a.totalPnL);

    return stats;
  }, [strategies, trades]);

  const chartData = useMemo(() => {
    // Get distinct strategy names that have trades
    const activeStrategyNames = new Set(trades.map(t => t.setup));
    const activeStrategies = strategies.filter(s => activeStrategyNames.has(s.title));
    
    if (activeStrategies.length === 0) return [];

    // Filter relevant trades and sort by date
    const relevantTrades = trades
        .filter(t => activeStrategies.some(s => s.title === t.setup))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Create a Start point where everything is 0
    const startPoint: any = { date: 'Start', fullDate: 'Start' };
    activeStrategies.forEach(s => startPoint[s.title] = 0);
    
    const dataPoints: any[] = [startPoint];
    const runningPnL: Record<string, number> = {};
    activeStrategies.forEach(s => runningPnL[s.title] = 0);

    relevantTrades.forEach(trade => {
        if (runningPnL[trade.setup] !== undefined) {
            runningPnL[trade.setup] += trade.pnl;
            
            const point: any = { date: trade.date, fullDate: trade.date };
            // Snapshot current state of all strategies
            activeStrategies.forEach(s => {
                point[s.title] = runningPnL[s.title];
            });
            dataPoints.push(point);
        }
    });

    return dataPoints;
  }, [strategies, trades]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const renderRuleSection = (title: string, rules: string[]) => (
    <div className="mb-4 last:mb-0">
      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
      {rules.length > 0 ? (
        <ul className="space-y-1">
            {rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm">
                    <CheckCircle size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                    {rule}
                </li>
            ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-600 italic">No rules defined</p>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32">
         <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Strategy Playbook</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Document and refine your trading edges</p>
            </div>
            <button 
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
              type="button"
            >
                <Plus size={18} />
                <span>New Strategy</span>
            </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 mb-12">
            {sortedStrategies.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl border-dashed">
                    <BookOpen size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-300">No Strategies Yet</h3>
                    <p className="text-slate-500 dark:text-slate-500 mt-2 mb-6">Create your first strategy to start tracking your edge.</p>
                    <button 
                        onClick={handleNew}
                        className="px-4 py-2 bg-slate-100 dark:bg-[#11141f] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        type="button"
                    >
                        Create Strategy
                    </button>
                </div>
            ) : (
                sortedStrategies.map((strat) => (
                    <div 
                        key={strat.id} 
                        className={`bg-white dark:bg-[#111111] border rounded-xl p-6 transition-all duration-200 group relative shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500 flex flex-col ${
                            strat.isActive 
                                ? 'border-green-500 ring-1 ring-green-500 dark:border-green-500 dark:ring-green-500 hover:ring-indigo-500 dark:hover:ring-indigo-500 hover:border-indigo-500 dark:hover:border-indigo-500' 
                                : 'border-slate-200 dark:border-slate-800'
                        }`}
                    >
                        <div className="absolute top-6 right-6 flex gap-2">
                             {strat.isActive ? (
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded border border-green-200 dark:border-green-800">
                                    <Check size={12} /> Active
                                </span>
                             ) : (
                                <button
                                    onClick={() => onSetActive(strat.id)}
                                    className="px-2 py-1 bg-slate-100 dark:bg-[#11141f] hover:bg-green-100 dark:hover:bg-green-900/20 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-800 transition-colors"
                                    type="button"
                                >
                                    Set Active
                                </button>
                             )}
                        </div>

                        <div className="flex justify-between items-start mb-4 pr-32">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {strat.title}
                                </h2>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded mt-2 inline-block border border-indigo-100 dark:border-indigo-500/20">{strat.type}</span>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-[#0D0D0D] rounded-lg p-5 border border-slate-200 dark:border-slate-800/50 mb-4 flex-1">
                            {renderRuleSection('Analysis', strat.rules.analysis)}
                            {renderRuleSection('Setup', strat.rules.setup)}
                            {renderRuleSection('Entry', strat.rules.entry)}
                            {renderRuleSection('Risk Management', strat.rules.risk)}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500">Win Rate:</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{calculateWinRate(strat.title)}</span>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => handleEdit(strat, e)}
                                    className="p-2 bg-slate-100 dark:bg-[#11141f] hover:bg-indigo-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
                                    title="Edit Strategy"
                                    type="button"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={(e) => handleDeleteClick(strat.id, e)}
                                    className="p-2 bg-slate-100 dark:bg-[#11141f] hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-700"
                                    title="Delete Strategy"
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Strategy Performance Section */}
        {strategyPerformance.length > 0 && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom duration-500">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Strategy Performance Analytics</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cumulative P&L Over Time</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            if (val === 'Start') return '';
                                            const d = new Date(val);
                                            return `${d.getDate()}/${d.getMonth()+1}`;
                                        }}
                                    />
                                    <YAxis 
                                        stroke="#64748b" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                        labelFormatter={(label) => label === 'Start' ? 'Start' : new Date(label).toLocaleDateString()}
                                    />
                                    <Legend />
                                    {strategies.filter(s => chartData.some(d => d[s.title] !== undefined && d[s.title] !== null)).map((s, idx) => (
                                        <Line 
                                            key={s.id}
                                            type="monotone" 
                                            dataKey={s.title} 
                                            stroke={COLORS[idx % COLORS.length]} 
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {strategyPerformance.map((stat, idx) => (
                            <div key={stat.id} className="bg-white dark:bg-[#111111] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{stat.title}</h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${stat.winRate >= 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                        {stat.winRate.toFixed(0)}% WR
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-500 uppercase">Net P&L</div>
                                        <div className={`font-bold ${stat.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {stat.totalPnL >= 0 ? '+' : '-'}${Math.abs(stat.totalPnL).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 dark:text-slate-500 uppercase">Trades</div>
                                        <div className="font-bold text-slate-900 dark:text-white">{stat.count}</div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-xs text-slate-500">Avg Trade</span>
                                    <span className={`text-sm font-bold ${stat.avgPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {stat.avgPnL >= 0 ? '+' : '-'}${Math.abs(stat.avgPnL).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {strategyToDelete && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Strategy</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                Are you sure you want to delete this strategy? This will remove all associated rules.
                            </p>
                        </div>
                        <div className="flex gap-3 w-full mt-2">
                            <button 
                                onClick={() => setStrategyToDelete(null)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                                type="button"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <StrategyModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            initialData={editingStrategy}
        />
    </div>
  );
};

export default Playbook;