import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TradeForm from './components/TradeForm';
import Calendar from './components/Calendar';
import TradesList from './components/TradesList';
import TradeViewModal from './components/TradeViewModal';
import { getTrades, saveTrade, deleteTrade } from './services/storage';
import { getSession, logout } from './services/auth';
import { Trade, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'checklist' | 'calendar' | 'trades'>('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      refreshTrades();
    }
  }, [user]);

  const refreshTrades = () => {
    if (user) {
      setTrades(getTrades(user.id));
    }
  };

  const handleLogin = (user: User) => {
    setUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleSaveTrade = (trade: Trade) => {
    if (user) {
      saveTrade(trade, user.id);
      refreshTrades();
      setEditingTrade(null);
      setView('trades');
    }
  };

  const handleDeleteTrade = (id: string) => {
    if (user) {
      deleteTrade(id, user.id);
      refreshTrades();
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setView('checklist');
  }

  const handleAddTrade = () => {
    setEditingTrade(null);
    setView('checklist');
  }

  if (loading) {
    return <div className="h-screen w-screen bg-custom-main flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (view) {
        case 'dashboard':
            return <Dashboard trades={trades} onAddTrade={handleAddTrade} onDeleteTrade={handleDeleteTrade} />;
        case 'checklist':
            return (
                <TradeForm 
                    onSave={handleSaveTrade} 
                    onCancel={() => {
                        setEditingTrade(null);
                        setView(editingTrade ? 'trades' : 'dashboard');
                    }}
                    initialData={editingTrade}
                />
            );
        case 'calendar':
            return <Calendar trades={trades} onViewTrade={setViewingTrade} />;
        case 'trades':
            return <TradesList trades={trades} onDeleteTrade={handleDeleteTrade} onAddTrade={handleAddTrade} onEditTrade={handleEditTrade} onViewTrade={setViewingTrade} />;
        default:
            return <Dashboard trades={trades} onAddTrade={handleAddTrade} onDeleteTrade={handleDeleteTrade} />;
    }
  };

  return (
    <>
      <Layout
        activeView={view}
        onNavigate={setView}
        user={user}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
      <TradeViewModal trade={viewingTrade} onClose={() => setViewingTrade(null)} />
    </>
  );
};

export default App;