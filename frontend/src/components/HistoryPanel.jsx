import React, { useEffect, useState } from 'react';
import { pptService } from '../services/api';
import { FileText, Download, Clock, ChevronRight } from 'lucide-react';

const HistoryPanel = ({ onSelect }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await pptService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium">Loading your library...</p>
    </div>
  );

  if (history.length === 0) return (
    <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
      <FileText className="mx-auto text-slate-300 mb-4" size={48} />
      <h3 className="text-lg font-bold text-slate-800">Your library is empty</h3>
      <p className="text-slate-500">Generate your first presentation to see it here.</p>
    </div>
  );

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">My Library</h2>
        <button 
          onClick={fetchHistory}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item.content)}
            className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/5 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-brand-600 group-hover:bg-brand-50 transition-colors">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">{item.topic}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">Grade {item.grade}</span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Clock size={12} />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href={`http://localhost:8000/api/v1/download/${item.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                title="Download PPTX"
              >
                <Download size={20} />
              </a>
              <ChevronRight className="text-slate-300 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
