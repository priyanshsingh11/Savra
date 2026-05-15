import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const configs = {
    idle: { label: 'Ready', icon: Clock, color: 'bg-slate-100 text-slate-600' },
    processing: { label: 'Generating', icon: Clock, color: 'bg-amber-100 text-amber-600 animate-pulse' },
    completed: { label: 'Finished', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
    failed: { label: 'Failed', icon: AlertCircle, color: 'bg-red-100 text-red-600' }
  };

  const config = configs[status] || configs.idle;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
      <Icon size={14} />
      {config.label}
    </div>
  );
};

export default StatusBadge;
