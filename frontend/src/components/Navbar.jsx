import React from 'react';
import { Presentation, Library, Layout, Settings } from 'lucide-react';

const Navbar = ({ onToggleStats }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-xl text-white">
            <Presentation size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-800">
            SlideAI
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-brand-600 transition-colors">Features</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Pricing</a>
          <a href="#" className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
            <Library size={16} /> My Library
          </a>
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
