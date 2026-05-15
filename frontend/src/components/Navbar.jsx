import React from 'react';
import { Presentation, Library, Layout, Settings } from 'lucide-react';

const Navbar = ({ onToggleStats, onToggleHistory, onCreate, isHistoryActive, isCreateActive }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onCreate}
        >
          <div className="bg-brand-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
            <Presentation size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-800">
            SlideAI
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button 
            onClick={onCreate}
            className={`transition-colors px-3 py-2 ${isCreateActive ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
          >
            Create New
          </button>
          <button 
            onClick={onToggleHistory}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isHistoryActive 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' 
                : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Library size={16} /> My Library
          </button>
        </div>

        <button 
          onClick={onToggleStats}
          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
          title="System Stats"
        >
          <Layout size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
