import React from 'react';
import SlideCard from './SlideCard';
import { Download, Share2, ArrowLeft } from 'lucide-react';

const ResultViewer = ({ result, onReset }) => {
  if (!result) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-medium mb-2 transition-colors"
          >
            <ArrowLeft size={16} /> Create New Presentation
          </button>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{result.title}</h2>
          <p className="text-slate-500">Generated structure with {result.slides?.length} slides</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Share2 size={18} /> Share
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
            <Download size={18} /> Download .PPTX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.slides?.map((slide, index) => (
          <SlideCard key={index} slide={slide} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ResultViewer;
