import React, { useState } from 'react';
import { User, Trade, FormOptions } from '../types';
import { User as UserIcon, Mail, Shield, BarChart2, Settings, Plus, X, Trash2, AlertTriangle, Save } from 'lucide-react';

interface UserPageProps {
  user: User;
  trades: Trade[];
  formOptions: FormOptions;
  onUpdateOptions: (newOptions: FormOptions) => void;
  onUpdateUser: (user: User) => void;
  onDeleteAccount: () => void;
}

const UserPage: React.FC<UserPageProps> = ({ user, trades, formOptions, onUpdateOptions, onUpdateUser, onDeleteAccount }) => {
  const totalTrades = trades.length;
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const winRate = totalTrades > 0 ? Math.round((trades.filter(t => t.status === 'WIN').length / totalTrades) * 100) : 0;

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [welcomeMsg, setWelcomeMsg] = useState(user.welcomeMessage || '');

  const [newItemValues, setNewItemValues] = useState({
      platforms: '',
      sessions: '',
      timeframes: '',
      instruments: ''
  });

  const handleSaveProfile = () => {
      onUpdateUser({
          ...user,
          name: profileName,
          welcomeMessage: welcomeMsg
      });
      setIsEditingProfile(false);
  };

  const handleAddItem = (category: keyof FormOptions) => {
      const value = newItemValues[category].trim();
      if (value && !formOptions[category].includes(value)) {
          onUpdateOptions({
              ...formOptions,
              [category]: [...formOptions[category], value]
          });
          setNewItemValues({ ...newItemValues, [category]: '' });
      }
  };

  const handleDeleteItem = (category: keyof FormOptions, itemToDelete: string) => {
      if (window.confirm(`Are you sure you want to delete "${itemToDelete}" from ${category}?`)) {
          onUpdateOptions({
              ...formOptions,
              [category]: formOptions[category].filter(item => item !== itemToDelete)
          });
      }
  };

  const handleDeleteAccountClick = () => {
      const confirmed = window.confirm("Are you sure you want to delete your account? This action is permanent and will wipe all your data.");
      if (confirmed) {
          onDeleteAccount();
      }
  };

  const renderOptionEditor = (category: keyof FormOptions, title: string) => (
      <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg border border-slate-200 dark:border-slate-800 p-5">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{title}</h4>
          
          <div className="flex gap-2 mb-4">
              <input 
                  type="text" 
                  value={newItemValues[category]}
                  onChange={(e) => setNewItemValues({...newItemValues, [category]: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem(category)}
                  placeholder={`Add new ${title.toLowerCase().slice(0, -1)}`}
                  className="flex-1 bg-white dark:bg-[#111111] border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <button 
                  onClick={() => handleAddItem(category)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                  type="button"
              >
                  <Plus size={18} />
              </button>
          </div>

          <div className="flex flex-wrap gap-2">
              {formOptions[category].map(item => (
                  <div key={item} className="flex items-center gap-2 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-700 dark:text-slate-300">
                      <span>{item}</span>
                      <button 
                          onClick={() => handleDeleteItem(category, item)}
                          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          type="button"
                      >
                          <Trash2 size={14} />
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Profile</h1>

      <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white shadow-lg border-4 border-white dark:border-[#111111] shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 w-full space-y-4">
            {isEditingProfile ? (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Display Name</label>
                        <input 
                            type="text" 
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Dashboard Welcome Message</label>
                        <input 
                            type="text" 
                            value={welcomeMsg}
                            onChange={(e) => setWelcomeMsg(e.target.value)}
                            placeholder="Enter a motivational quote or welcome message"
                            className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={handleSaveProfile}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                            type="button"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                        <button 
                            onClick={() => {
                                setIsEditingProfile(false);
                                setProfileName(user.name);
                                setWelcomeMsg(user.welcomeMessage || '');
                            }}
                            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            type="button"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-start w-full">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                        <p className="text-sm italic text-slate-500 dark:text-slate-500">"{user.welcomeMessage || 'Here is your trading performance overview.'}"</p>
                        <div className="flex flex-col md:flex-row items-center gap-4 text-slate-500 dark:text-slate-400 pt-2">
                        <span className="flex items-center gap-2">
                            <Mail size={16} /> {user.email}
                        </span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-2">
                            <Shield size={16} /> Standard Plan
                        </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Profile"
                        type="button"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Trades</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalTrades}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <span className="text-xl font-bold">$</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Lifetime P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <span className="text-xl font-bold">%</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Win Rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{winRate}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8">
        <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                Trade Form Selections
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 -mt-4 text-sm">Customize the options available in the Add Trade form dropdowns.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderOptionEditor('platforms', 'Platforms')}
                {renderOptionEditor('sessions', 'Sessions')}
                {renderOptionEditor('timeframes', 'Timeframes')}
                {renderOptionEditor('instruments', 'Instruments')}
            </div>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} /> Danger Zone
        </h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-6">
            Deleting your account is permanent and cannot be undone. All your trade data and settings will be wiped immediately.
        </p>
        <button
            onClick={handleDeleteAccountClick}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-500/20"
            type="button"
        >
            Delete Account
        </button>
      </div>
    </div>
  );
};

export default UserPage;