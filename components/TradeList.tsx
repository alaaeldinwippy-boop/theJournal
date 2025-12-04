import React, { useState, useMemo } from 'react';
import { Trade, Strategy, FormOptions } from '../types';
import { Edit2, Filter, Eye, X, Trash2, Plus } from 'lucide-react';
import AddTradeModal from './AddTradeModal';
import { getMindsetColor } from '../constants';

interface TradeListProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onSave: (trade: Trade) => void;
  onDelete: (id: string) => void;
  strategies: Strategy[];
  formOptions: FormOptions;
  onNavigate: (tab: string) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onSave, onDelete, strategies, formOptions, onNavigate }) => {
  const [filters, setFilters] = useState({
    instrument: '',
    status: '',
    strategy: '',
    platform: ''
  });
  const [showFilters, setShowFilters] = useState(false); // Used for desktop inline toggle
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // Used for mobile modal
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);

  const filteredTrades = useMemo(() => {
    return trades
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter(trade => {
          return (
              (!filters.instrument || trade.symbol === filters.instrument) &&
              (!filters.status || trade.status === filters.status) &&
              (!filters.strategy || trade.setup === filters.strategy) &&
              (!filters.platform || (trade.platform && trade.platform.includes(filters.platform)))
          );
      });
  }, [trades, filters]);

  const instruments = Array.from(new Set(trades.map(t => t.symbol)));
  const allPlatforms = Array.from(new Set(trades.flatMap(t => t.platform || [])));

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getExitDisplayPrice = (trade: Trade) => {
    if (trade.status === 'WIN') return trade.takeProfit;
    if (trade.status === 'LOSS') return trade.stopLoss;
    return trade.entryPrice; // Break even or Open
  };

  const clearFilters = () => {
      setFilters({
          instrument: '',
          status: '',
          strategy: '',
          platform: ''
      });
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTradeToDelete(id);
  };

  const confirmDelete = () => {
    if (tradeToDelete) {
        onDelete(tradeToDelete);
        setTradeToDelete(null);
    }
  };

  const FilterContent = () => (
      <>
        <div className="flex flex-col gap-1.5" title="Filter trades by financial instrument">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Instrument</label>
            <select 
                value={filters.instrument}
                onChange={(e) => setFilters({...filters, instrument: e.target.value})}
                className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 text-sm focus:border-indigo-500 outline-none"
            >
                <option value="">All Instruments</option>
                {instruments.map(inst => <option key={inst} value={inst}>{inst}</option>)}
            </select>
        </div>
        <div className="flex flex-col gap-1.5" title="Filter trades by outcome (Win, Loss, Breakeven)">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Outcome</label>
            <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 text-sm focus:border-indigo-500 outline-none"
            >
                <option value="">All Outcomes</option>
                <option value="WIN">Win</option>
                <option value="LOSS">Loss</option>
                <option value="BREAK_EVEN">Breakeven</option>
            </select>
        </div>
        <div className="flex flex-col gap-1.5" title="Filter trades by strategy used">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Strategy Type</label>
            <select 
                value={filters.strategy}
                onChange={(e) => setFilters({...filters, strategy: e.target.value})}
                className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 text-sm focus:border-indigo-500 outline-none"
            >
                <option value="">All Strategies</option>
                {strategies.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
            </select>
        </div>
        <div className="flex flex-col gap-1.5" title="Filter trades by trading platform">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Platform</label>
            <select 
                value={filters.platform}
                onChange={(e) => setFilters({...filters, platform: e.target.value})}
                className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 text-sm focus:border-indigo-500 outline-none"
            >
                <option value="">All Platforms</option>
                {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>
      </>
  );

  return (
    <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Journal</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage your trading history</p>
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={() => onNavigate('checklist')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20"
                    type="button"
                >
                    <Plus size={18} />
                    <span>Add Trade</span>
                </button>
                <button 
                    onClick={() => {
                        if (window.innerWidth < 768) {
                            setIsFilterModalOpen(true);
                        } else {
                            setShowFilters(!showFilters);
                        }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters || isFilterModalOpen ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    type="button"
                >
                    <Filter size={18} />
                    <span>Filter</span>
                </button>
            </div>
        </div>

        {/* Desktop Filter Bar */}
        {showFilters && (
            <div className="hidden md:grid bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid-cols-4 gap-4 animate-fade-in shadow-sm">
                <FilterContent />
            </div>
        )}

        {/* Mobile Filter Modal */}
        {isFilterModalOpen && (
             <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#111111] w-full max-w-lg rounded-t-xl sm:rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
                         <div className="flex items-center gap-2">
                             <button onClick={clearFilters} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium" type="button">Reset</button>
                            <button onClick={() => setIsFilterModalOpen(false)} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" type="button">
                                <X size={20} />
                            </button>
                         </div>
                    </div>
                    <div className="space-y-4">
                        <FilterContent />
                        <button 
                            onClick={() => setIsFilterModalOpen(false)}
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-colors"
                            type="button"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
             </div>
        )}

        <div className="grid gap-4">
            {filteredTrades.map((trade) => (
                <div key={trade.id} className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 dark:hover:border-indigo-500 transition-all shadow-sm group">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{trade.symbol}</h3>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${trade.direction === 'Long' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'}`}>
                                    {trade.direction}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${trade.status === 'WIN' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : trade.status === 'LOSS' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-white'}`}>
                                    {trade.status}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{trade.setup}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                                <div>
                                    <span className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Entry</span>
                                    <span className="text-slate-900 dark:text-white font-mono font-medium">${trade.entryPrice}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Exit</span>
                                    <span className="text-slate-900 dark:text-white font-mono font-medium">${getExitDisplayPrice(trade)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Date</span>
                                    <span className="text-slate-900 dark:text-white">{formatDate(trade.date)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Session</span>
                                    <span className="text-slate-900 dark:text-white">{trade.session}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 dark:text-slate-500 mb-1">Mindset</span>
                                    <span className={`font-medium ${getMindsetColor(trade.mindset)}`}>{trade.mindset || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end justify-between">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setViewingTrade(trade)}
                                    className="p-2 bg-slate-100 dark:bg-[#11141f] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
                                    title="View Trade"
                                    type="button"
                                >
                                    <Eye size={16} />
                                </button>
                                <button 
                                    onClick={() => setEditingTrade(trade)}
                                    className="p-2 bg-slate-100 dark:bg-[#11141f] hover:bg-slate-200 dark:hover:bg-indigo-600/20 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-700"
                                    title="Edit Trade"
                                    type="button"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={(e) => handleDeleteClick(trade.id, e)}
                                    className="p-2 bg-slate-100 dark:bg-[#11141f] hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-700"
                                    title="Delete Trade"
                                    type="button"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="mt-2">
                                <span className="block text-xs text-slate-500 dark:text-slate-500 mb-1 text-right">Realized P&L</span>
                                <span className={`text-2xl font-bold ${trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {trade.pnl > 0 ? '+' : trade.pnl < 0 ? '-' : ''}${Math.abs(trade.pnl).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {trade.notes && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 mr-2">Notes:</span>
                            {trade.notes}
                        </div>
                    )}
                </div>
            ))}
            
            {filteredTrades.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-500">
                    No trades found matching filters.
                </div>
            )}
        </div>

        {/* Delete Confirmation Modal */}
        {tradeToDelete && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Trade</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                Are you sure you want to delete this trade? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 w-full mt-2">
                            <button 
                                onClick={() => setTradeToDelete(null)}
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

        {/* Edit Modal */}
        {editingTrade && (
            <AddTradeModal
                isOpen={!!editingTrade}
                onClose={() => setEditingTrade(null)}
                strategies={strategies}
                onSave={onSave}
                initialData={editingTrade}
                formOptions={formOptions}
            />
        )}
        
        {/* View Modal (Read Only) */}
        {viewingTrade && (
            <AddTradeModal
                isOpen={!!viewingTrade}
                onClose={() => setViewingTrade(null)}
                strategies={strategies}
                onSave={() => {}} // No-op
                initialData={viewingTrade}
                readOnly={true}
                formOptions={formOptions}
            />
        )}
    </div>
  );
};

export default TradeList;