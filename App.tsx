import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TradeList from './components/TradeList';
import Checklist from './components/Checklist';
import CalendarView from './components/CalendarView';
import Playbook from './components/Playbook';
import Auth from './components/Auth';
import UserPage from './components/UserPage';
import { Trade, Strategy, User, FormOptions } from './types';
import { DEFAULT_STRATEGIES } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]); 
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Customizable Form Options
  const [formOptions, setFormOptions] = useState<FormOptions>({
    platforms: ['FTMO Account', 'FTMO Challenge', 'FTMO Verification', 'Topstep Combine', 'Topstep XFA', 'Topstep Live'],
    sessions: ['Tokyo', 'London', 'New York'],
    timeframes: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D', 'W'],
    instruments: ['XAUUSD', 'NASDAQ 100', 'S&P 500', 'EURUSD', 'GBPJPY']
  });
  
  // Strategies state initialized from constants
  const [strategies, setStrategies] = useState<Strategy[]>(DEFAULT_STRATEGIES);

  // Handle Theme Toggle
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#111111';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [isDarkMode]);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('tradeJournalUser');
    if (savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch (error) {
            console.error('Failed to parse saved user', error);
            localStorage.removeItem('tradeJournalUser');
        }
    }
    
    // Load saved options if available
    const savedOptions = localStorage.getItem('tradeJournalOptions');
    if (savedOptions) {
        try {
            setFormOptions(JSON.parse(savedOptions));
        } catch (error) {
            console.error('Failed to parse saved options', error);
        }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (loggedInUser: User, rememberMe: boolean) => {
    // Ensure welcome message exists
    const userWithDefaults = {
        ...loggedInUser,
        welcomeMessage: loggedInUser.welcomeMessage || "Here is your trading performance overview."
    };
    
    setUser(userWithDefaults);
    if (rememberMe) {
        localStorage.setItem('tradeJournalUser', JSON.stringify(userWithDefaults));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTrades([]); // Clear trades on logout
    setActiveTab('dashboard'); // Reset tab
    localStorage.removeItem('tradeJournalUser');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // If user was persisted, update the persistence
    if (localStorage.getItem('tradeJournalUser')) {
        localStorage.setItem('tradeJournalUser', JSON.stringify(updatedUser));
    }
  };

  const handleDeleteAccount = () => {
    setUser(null);
    setTrades([]);
    setFormOptions({
        platforms: ['FTMO Account', 'FTMO Challenge', 'FTMO Verification', 'Topstep Combine', 'Topstep XFA', 'Topstep Live'],
        sessions: ['Tokyo', 'London', 'New York'],
        timeframes: ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D', 'W'],
        instruments: ['XAUUSD', 'NASDAQ 100', 'S&P 500', 'EURUSD', 'GBPJPY']
    });
    setActiveTab('dashboard');
    localStorage.removeItem('tradeJournalUser');
    localStorage.removeItem('tradeJournalOptions');
  };

  const handleSaveTrade = (newTrade: Trade) => {
    // Check if updating an existing trade
    const existingIndex = trades.findIndex(t => t.id === newTrade.id);
    if (existingIndex >= 0) {
        const updatedTrades = [...trades];
        updatedTrades[existingIndex] = newTrade;
        setTrades(updatedTrades);
    } else {
        setTrades([...trades, newTrade]);
    }
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const handleSetActiveStrategy = (id: string) => {
    setStrategies(strategies.map(s => ({
      ...s,
      isActive: s.id === id
    })));
  };

  const handleUpdateOptions = (newOptions: FormOptions) => {
      setFormOptions(newOptions);
      localStorage.setItem('tradeJournalOptions', JSON.stringify(newOptions));
  };

  const activeStrategy = strategies.find(s => s.isActive);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard trades={trades} user={user} />;
      case 'journal':
        return (
            <TradeList 
                trades={trades} 
                onEdit={(trade) => {
                    // Logic handled in TradeList
                }}
                onSave={handleSaveTrade}
                onDelete={handleDeleteTrade}
                strategies={strategies}
                formOptions={formOptions}
                onNavigate={setActiveTab}
            />
        );
      case 'calendar':
        return (
            <CalendarView 
                trades={trades} 
                onSave={handleSaveTrade} 
                onDelete={handleDeleteTrade}
                strategies={strategies} 
                formOptions={formOptions}
            />
        );
      case 'checklist':
        return (
            <Checklist 
                onSaveTrade={handleSaveTrade} 
                strategies={strategies} 
                activeStrategy={activeStrategy} 
                formOptions={formOptions}
            />
        );
      case 'playbook':
        return (
          <Playbook 
            strategies={strategies} 
            setStrategies={setStrategies} 
            trades={trades} 
            onSetActive={handleSetActiveStrategy}
          />
        );
      case 'user':
        return (
            <UserPage 
                user={user!} 
                trades={trades} 
                formOptions={formOptions}
                onUpdateOptions={handleUpdateOptions}
                onUpdateUser={handleUpdateUser}
                onDeleteAccount={handleDeleteAccount}
            />
        );
      default:
        return <Dashboard trades={trades} user={user} />;
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
         <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#111111] text-slate-200' : 'bg-white text-slate-900'}`}>
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        user={user}
        onLogout={handleLogout}
        onUserClick={() => setActiveTab('user')}
      />
      <main className="flex-1 pt-16 transition-all duration-300">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;