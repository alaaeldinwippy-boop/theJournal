import React, { useState, useMemo } from 'react';
import { Trade, Outcome } from '../types';
import { Trash2, Edit, X, Filter } from 'lucide-react';
import { INSTRUMENT_OPTIONS, OUTCOME_OPTIONS } from '../constants';

interface TradesListProps {
  trades: Trade[];
  onDeleteTrade?: (id: string) => void;
  onAddTrade: () => void;
  onEditTrade: (trade: Trade) => void;
}

const TradesList: React.FC<TradesListProps> = ({ trades, onDeleteTrade, onAddTrade, onEditTrade }) => {
  const [filterInstrument, setFilterInstrument] = useState<string>('All');
  const [filterOutcome, setFilterOutcome] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
        const matchInstrument = filterInstrument === 'All' || trade.instrument === filterInstrument;
        const matchOutcome = filterOutcome === 'All' || trade.outcome === filterOutcome;
        
        let matchDate = true;
        if (startDate) {
            matchDate = matchDate && new Date(trade.date) >= new Date(startDate);
        }
        if (endDate) {
            matchDate = matchDate && new Date(trade.date) <= new Date(endDate);
        }

        return matchInstrument && matchOutcome && matchDate;
    });
  }, [trades, filterInstrument, filterOutcome, startDate, endDate]);

  const sortedTrades = useMemo(() => {
      return [...filteredTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTrades]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  }

  const confirmDelete = () => {
    if(deleteId && onDeleteTrade) {
        onDeleteTrade(deleteId);
        setDeleteId(null);
    }
  }

  const clearFilters = () => {
      setFilterInstrument('All');
      setFilterOutcome('All');
      setStartDate('');
      setEndDate('');
  }

  const hasActiveFilters = filterInstrument !== 'All' || filterOutcome !== 'All' || startDate !== '' || endDate !== '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Trades</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">View and manage your trading history</p>
        </div>
        <button onClick={onAddTrade} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
            + Add Trade
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-bold text-sm">
            <Filter size={16} />
            Filters
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Instrument Filter */}
            <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Instrument</label>
                <div className="relative">
                    <select 
                        value={filterInstrument} 
                        onChange={(e) => setFilterInstrument(e.target.value)}
                        className="w-full md:w-40 bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                        <option value="All">All Instruments</option>
                        {INSTRUMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            {/* Outcome Filter */}
            <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Outcome</label>
                <div className="relative">
                    <select 
                        value={filterOutcome} 
                        onChange={(e) => setFilterOutcome(e.target.value)}
                        className="w-full md:w-40 bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                        <option value="All">All Outcomes</option>
                        {OUTCOME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            {/* Date Range */}
            <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">From Date</label>
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
            
            <div className="w-full md:w-auto">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">To Date</label>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
                <div className="w-full md:w-auto flex-1 flex justify-end md:justify-start">
                    <button 
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors text-sm font-medium"
                    >
                        <X size={16} />
                        Clear
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="space-y-4">
        {sortedTrades.map(trade => {
             let displayPnL = 0;
             if (trade.realizedPnL !== undefined && trade.realizedPnL !== null) {
                 displayPnL = trade.realizedPnL;
             } else {
                  if (trade.outcome === Outcome.WIN) displayPnL = 100 * (trade.riskReward || 2);
                  else if (trade.outcome === Outcome.LOSS) displayPnL = -100;
             }

             return (
            <div key={trade.id} className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white">{trade.instrument}</h3>
                             <span className="text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{trade.direction}</span>
                             <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                                 trade.outcome === Outcome.WIN ? 'bg-blue-600 text-white' : 
                                 trade.outcome === Outcome.LOSS ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                             }`}>
                                 {trade.outcome}
                             </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                            <div>Entry <span className="text-slate-800 dark:text-slate-200 font-mono ml-2">{trade.entryPrice}</span></div>
                            <div>Exit <span className="text-slate-800 dark:text-slate-200 font-mono ml-2">{trade.takeProfitPrice}</span></div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                             {/* Display platforms as tags */}
                             {trade.platform && trade.platform.map(p => (
                                 <span key={p} className="text-[10px] text-slate-500 bg-slate-50 dark:bg-custom-main border border-slate-200 dark:border-slate-800 px-2 py-1 rounded">{p}</span>
                             ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end justify-center min-w-[120px]">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">P&L</div>
                        <div className={`text-2xl font-bold ${
                            displayPnL > 0 ? 'text-emerald-500 dark:text-emerald-400' : 
                            displayPnL < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'
                        }`}>
                            {displayPnL > 0 ? '+' : ''}${Math.abs(displayPnL).toFixed(2)}
                        </div>
                    </div>
                </div>

                {trade.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
                        <span className="text-slate-400 text-xs block mb-1 uppercase">Notes</span>
                        <span className="text-slate-600 dark:text-slate-300">{trade.notes}</span>
                    </div>
                )}
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={() => onEditTrade(trade)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors">
                        <Edit size={16} />
                     </button>
                     <button onClick={() => handleDeleteClick(trade.id)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-colors">
                        <Trash2 size={16} />
                     </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                     <span>{new Date(trade.date).toLocaleString()}</span>
                     <span>•</span>
                     <span>{trade.timeframe}</span>
                </div>
            </div>
        )})}
        {sortedTrades.length === 0 && (
            <div className="text-center py-20 text-slate-500 bg-slate-50 dark:bg-custom-panel/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                {hasActiveFilters ? 'No trades match your filters.' : 'No trades found.'}
            </div>
        )}
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

export default TradesList;