import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Calendar, TrendingUp, Menu, X, Sun, Moon, Book, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'dashboard' | 'checklist' | 'calendar' | 'trades';
  onNavigate: (view: 'dashboard' | 'checklist' | 'calendar' | 'trades') => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const NavButton = ({ view, icon: Icon, label }: { view: 'dashboard' | 'checklist' | 'calendar' | 'trades', icon: any, label: string }) => (
    <button 
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full md:w-auto ${
        activeView === view 
          ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-custom-main text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Top Navigation with Safe Area Top */}
      <header className="safe-top h-16 box-content border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-custom-panel flex items-center justify-between px-6 shrink-0 z-40 relative">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                    <Book size={18} />
                 </div>
                 <h1 className="text-lg font-bold text-slate-900 dark:text-white hidden md:block">The Journal</h1>
            </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavButton view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavButton view="checklist" icon={CheckSquare} label="Checklist" />
            <NavButton view="calendar" icon={Calendar} label="Calendar" />
            <NavButton view="trades" icon={TrendingUp} label="Trades" />
          </nav>
        </div>

        <div className="flex items-center gap-4">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>

           {/* User Profile */}
           <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <UserIcon size={18} />
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-custom-panel border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
           </div>

           {/* Mobile Menu Button */}
           <button 
             className="md:hidden p-2 text-slate-600 dark:text-slate-300"
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           >
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[calc(4rem+env(safe-area-inset-top))] left-0 w-full bg-white dark:bg-custom-panel border-b border-slate-200 dark:border-slate-800 z-30 shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
            <NavButton view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavButton view="checklist" icon={CheckSquare} label="Checklist" />
            <NavButton view="calendar" icon={Calendar} label="Calendar" />
            <NavButton view="trades" icon={TrendingUp} label="Trades" />
        </div>
      )}

      {/* Main Content with Safe Area Bottom */}
      <main className="flex-1 overflow-hidden relative safe-bottom">
         <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
           <div className="max-w-7xl mx-auto h-full pb-8">
            {children}
           </div>
         </div>
      </main>
    </div>
  );
};

export default Layout;