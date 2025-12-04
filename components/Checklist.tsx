import React, { useState, useEffect } from 'react';
import { ChecklistItem, Strategy, Trade, FormOptions } from '../types';
import { INITIAL_CHECKLIST } from '../constants';
import { RotateCcw, Save, AlertCircle } from 'lucide-react';
import AddTradeModal from './AddTradeModal';

interface ChecklistProps {
  onSaveTrade: (trade: Trade) => void;
  strategies: Strategy[];
  activeStrategy?: Strategy;
  formOptions: FormOptions;
}

const Checklist: React.FC<ChecklistProps> = ({ onSaveTrade, strategies, activeStrategy, formOptions }) => {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync checklist with Active Strategy
  useEffect(() => {
    if (activeStrategy) {
        const newItems: ChecklistItem[] = [];
        let idCounter = 1;

        activeStrategy.rules.analysis.forEach(rule => {
            newItems.push({ id: `auto-${idCounter++}`, label: rule, category: 'Analysis', group: 'Analysis', isChecked: false });
        });
        activeStrategy.rules.setup.forEach(rule => {
            newItems.push({ id: `auto-${idCounter++}`, label: rule, category: 'Setup', group: 'Setup', isChecked: false });
        });
        activeStrategy.rules.entry.forEach(rule => {
            newItems.push({ id: `auto-${idCounter++}`, label: rule, category: 'Entry', group: 'Entry', isChecked: false });
        });
        activeStrategy.rules.risk.forEach(rule => {
            newItems.push({ id: `auto-${idCounter++}`, label: rule, category: 'Risk', group: 'Risk Management', isChecked: false });
        });

        setItems(newItems);
    }
  }, [activeStrategy]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const resetChecklist = () => {
    setItems(items.map(item => ({ ...item, isChecked: false })));
  };

  const checkedCount = items.filter(i => i.isChecked).length;
  const totalCount = items.length;
  const totalPercentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Group items by their visual 'group' property
  const groups = Array.from(new Set(items.map(item => item.group))) as string[];

  // Calculate stats for summary
  const getCategoryPercentage = (cat: string) => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length === 0) return 0;
    const checked = catItems.filter(i => i.isChecked).length;
    return Math.round((checked / catItems.length) * 100);
  };

  const scoreCategories = ['Analysis', 'Setup', 'Entry', 'Risk'];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Trading Checklist
                {activeStrategy && (
                    <span className="text-sm font-normal px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
                        Active: {activeStrategy.title}
                    </span>
                )}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Complete your analysis before entering a trade</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button 
                onClick={resetChecklist}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <RotateCcw size={16} />
                Reset
            </button>
        </div>
      </div>

      {!activeStrategy && items.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl flex items-center gap-3 text-yellow-800 dark:text-yellow-400">
              <AlertCircle size={20} />
              <span>No active strategy selected. Please go to the Playbook and select an active strategy to populate the checklist.</span>
          </div>
      )}

      {/* Checklist Groups */}
      <div className="space-y-4">
        {groups.map(group => {
            const groupItems = items.filter(i => i.group === group);
            const groupChecked = groupItems.filter(i => i.isChecked).length;
            const groupTotal = groupItems.length;
            const groupPercentage = groupTotal > 0 ? Math.round((groupChecked / groupTotal) * 100) : 0;

            return (
                <div key={group} className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-[#111111] px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{group}</h3>
                        <span className={`text-sm font-bold ${groupPercentage === 100 ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {groupPercentage}%
                        </span>
                    </div>
                    
                    {/* Progress Bar Line */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1">
                        <div 
                            className={`h-full transition-all duration-500 ${groupPercentage === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: `${groupPercentage}%` }}
                        />
                    </div>

                    <div className="p-4 space-y-2">
                        {groupItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                    item.isChecked 
                                        ? 'bg-indigo-600 border-indigo-600' 
                                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-transparent'
                                }`}>
                                    {item.isChecked && (
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                
                                <span className={`${item.isChecked ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-500 dark:text-slate-400'} text-sm`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
      </div>

      {/* Summary / Score Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scoreCategories.map(cat => (
              <div key={cat} className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{cat}</span>
                  <span className={`text-2xl font-bold ${
                      getCategoryPercentage(cat) >= 100 ? 'text-green-600 dark:text-green-500' : 
                      getCategoryPercentage(cat) > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'
                  }`}>
                      {getCategoryPercentage(cat)}%
                  </span>
              </div>
          ))}
      </div>

      <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Overall Score</h3>
            <div className={`text-6xl font-bold mb-2 ${
                totalPercentage >= 80 ? 'text-green-600 dark:text-green-500' : totalPercentage >= 50 ? 'text-yellow-600 dark:text-yellow-500' : 'text-red-500'
            }`}>
                {totalPercentage}%
            </div>
            <p className="text-slate-600 dark:text-slate-400">
                {totalPercentage >= 80 ? 'Strong Setup' : totalPercentage >= 50 ? 'Moderate Setup' : 'Weak Setup'}
            </p>
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
      >
        <Save size={20} />
        Save Trade
      </button>

      <AddTradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        checklistScore={totalPercentage}
        strategies={strategies}
        activeStrategy={activeStrategy}
        onSave={(trade) => {
            onSaveTrade(trade);
            resetChecklist();
            setIsModalOpen(false);
        }}
        formOptions={formOptions}
      />
    </div>
  );
};

export default Checklist;