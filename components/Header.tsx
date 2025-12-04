import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, Calendar, List, CheckSquare, Sun, Moon, LogOut, Book, X, ChevronRight, User as UserIcon, Settings } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  user: User;
  onLogout: () => void;
  onUserClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isDarkMode, onToggleTheme, user, onLogout, onUserClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckSquare size={18} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
    { id: 'journal', label: 'Journal', icon: <List size={18} /> },
    { id: 'playbook', label: 'Playbook', icon: <BookOpen size={18} /> },
  ];

  const handleLogoClick = () => {
    // On mobile, toggle the menu. On desktop, go to dashboard.
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleMobileNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    onUserClick();
    setIsUserMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#111111] border-b border-slate-200 dark:border-slate-800 z-50 px-4 md:px-6 flex items-center justify-between transition-colors duration-300">
        {/* Logo / Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={handleLogoClick}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 relative">
            <Book className="text-white" size={20} />
            {/* Mobile Menu Indicator Hint */}
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#111111] rounded-full p-0.5 md:hidden">
               <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1 mx-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Controls (Theme, User) */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onToggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-1 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{user.name}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white border border-slate-200 dark:border-slate-600 shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {isUserMenuOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-2 border-b border-slate-200 dark:border-slate-800">
                            <p className="text-sm font-bold text-slate-900 dark:text-white px-3 pt-2">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 px-3 pb-2 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                            <button 
                                onClick={handleProfileClick}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <UserIcon size={16} />
                                Profile
                            </button>
                             <button 
                                onClick={handleLogoutClick}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
              )}
          </div>
        </div>
      </header>

      {/* Mobile Side Panel (Drawer) */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-200" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-[#111111] z-[70] shadow-2xl md:hidden border-r border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-left duration-300">
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Book className="text-white" size={20} />
                  </div>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
               </div>
               <button 
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
               >
                 <X size={20} />
               </button>
            </div>

            {/* Sidebar Nav Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
               {navItems.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => handleMobileNavClick(item.id)}
                   className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                     activeTab === item.id
                       ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                       : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                   }`}
                 >
                   <div className="flex items-center gap-3">
                     {item.icon}
                     <span>{item.label}</span>
                   </div>
                   {activeTab === item.id && <ChevronRight size={16} />}
                 </button>
               ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0a0a]">
               <div className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => handleMobileNavClick('user')}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white border-2 border-white dark:border-[#111111] shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user.email}</p>
                  </div>
               </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;