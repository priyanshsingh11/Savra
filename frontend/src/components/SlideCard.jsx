import React from 'react';

const SlideCard = ({ slide, index }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:border-brand-100 transition-all group overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">Slide {index + 1}</span>
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">
          {index + 1}
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-brand-700 transition-colors">
        {slide.title}
      </h3>
      <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
        {slide.content}
      </div>
    </div>
  );
};

export default SlideCard;
