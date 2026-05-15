import React from 'react';
import SlideCard from './SlideCard';
import { Download, Share2, ArrowLeft } from 'lucide-react';

const ResultViewer = ({ result, onReset }) => {
  if (!result) return null;

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = (result.title || 'presentation').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPPTX = () => {
    if (result.download_url) {
      const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}${result.download_url}`;
      window.open(fullUrl, '_blank');
    }
  };

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
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500">Generated {result.slides?.length} slides</p>
            {result.execution_time && (
              <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200">
                Processed in {result.execution_time}s {result.is_cached ? '(Cached)' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleDownloadJSON}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Share2 size={18} /> JSON
          </button>
          <button 
            onClick={handleDownloadPPTX}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
          >
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
