import React from 'react';

const LoadingState = ({ progress }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/30 shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-brand-100 rounded-full"></div>
        <div 
          className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-brand-600">{progress}%</span>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800">Generating your slides...</h3>
        <p className="text-slate-500 max-w-xs">Our AI is researching and structuring the best content for your topic.</p>
      </div>

      <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-brand-500 h-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingState;
