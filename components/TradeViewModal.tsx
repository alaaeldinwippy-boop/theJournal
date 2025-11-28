import React from 'react';
import { Trade, Outcome } from '../types';
import { X } from 'lucide-react';

interface TradeViewModalProps {
  trade: Trade | null;
  onClose: () => void;
}

const TradeViewModal: React.FC<TradeViewModalProps> = ({ trade, onClose }) => {
  if (!trade) return null;

  let displayPnL = 0;
  if (trade.realizedPnL !== undefined && trade.realizedPnL !== null) {
    displayPnL = trade.realizedPnL;
  } else {
    if (trade.outcome === Outcome.WIN) displayPnL = 100 * (trade.riskReward || 2);
    else if (trade.outcome === Outcome.LOSS) displayPnL = -100;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-custom-panel border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{trade.instrument}</h2>
            <span className="text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{trade.direction}</span>
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
              trade.outcome === Outcome.WIN ? 'bg-blue-600 text-white' :
              trade.outcome === Outcome.LOSS ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {trade.outcome}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Entry</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{trade.entryPrice}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">Exit</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {trade.outcome === Outcome.WIN ? trade.takeProfitPrice : trade.outcome === Outcome.LOSS ? trade.stopLevelPrice : trade.takeProfitPrice}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">R/R</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{trade.riskReward.toFixed(2)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">P&L</div>
              <div className={`text-lg font-bold ${displayPnL > 0 ? 'text-emerald-500 dark:text-emerald-400' : displayPnL < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'}`}>
                {displayPnL > 0 ? '+' : ''}${displayPnL.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date</label>
              <p className="text-sm text-slate-900 dark:text-white mt-1">
                {new Date(trade.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Timeframe</label>
              <p className="text-sm text-slate-900 dark:text-white mt-1">{trade.timeframe}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Session</label>
              <p className="text-sm text-slate-900 dark:text-white mt-1">{trade.session}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Mindset</label>
              <p className="text-sm text-slate-900 dark:text-white mt-1">{trade.mindset}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Checklist Score</label>
              <p className="text-sm text-slate-900 dark:text-white mt-1">{trade.checklistScore}%</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Followed Plan</label>
              <p className="text-sm text-slate-900 dark:text-white mt-1">{trade.followedPlan ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Setups & Confluences */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Setups</label>
              <div className="flex flex-wrap gap-2">
                {trade.setups && trade.setups.length > 0 ? (
                  trade.setups.map(setup => (
                    <span key={setup} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {setup}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">None</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Confluences</label>
              <div className="flex flex-wrap gap-2">
                {trade.confluences && trade.confluences.length > 0 ? (
                  trade.confluences.map(confluence => (
                    <span key={confluence} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                      {confluence}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {trade.platform && trade.platform.length > 0 ? (
                trade.platform.map(p => (
                  <span key={p} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">None</span>
              )}
            </div>
          </div>

          {/* Notes */}
          {trade.notes && (
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Notes</label>
              <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg">
                {trade.notes}
              </p>
            </div>
          )}

          {/* Image */}
          {trade.imageUrl && (
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Screenshot</label>
              <img src={trade.imageUrl} alt="Trade screenshot" className="w-full rounded-lg border border-slate-200 dark:border-slate-700" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeViewModal;
