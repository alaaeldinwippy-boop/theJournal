import React from 'react';
import { LayoutDashboard, BookOpen, Calendar, List, CheckSquare, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'journal', label: 'Daily Journal', icon: <List size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
    { id: 'checklist', label: 'Checklist & Entry', icon: <CheckSquare size={20} /> },
    { id: 'playbook', label: 'Playbook', icon: <BookOpen size={20} /> },
  ];

  return (
    <div className="w-20 md:w-64 bg-[#11141f] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">T</span>
        </div>
        <span className="text-xl font-bold text-white hidden md:block tracking-tight">TradeJournal</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="hidden md:block font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;