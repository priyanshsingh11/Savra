import React, { useState } from 'react';
import { Send, BookOpen, Layers } from 'lucide-react';

const PPTForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    topic: '',
    grade: '',
    slides: 5
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.topic.trim()) newErrors.topic = 'Topic is required';
    if (!formData.grade.trim()) newErrors.grade = 'Grade is required';
    if (formData.slides < 1 || formData.slides > 20) newErrors.slides = 'Slides must be between 1 and 20';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <BookOpen size={16} className="text-brand-500" /> Topic
        </label>
        <input
          type="text"
          placeholder="e.g. Photosynthesis"
          className={`w-full px-4 py-3 rounded-xl border ${errors.topic ? 'border-red-400' : 'border-slate-200'} focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
        />
        {errors.topic && <p className="text-xs text-red-500">{errors.topic}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Layers size={16} className="text-brand-500" /> Grade Level
        </label>
        <input
          type="text"
          placeholder="e.g. 8th Grade"
          className={`w-full px-4 py-3 rounded-xl border ${errors.grade ? 'border-red-400' : 'border-slate-200'} focus:ring-2 focus:ring-brand-500 outline-none transition-all`}
          value={formData.grade}
          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
        />
        {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Number of Slides</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="20"
            className="flex-1 accent-brand-500"
            value={formData.slides}
            onChange={(e) => setFormData({ ...formData, slides: parseInt(e.target.value) })}
          />
          <span className="text-lg font-bold text-slate-700 w-8">{formData.slides}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 group"
      >
        {isLoading ? 'Processing...' : 'Generate Presentation'}
        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>
    </form>
  );
};

export default PPTForm;
