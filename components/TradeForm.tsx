import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trade, Platform, Session, Timeframe, Instrument, Direction, 
  Outcome, Setup, Confluence, Mindset, ChecklistItem 
} from '../types';
import { 
  CHECKLIST_ITEMS, TOTAL_WEIGHT, PLATFORM_OPTIONS, SESSION_OPTIONS, 
  TIMEFRAME_OPTIONS, INSTRUMENT_OPTIONS, DIRECTION_OPTIONS, OUTCOME_OPTIONS, 
  SETUP_OPTIONS, CONFLUENCE_OPTIONS, MINDSET_OPTIONS 
} from '../constants';
import { Save, RefreshCw, Upload, Check, X, ChevronDown, Plus, Trash2, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TradeFormProps {
  onSave: (trade: Trade) => void;
  onCancel: () => void;
  initialData?: Trade | null;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSave, onCancel, initialData }) => {
  // Form State
  const [formData, setFormData] = useState<Partial<Trade>>({
    date: new Date().toISOString().split('T')[0],
    platform: [],
    session: '' as unknown as Session,
    timeframe: '' as unknown as Timeframe,
    instrument: '' as unknown as Instrument,
    direction: '' as unknown as Direction,
    entryPrice: 0,
    takeProfitPrice: 0,
    stopLevelPrice: 0,
    points: 0,
    outcome: '' as unknown as Outcome,
    riskReward: 0,
    realizedPnL: 0,
    setups: [],
    confluences: [],
    mindset: '' as unknown as Mindset,
    followedPlan: true,
    notes: '',
    checklistData: {},
    imageUrl: '',
  });

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(CHECKLIST_ITEMS);
  const [editingItem, setEditingItem] = useState<{ id: string; label: string; category: string } | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setChecklist(initialData.checklistData || {});
    }
  }, [initialData]);

  // Calculate RR automatically
  useEffect(() => {
    const { entryPrice, takeProfitPrice, stopLevelPrice, direction } = formData;
    if (entryPrice && takeProfitPrice && stopLevelPrice) {
      let rr = 0;
      let points = 0;
      if (direction === Direction.LONG) {
        const risk = entryPrice - stopLevelPrice;
        const reward = takeProfitPrice - entryPrice;
        points = reward;
        if (risk > 0) rr = reward / risk;
      } else {
        const risk = stopLevelPrice - entryPrice;
        const reward = entryPrice - takeProfitPrice;
        points = reward;
        if (risk > 0) rr = reward / risk;
      }
      setFormData(prev => ({ ...prev, riskReward: parseFloat(rr.toFixed(2)), points: parseFloat(points.toFixed(2)) }));
    }
  }, [formData.entryPrice, formData.takeProfitPrice, formData.stopLevelPrice, formData.direction]);

  const checklistScore = useMemo(() => {
    let currentWeight = 0;
    CHECKLIST_ITEMS.forEach(item => {
      if (checklist[item.id]) {
        currentWeight += item.weight;
      }
    });
    return Math.round((currentWeight / TOTAL_WEIGHT) * 100);
  }, [checklist]);

  useEffect(() => {
    if (checklistScore >= 75) {
      setFormData(prev => ({ ...prev, followedPlan: true }));
    } else {
      setFormData(prev => ({ ...prev, followedPlan: false }));
    }
  }, [checklistScore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | boolean = value;
    if (type === 'number') parsedValue = parseFloat(value);
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
        return;
    }
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleMultiSelect = (field: 'setups' | 'confluences' | 'platform', value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddChecklistItem = () => {
    if (newItemLabel.trim() && newItemCategory.trim()) {
      const newItem: ChecklistItem = {
        id: `custom_${uuidv4()}`,
        label: newItemLabel,
        weight: 5,
        category: newItemCategory,
      };
      setChecklistItems([...checklistItems, newItem]);
      setNewItemLabel('');
      setNewItemCategory('');
      setShowAddItemModal(false);
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
    setChecklist(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleUpdateChecklistItem = (id: string, newLabel: string) => {
    setChecklistItems(checklistItems.map(item =>
      item.id === id ? { ...item, label: newLabel } : item
    ));
    setEditingItem(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setChecklist({});
    setFormData({
      date: new Date().toISOString().split('T')[0],
      platform: [],
      session: '' as unknown as Session,
      timeframe: '' as unknown as Timeframe,
      instrument: '' as unknown as Instrument,
      direction: '' as unknown as Direction,
      entryPrice: 0,
      takeProfitPrice: 0,
      stopLevelPrice: 0,
      points: 0,
      outcome: '' as unknown as Outcome,
      riskReward: 0,
      realizedPnL: 0,
      setups: [],
      confluences: [],
      mindset: '' as unknown as Mindset,
      followedPlan: true,
      notes: '',
      imageUrl: '',
    });
    setShowSaveModal(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trade: Trade = {
      ...formData as Trade,
      id: initialData?.id || uuidv4(),
      checklistData: checklist,
      checklistScore: checklistScore,
    };
    onSave(trade);
    if(!initialData) handleReset();
  };

  const groupedChecklist = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {};
    checklistItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [checklistItems]);

  const getCategoryPercentage = (categoryItems: ChecklistItem[]) => {
    const total = categoryItems.reduce((acc, i) => acc + i.weight, 0);
    const current = categoryItems.reduce((acc, i) => checklist[i.id] ? acc + i.weight : acc, 0);
    return Math.round((current / total) * 100);
  };

  const categoryScores = useMemo(() => {
      return Object.entries(groupedChecklist).map(([category, items]) => {
          const percent = getCategoryPercentage(items as ChecklistItem[]);
          let label = 'OTHER';
          if (category.includes('Trend')) label = 'ANALYSIS';
          else if (category.includes('Setup')) label = 'SETUP';
          else if (category.includes('Micro MSS')) label = 'ENTRY';
          else if (category.includes('Risk')) label = 'RISK';
          else label = category.split(' ')[0].toUpperCase();

          return { label, percent };
      });
  }, [groupedChecklist, checklist]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trading Checklist</h2>
            <p className="text-slate-500 dark:text-slate-400">Complete your analysis before entering a trade</p>
         </div>
         <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-custom-panel border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
         >
            <RefreshCw size={14} />
            Reset
         </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar space-y-4">
        {Object.entries(groupedChecklist).map(([category, items]) => {
           const percent = getCategoryPercentage(items as ChecklistItem[]);
           return (
            <div key={category} className="bg-white dark:bg-custom-panel rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{category}</h3>
                    <span className={`text-sm font-bold ${percent === 100 ? 'text-emerald-500 dark:text-emerald-400' : 'text-blue-500 dark:text-blue-400'}`}>{percent}%</span>
                </div>
                <div className="p-2 space-y-1">
                    {(items as ChecklistItem[]).map(item => (
                        <div
                            key={item.id}
                            className="flex items-center p-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg group transition-colors"
                        >
                            <button
                                onClick={() => toggleChecklistItem(item.id)}
                                className="flex-shrink-0 cursor-pointer"
                            >
                                <div className={`
                                    w-5 h-5 rounded border mr-4 flex items-center justify-center transition-all
                                    ${checklist[item.id] ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500 bg-white dark:bg-transparent'}
                                `}>
                                    {checklist[item.id] && <Check size={14} className="text-white" />}
                                </div>
                            </button>
                            {editingItem?.id === item.id ? (
                                <input
                                    type="text"
                                    value={editingItem.label}
                                    onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                                    onBlur={() => handleUpdateChecklistItem(item.id, editingItem.label)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateChecklistItem(item.id, editingItem.label);
                                        if (e.key === 'Escape') setEditingItem(null);
                                    }}
                                    autoFocus
                                    className="flex-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded px-2 py-1 text-sm text-slate-900 dark:text-white outline-none"
                                />
                            ) : (
                                <span className={`flex-1 cursor-pointer ${checklist[item.id] ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'} text-sm font-medium transition-colors`}>
                                    {item.label}
                                </span>
                            )}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                    onClick={() => setEditingItem({ id: item.id, label: item.label, category: item.category })}
                                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleRemoveChecklistItem(item.id)}
                                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
           );
        })}

        {/* Add New Checklist Item Button */}
        <button
          onClick={() => setShowAddItemModal(true)}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <Plus size={16} />
          Add Checklist Item
        </button>

        {/* Score Dashboard matching the image design */}
        <div className="mt-8 space-y-4">
            <div className="grid grid-cols-4 gap-4">
                {categoryScores.map((cat) => (
                    <div key={cat.label} className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{cat.label}</span>
                        <span className={`text-2xl font-bold ${
                            cat.percent >= 100 ? 'text-emerald-500' : 
                            cat.percent > 0 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                            {cat.percent}%
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">TOTAL OVERALL SCORE</span>
                <span className={`text-7xl font-black mb-3 leading-none ${
                    checklistScore >= 80 ? 'text-emerald-500' : 
                    checklistScore >= 50 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                    {checklistScore}%
                </span>
                <span className={`text-lg font-medium ${
                    checklistScore >= 80 ? 'text-emerald-500 dark:text-emerald-400' : 
                    checklistScore >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'
                }`}>
                    {checklistScore >= 80 ? 'Excellent Setup' : checklistScore >= 50 ? 'Moderate Setup' : 'Weak Setup'}
                </span>
            </div>

            {/* Save Button (Not floating anymore) */}
            <button 
                onClick={() => setShowSaveModal(true)}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/40 transition-all hover:translate-y-[-2px]"
            >
                <Save size={20} />
                Save Trade
            </button>
        </div>
      </div>

      {/* Trade Details Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 md:p-8">
            <div className="bg-white dark:bg-custom-panel w-full max-w-5xl max-h-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-custom-panel shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Trade</h2>
                    <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 custom-scrollbar flex-1">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Platform</label>
                            <div className="relative">
                                <select
                                    value=""
                                    onChange={(e) => handleMultiSelect('platform', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select platforms...</option>
                                    {PLATFORM_OPTIONS.map(opt => (
                                        <option key={opt} value={opt} disabled={formData.platform?.includes(opt)}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                            {formData.platform && formData.platform.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.platform.map(p => (
                                        <span key={p} className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs px-2 py-1 rounded flex items-center gap-1">
                                            {p}
                                            <button type="button" onClick={() => handleMultiSelect('platform', p)} className="hover:text-blue-800 dark:hover:text-blue-300"><X size={12}/></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Session</label>
                            <div className="relative">
                                <select
                                    name="session"
                                    value={formData.session || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select session</option>
                                    {SESSION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Timeframe</label>
                            <div className="relative">
                                <select
                                    name="timeframe"
                                    value={formData.timeframe || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select timeframe</option>
                                    {TIMEFRAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Instrument</label>
                            <div className="relative">
                                <select
                                    name="instrument"
                                    value={formData.instrument || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select instrument</option>
                                    {INSTRUMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Direction</label>
                            <div className="relative">
                                <select
                                    name="direction"
                                    value={formData.direction || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select direction</option>
                                    {DIRECTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Entry Price</label>
                            <input
                                type="number"
                                step="0.00001"
                                name="entryPrice"
                                value={formData.entryPrice || ''}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Take Profit Price</label>
                            <input
                                type="number"
                                step="0.00001"
                                name="takeProfitPrice"
                                value={formData.takeProfitPrice || ''}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Stop Level Price</label>
                            <input
                                type="number"
                                step="0.00001"
                                name="stopLevelPrice"
                                value={formData.stopLevelPrice || ''}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Points</label>
                            <input
                                type="number"
                                step="0.01"
                                name="points"
                                value={formData.points || ''}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Outcome</label>
                            <div className="relative">
                                <select
                                    name="outcome"
                                    value={formData.outcome || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select outcome</option>
                                    {OUTCOME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Risk/Reward</label>
                            <input
                                type="number"
                                readOnly
                                value={formData.riskReward || 0}
                                className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                            />
                        </div>
                    </div>

                    {/* Row 5: Realized P&L */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Realized P&L</label>
                            <input
                                type="number"
                                step="0.01"
                                name="realizedPnL"
                                value={formData.realizedPnL || ''}
                                onChange={handleInputChange}
                                className={`w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-bold outline-none transition-all ${
                                    (formData.realizedPnL || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 
                                    (formData.realizedPnL || 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-200'
                                }`}
                            />
                        </div>
                    </div>

                    {/* Setups and Confluences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Setup</label>
                            <div className="relative">
                                <select
                                    value=""
                                    onChange={(e) => handleMultiSelect('setups', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select setups...</option>
                                    {SETUP_OPTIONS.map(opt => (
                                        <option key={opt} value={opt} disabled={formData.setups?.includes(opt)}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                            {formData.setups && formData.setups.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.setups.map(s => (
                                        <span key={s} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2 py-1 rounded flex items-center gap-1">
                                            {s}
                                            <button type="button" onClick={() => handleMultiSelect('setups', s)} className="hover:text-emerald-800 dark:hover:text-emerald-300"><X size={12}/></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Confluences</label>
                            <div className="relative">
                                <select
                                    value=""
                                    onChange={(e) => handleMultiSelect('confluences', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select confluences...</option>
                                    {CONFLUENCE_OPTIONS.map(opt => (
                                        <option key={opt} value={opt} disabled={formData.confluences?.includes(opt)}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                            {formData.confluences && formData.confluences.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.confluences.map(c => (
                                        <span key={c} className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs px-2 py-1 rounded flex items-center gap-1">
                                            {c}
                                            <button type="button" onClick={() => handleMultiSelect('confluences', c)} className="hover:text-purple-800 dark:hover:text-purple-300"><X size={12}/></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mindset and Score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Mindset</label>
                            <div className="relative">
                                <select
                                    name="mindset"
                                    value={formData.mindset || ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select mindset</option>
                                    {MINDSET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Checklist Score</label>
                            <div className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2.5 text-lg font-bold text-slate-900 dark:text-white">
                                {checklistScore}%
                            </div>
                        </div>
                    </div>

                    {/* Checkbox */}
                    <div className="mb-6">
                        <label className={`flex items-center gap-3 ${checklistScore >= 75 ? 'cursor-pointer group' : 'cursor-not-allowed opacity-60'}`}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.followedPlan ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-custom-main'} ${checklistScore >= 75 ? 'group-hover:border-slate-400' : ''}`}>
                                {formData.followedPlan && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" name="followedPlan" checked={formData.followedPlan} onChange={handleInputChange} disabled={checklistScore < 75} className="hidden" />
                            <span className="text-sm font-bold text-slate-700 dark:text-white">Followed Trading Plan</span>
                            {checklistScore < 75 && <span className="text-xs text-slate-500 dark:text-slate-400">(Require 75% checklist score)</span>}
                        </label>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2 mb-6">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2 mb-8">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Screenshot</label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all bg-slate-50 dark:bg-custom-main">
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="Trade" className="h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-sm font-medium">Upload Chart Image</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                    
                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
                        <button type="button" onClick={() => setShowSaveModal(false)} className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30 transition-all">
                            Save Trade
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Checklist Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Checklist Item</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Item Label</label>
                <input
                  type="text"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  placeholder="e.g., Price returns to POI"
                  className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddChecklistItem();
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {Object.keys(groupedChecklist).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom">Custom Category</option>
                </select>
              </div>
              {newItemCategory === 'Custom' && (
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block mb-2">New Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g., My Custom Category"
                    className="w-full bg-slate-50 dark:bg-custom-main border border-slate-300 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddItemModal(false);
                  setNewItemLabel('');
                  setNewItemCategory('');
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChecklistItem}
                disabled={!newItemLabel.trim() || !newItemCategory.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeForm;