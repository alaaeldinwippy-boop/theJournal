import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Upload, Check, Image as ImageIcon, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { Trade, Strategy, FormOptions } from '../types';
import { getMindsetColor } from '../constants';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklistScore?: number;
  strategies: Strategy[];
  onSave: (trade: Trade) => void;
  initialData?: Trade | null;
  readOnly?: boolean;
  activeStrategy?: Strategy;
  formOptions?: FormOptions;
}

const InputGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</label>
      {children}
  </div>
);

const DetailStat = ({ label, value, colored = false, valueClassName }: { label: string, value: string | number | undefined, colored?: boolean, valueClassName?: string }) => {
    let textColor = 'text-slate-900 dark:text-slate-200';
    if (colored) {
        if (typeof value === 'string' && value.includes('+')) textColor = 'text-green-600 dark:text-green-400';
        else if (typeof value === 'number' && value > 0) textColor = 'text-green-600 dark:text-green-400';
        else if (typeof value === 'string' && value.includes('-')) textColor = 'text-red-600 dark:text-red-400';
        else if (typeof value === 'number' && value < 0) textColor = 'text-red-600 dark:text-red-400';
    }
    
    if (valueClassName) {
        textColor = valueClassName;
    }

    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide">{label}</span>
            <span className={`text-xl font-bold ${textColor}`}>{value}</span>
        </div>
    );
};

const Badge: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
    <span className={`px-3 py-1 rounded-md text-sm font-semibold ${className}`}>
        {children}
    </span>
);

const MultiSelect = ({ 
    options, 
    selected, 
    onChange, 
    placeholder,
    readOnly
}: { 
    options: string[], 
    selected: string[], 
    onChange: (selected: string[]) => void,
    placeholder: string,
    readOnly?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (option: string) => {
        if (readOnly) return;
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="relative">
            <div 
                className={`w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 text-sm min-h-[38px] flex items-center justify-between ${readOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !readOnly && setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1">
                    {selected.length === 0 ? (
                        <span className="text-slate-500 dark:text-slate-600">{placeholder}</span>
                    ) : (
                        selected.map(s => (
                            <span key={s} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 px-1.5 py-0.5 rounded text-xs">{s}</span>
                        ))
                    )}
                </div>
                {!readOnly && <span className="text-slate-500 text-xs">▼</span>}
            </div>
            {isOpen && !readOnly && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-700 rounded-md shadow-xl z-20 max-h-48 overflow-y-auto">
                        {options.map(option => (
                            <div 
                                key={option} 
                                className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                                onClick={() => toggleOption(option)}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(option) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {selected.includes(option) && <Check size={12} className="text-white" />}
                                </div>
                                {option}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const AddTradeModal: React.FC<AddTradeModalProps> = ({ isOpen, onClose, checklistScore = 0, strategies, onSave, initialData, readOnly = false, activeStrategy, formOptions }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    platforms: [] as string[],
    session: '',
    timeframe: '',
    instrument: '',
    direction: '',
    entryPrice: '',
    takeProfit: '',
    stopLoss: '',
    points: '',
    outcome: '',
    quantity: '1',
    riskReward: '',
    realizedPnL: '',
    setup: '', 
    confluences: [] as string[],
    mindset: '',
    notes: '',
    followedPlan: false,
    screenshot: ''
  });

  // Default options fallback if not provided
  const options = {
      platforms: formOptions?.platforms || ['FTMO Account', 'FTMO Challenge', 'FTMO Verification', 'Topstep Combine', 'Topstep XFA', 'Topstep Live'],
      sessions: formOptions?.sessions || ['Tokyo', 'London', 'New York'],
      timeframes: formOptions?.timeframes || ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D', 'W'],
      instruments: formOptions?.instruments || ['XAUUSD', 'NASDAQ 100', 'S&P 500', 'EURUSD', 'GBPJPY']
  };

  useEffect(() => {
    if (initialData) {
        setFormData({
            id: initialData.id,
            date: initialData.date,
            platforms: initialData.platform,
            session: initialData.session,
            timeframe: initialData.timeframe,
            instrument: initialData.symbol,
            direction: initialData.direction,
            entryPrice: initialData.entryPrice.toString(),
            takeProfit: initialData.takeProfit?.toString() || '',
            stopLoss: initialData.stopLoss?.toString() || '',
            points: initialData.points?.toString() || '',
            outcome: initialData.status === 'WIN' ? 'Win' : initialData.status === 'LOSS' ? 'Loss' : 'Breakeven',
            quantity: initialData.quantity?.toString() || '1',
            riskReward: initialData.riskReward?.toString() || '',
            realizedPnL: initialData.pnl.toString(),
            setup: initialData.setup,
            confluences: initialData.confluences || [],
            mindset: initialData.mindset,
            notes: initialData.notes,
            followedPlan: initialData.followedPlan,
            screenshot: initialData.screenshot || ''
        });
    } else {
        // Auto-calculate followed plan based on score >= 75%
        const shouldFollowPlan = checklistScore >= 75;

        setFormData({
            id: '',
            date: new Date().toISOString().split('T')[0],
            platforms: [],
            session: '',
            timeframe: '',
            instrument: '',
            direction: '',
            entryPrice: '',
            takeProfit: '',
            stopLoss: '',
            points: '',
            outcome: '',
            quantity: '1',
            riskReward: '',
            realizedPnL: '',
            setup: activeStrategy ? activeStrategy.title : '', // Auto-select active strategy
            confluences: [],
            mindset: '',
            notes: '',
            followedPlan: shouldFollowPlan, 
            screenshot: ''
        });
    }
  }, [initialData, isOpen, checklistScore, activeStrategy]);

  // Risk Reward Calculation
  useEffect(() => {
    if (readOnly) return;
    const entry = parseFloat(formData.entryPrice);
    const tp = parseFloat(formData.takeProfit);
    const sl = parseFloat(formData.stopLoss);

    if (entry && tp && sl && entry !== sl) {
        const rr = Math.abs((tp - entry) / (entry - sl));
        setFormData(prev => ({ ...prev, riskReward: rr.toFixed(2) }));
    }
  }, [formData.entryPrice, formData.takeProfit, formData.stopLoss, readOnly]);

  // P&L Calculation Logic
  useEffect(() => {
    if (readOnly) return;
    
    const entry = parseFloat(formData.entryPrice);
    const qty = parseFloat(formData.quantity) || 1;
    const outcome = formData.outcome;
    let exit = null;

    if (isNaN(entry) || !outcome) return;

    // Determine Exit Price based on outcome
    if (outcome === 'Win') {
        exit = parseFloat(formData.takeProfit);
    } else if (outcome === 'Loss') {
        exit = parseFloat(formData.stopLoss);
    } else if (outcome === 'Breakeven') {
        exit = entry;
    }

    if (exit !== null && !isNaN(exit)) {
        let pnl = 0;
        // Basic calculation: Difference * Quantity
        if (formData.direction === 'Long') {
            pnl = (exit - entry) * qty;
        } else {
            pnl = (entry - exit) * qty;
        }
        
        // Only update if not NaN
        if (!isNaN(pnl)) {
             setFormData(prev => ({ ...prev, realizedPnL: pnl.toFixed(2) }));
        }
    }
  }, [formData.entryPrice, formData.takeProfit, formData.stopLoss, formData.outcome, formData.direction, formData.quantity, readOnly]);

  // Auto-set Outcome based on P&L
  useEffect(() => {
    if (readOnly || !formData.realizedPnL) return;
    
    const pnl = parseFloat(formData.realizedPnL);
    if (!isNaN(pnl)) {
        // We check if the current outcome matches the PnL sign to avoid re-triggering calculation
        if (pnl > 0 && formData.outcome !== 'Win') {
            setFormData(prev => ({ ...prev, outcome: 'Win' }));
        } else if (pnl < 0 && formData.outcome !== 'Loss') {
            setFormData(prev => ({ ...prev, outcome: 'Loss' }));
        } else if (pnl === 0 && formData.outcome !== 'Breakeven' && formData.outcome !== '') {
            setFormData(prev => ({ ...prev, outcome: 'Breakeven' }));
        }
    }
  }, [formData.realizedPnL, readOnly]);

  // Auto-calculate Points based on Outcome
  useEffect(() => {
      if (readOnly) return;
      const outcome = formData.outcome;
      const entry = parseFloat(formData.entryPrice);
      const tp = parseFloat(formData.takeProfit);
      const sl = parseFloat(formData.stopLoss);

      // Only calculate if entry and relevant exit price exists
      if (!isNaN(entry)) {
          let calculatedPoints = null;

          if (outcome === 'Win' && !isNaN(tp)) {
              if (formData.direction === 'Long') {
                  calculatedPoints = tp - entry;
              } else if (formData.direction === 'Short') {
                  calculatedPoints = entry - tp;
              }
          } else if (outcome === 'Loss' && !isNaN(sl)) {
              if (formData.direction === 'Long') {
                  calculatedPoints = sl - entry;
              } else if (formData.direction === 'Short') {
                  calculatedPoints = entry - sl;
              }
          }

          if (calculatedPoints !== null) {
              setFormData(prev => ({ ...prev, points: calculatedPoints.toFixed(2) }));
          }
      }

  }, [formData.outcome, formData.entryPrice, formData.takeProfit, formData.stopLoss, formData.direction, readOnly]);


  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  const removeScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setFormData(prev => ({ ...prev, screenshot: '' }));
  };

  const handleSaveClick = () => {
      setShowConfirmation(true);
  };

  const handleConfirmSave = () => {
    const newTrade: Trade = {
        id: formData.id || Math.random().toString(36).substr(2, 9),
        symbol: formData.instrument || 'UNKNOWN',
        date: formData.date,
        direction: (formData.direction as 'Long' | 'Short') || 'Long',
        entryPrice: parseFloat(formData.entryPrice) || 0,
        exitPrice: 0, 
        quantity: parseFloat(formData.quantity) || 1,
        pnl: parseFloat(formData.realizedPnL) || 0,
        status: (formData.outcome === 'Win' ? 'WIN' : formData.outcome === 'Loss' ? 'LOSS' : 'BREAK_EVEN'),
        setup: formData.setup,
        timeframe: formData.timeframe,
        session: formData.session,
        mindset: formData.mindset,
        notes: formData.notes,
        checklistScore: initialData ? initialData.checklistScore : checklistScore,
        platform: formData.platforms,
        takeProfit: parseFloat(formData.takeProfit) || 0,
        stopLoss: parseFloat(formData.stopLoss) || 0,
        points: parseFloat(formData.points) || 0,
        riskReward: parseFloat(formData.riskReward) || 0,
        confluences: formData.confluences,
        followedPlan: formData.followedPlan,
        screenshot: formData.screenshot
    };

    onSave(newTrade);
    setShowConfirmation(false);
    onClose();
  };

  const selectClassName = `w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none text-sm ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`;
  const inputClassName = `w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 dark:placeholder-slate-600 text-sm ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year.slice(2)}`;
  };

  // Full screen image modal
  if (isImageModalOpen && (formData.screenshot || (initialData && initialData.screenshot))) {
      return (
          <div className="fixed inset-0 z-[200] flex justify-center items-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setIsImageModalOpen(false)}>
              <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2">
                  <X size={32} />
              </button>
              <img 
                src={formData.screenshot || (initialData?.screenshot || '')} 
                alt="Full Screen Trade" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
              />
          </div>
      );
  }

  if (readOnly && initialData) {
      const displayExitPrice = initialData.status === 'WIN' ? initialData.takeProfit : initialData.status === 'LOSS' ? initialData.stopLoss : initialData.entryPrice;
      const displayPnl = initialData.pnl >= 0 ? `+$${initialData.pnl.toFixed(2)}` : `-$${Math.abs(initialData.pnl).toFixed(2)}`;
      const statusColor = initialData.status === 'WIN' ? 'bg-blue-600 text-white' : initialData.status === 'LOSS' ? 'bg-red-600 text-white' : 'bg-slate-600 text-white';

      return (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#111111] w-full max-w-3xl rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col transition-colors duration-300 m-4 max-h-[calc(100vh-2rem)]">
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111111] rounded-t-xl shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{initialData.symbol}</h2>
                        <Badge className="bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 uppercase">{initialData.direction}</Badge>
                        <Badge className={statusColor}>{initialData.status}</Badge>
                    </div>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar bg-white dark:bg-[#111111]">
                    <div className="grid grid-cols-4 gap-4">
                        <DetailStat label="ENTRY" value={initialData.entryPrice} />
                        <DetailStat label="EXIT" value={displayExitPrice} />
                        <DetailStat label="R/R" value={initialData.riskReward} />
                        <DetailStat label="P&L" value={displayPnl} colored />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <DetailStat label="DATE" value={formatDate(initialData.date)} />
                        <DetailStat label="TIMEFRAME" value={initialData.timeframe} />
                        <DetailStat label="SESSION" value={initialData.session} />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <DetailStat label="QUANTITY" value={initialData.quantity} />
                        <DetailStat label="POINTS" value={initialData.points} />
                        <DetailStat label="MINDSET" value={initialData.mindset} valueClassName={getMindsetColor(initialData.mindset)} />
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <DetailStat label="CHECKLIST SCORE" value={`${initialData.checklistScore}%`} />
                        <DetailStat label="FOLLOWED PLAN" value={initialData.followedPlan ? 'Yes' : 'No'} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                             <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide">STRATEGY (SETUP)</h4>
                             <div className="flex flex-wrap gap-2">
                                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">{initialData.setup || 'No Strategy'}</Badge>
                             </div>
                        </div>
                        <div className="space-y-2">
                             <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide">CONFLUENCES</h4>
                             <div className="flex flex-wrap gap-2">
                                {initialData.confluences?.map(c => (
                                    <Badge key={c} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50">{c}</Badge>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                         <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide">PLATFORMS</h4>
                         <div className="flex flex-wrap gap-2">
                            {initialData.platform?.map(p => (
                                <Badge key={p} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{p}</Badge>
                            ))}
                         </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide">SCREENSHOT</h4>
                        <div 
                            className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/50 cursor-zoom-in hover:opacity-90 transition-opacity"
                            onClick={() => initialData.screenshot && setIsImageModalOpen(true)}
                        >
                            {initialData.screenshot ? (
                                <img src={initialData.screenshot} alt="Trade Screenshot" className="w-full h-auto object-contain" />
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                                    <ImageIcon size={32} className="mb-2 opacity-50" />
                                    <span>No screenshot available</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  const isPlanEligible = checklistScore >= 75 || formData.followedPlan;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111111] w-full max-w-4xl rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col transition-colors duration-300 m-4 max-h-[calc(100vh-2rem)]">
        <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {initialData ? 'Edit Trade' : 'Add New Trade'}
            </h2>
            <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar bg-white dark:bg-[#111111]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputGroup label="Date">
                    <div className="relative">
                        <input 
                            type="date" 
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className={`${inputClassName} [color-scheme:light] dark:[color-scheme:dark]`}
                        />
                        <Calendar size={16} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
                    </div>
                </InputGroup>
                <InputGroup label="Platform">
                    <MultiSelect 
                        options={options.platforms}
                        selected={formData.platforms}
                        onChange={(selected) => setFormData({...formData, platforms: selected})}
                        placeholder="Select platforms..."
                    />
                </InputGroup>
                <InputGroup label="Session">
                    <select name="session" value={formData.session} onChange={handleChange} className={selectClassName}>
                        <option value="">Select session</option>
                        {options.sessions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </InputGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputGroup label="Timeframe">
                    <select name="timeframe" value={formData.timeframe} onChange={handleChange} className={selectClassName}>
                        <option value="">Select timeframe</option>
                        {options.timeframes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </InputGroup>
                <InputGroup label="Instrument">
                    <select name="instrument" value={formData.instrument} onChange={handleChange} className={selectClassName}>
                        <option value="">Select instrument</option>
                        {options.instruments.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </InputGroup>
                <InputGroup label="Direction">
                    <select name="direction" value={formData.direction} onChange={handleChange} className={selectClassName}>
                        <option value="">Select direction</option>
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                    </select>
                </InputGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <InputGroup label="Entry Price">
                    <input type="number" step="0.01" name="entryPrice" value={formData.entryPrice} onChange={handleChange} placeholder="0.00" className={inputClassName} />
                </InputGroup>
                <InputGroup label="Take Profit">
                    <input type="number" step="0.01" name="takeProfit" value={formData.takeProfit} onChange={handleChange} placeholder="0.00" className={inputClassName} />
                </InputGroup>
                <InputGroup label="Stop Loss">
                    <input type="number" step="0.01" name="stopLoss" value={formData.stopLoss} onChange={handleChange} placeholder="0.00" className={inputClassName} />
                </InputGroup>
                <InputGroup label="Quantity/Lot Size">
                    <input type="number" step="0.01" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="1.0" className={inputClassName} />
                </InputGroup>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputGroup label="Points">
                    <input type="number" step="0.01" name="points" value={formData.points} onChange={handleChange} placeholder="0.00" className={inputClassName} />
                </InputGroup>
                <InputGroup label="Outcome">
                    <select name="outcome" value={formData.outcome} onChange={handleChange} className={selectClassName}>
                        <option value="">Select outcome</option>
                        <option value="Win">Win</option>
                        <option value="Loss">Loss</option>
                        <option value="Breakeven">Breakeven</option>
                    </select>
                </InputGroup>
                <InputGroup label="Risk/Reward">
                    <input type="number" step="0.01" name="riskReward" value={formData.riskReward} onChange={handleChange} placeholder="0.00" className={inputClassName} readOnly />
                </InputGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Realized P&L">
                    <input type="number" step="0.01" name="realizedPnL" value={formData.realizedPnL} onChange={handleChange} placeholder="0.00" className={inputClassName} />
                </InputGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Setup">
                    <select name="setup" value={formData.setup} onChange={handleChange} className={selectClassName}>
                        <option value="">Select strategy...</option>
                        {strategies.map(s => (
                            <option key={s.id} value={s.title}>{s.title}</option>
                        ))}
                    </select>
                </InputGroup>
                 <InputGroup label="Confluences">
                    <MultiSelect 
                        options={['EMA', 'Fibonacci', 'MACD', 'Candlestick']}
                        selected={formData.confluences}
                        onChange={(selected) => setFormData({...formData, confluences: selected})}
                        placeholder="Select confluences..."
                    />
                </InputGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Mindset">
                    <select name="mindset" value={formData.mindset} onChange={handleChange} className={selectClassName}>
                        <option value="">Select mindset</option>
                        <option>Frustrated</option>
                        <option>FOMO</option>
                        <option>Overconfident</option>
                        <option>Overtrading</option>
                        <option>Revenge Trading</option>
                        <option>Hesitant</option>
                        <option>Nervous</option>
                        <option>Mindful</option>
                        <option>Confident</option>
                        <option>Calm</option>
                    </select>
                </InputGroup>
                 <InputGroup label="Checklist Score">
                    <div className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 font-bold flex items-center justify-between">
                         <span>{initialData ? initialData.checklistScore : checklistScore}%</span>
                    </div>
                </InputGroup>
            </div>

            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="followedPlan" 
                    name="followedPlan"
                    checked={formData.followedPlan}
                    onChange={handleChange}
                    disabled={true} 
                    className={`w-5 h-5 rounded border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#0a0a0a] text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:text-indigo-600 disabled:bg-slate-50 dark:disabled:bg-[#0a0a0a] ${isPlanEligible ? 'opacity-100' : 'opacity-40'}`} 
                />
                <label htmlFor="followedPlan" className={`text-sm font-semibold ${isPlanEligible ? 'text-slate-900 dark:text-slate-200 opacity-100' : 'text-slate-500 dark:text-slate-500 opacity-50'}`}>
                    Followed Trading Plan <span className="text-slate-500 font-normal ml-1">(Require 75% checklist score)</span>
                </label>
            </div>

            <InputGroup label="Notes">
                <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any notes about this trade..."
                    className="w-full h-24 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none text-sm"
                />
            </InputGroup>

             <InputGroup label="Screenshot">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                />
                {formData.screenshot ? (
                    <div className="w-full h-48 border-2 border-slate-300 dark:border-slate-700/50 rounded-lg bg-slate-50 dark:bg-[#0f111a] relative overflow-hidden group">
                        <img 
                            src={formData.screenshot} 
                            alt="Trade Preview" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button 
                                onClick={() => setIsImageModalOpen(true)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 flex items-center gap-2 transition-colors"
                                type="button"
                            >
                                <Eye size={16} /> View
                            </button>
                            <button 
                                onClick={triggerFileUpload}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                                type="button"
                            >
                                <RefreshCw size={16} /> Change
                            </button>
                        </div>
                        <button 
                            onClick={removeScreenshot}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors"
                            title="Remove Screenshot"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div 
                        onClick={triggerFileUpload}
                        className="w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-700/50 hover:border-indigo-500/50 rounded-lg bg-slate-50 dark:bg-[#0f111a] flex flex-col items-center justify-center cursor-pointer transition-all group"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white dark:bg-[#111111] rounded-full text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors shadow-sm">
                                <Upload size={24} />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-medium">
                                Upload Chart Image
                            </span>
                        </div>
                    </div>
                )}
            </InputGroup>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-[#111111] rounded-b-xl shrink-0">
            <button onClick={onClose} className="px-5 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleSaveClick}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20"
            >
                Save Trade
            </button>
        </div>
      </div>
      
      {/* Confirmation Modal Overlay */}
      {showConfirmation && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center">
                          <AlertTriangle size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Save</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                              Are you sure all details are correct? This will update your journal statistics.
                          </p>
                      </div>
                      <div className="flex gap-3 w-full mt-2">
                          <button 
                              onClick={() => setShowConfirmation(false)}
                              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleConfirmSave}
                              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
                          >
                              Confirm
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AddTradeModal;