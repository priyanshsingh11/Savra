import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, Zap, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign size={20} />
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Cost Saved</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">₹{stats.rupees_saved}</h3>
        <p className="text-sm text-slate-500 mt-1">Based on ₹15/gen</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Zap size={20} />
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Efficiency</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{stats.total > 0 ? Math.round((stats.total_hits / stats.total) * 100) : 0}%</h3>
        <p className="text-sm text-slate-500 mt-1">Cache Hit Rate</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Throughput</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
        <p className="text-sm text-slate-500 mt-1">Total Requests</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
            <Activity size={20} />
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Semantic Hits</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{stats.semantic_hits}</h3>
        <p className="text-sm text-slate-500 mt-1">Smart Deduplication</p>
      </div>
    </div>
  );
};

export default StatsDashboard;
