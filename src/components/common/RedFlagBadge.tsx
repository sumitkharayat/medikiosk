import React from 'react';
import { RedFlagAlert } from '../../types';
import { AlertCircle, AlertTriangle, Flame, ShieldAlert, HeartCrack, Activity } from 'lucide-react';

interface Props {
  alert: RedFlagAlert;
  compact?: boolean;
}

export const RedFlagBadge: React.FC<Props> = ({ alert, compact = false }) => {
  const getIcon = () => {
    switch (alert.category) {
      case 'cardiovascular':
        return <HeartCrack className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'allergy':
        return <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'vital_sign':
        return <Activity className="w-4 h-4 text-orange-400 shrink-0" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
  };

  const getSeverityStyle = () => {
    if (alert.severity === 'critical') {
      return 'bg-rose-950/80 border-rose-500/50 text-rose-200 shadow-rose-900/30';
    } else if (alert.severity === 'high') {
      return 'bg-amber-950/70 border-amber-500/50 text-amber-200 shadow-amber-900/20';
    } else {
      return 'bg-blue-950/60 border-blue-500/40 text-blue-200 shadow-blue-900/20';
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityStyle()}`}>
        {getIcon()}
        <span className="truncate max-w-[200px]">{alert.title}</span>
        <span className="uppercase text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/10">
          {alert.severity}
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-4 border shadow-lg ${getSeverityStyle()} transition-all hover:border-white/40`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-black/30 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-sm tracking-wide text-white">{alert.title}</span>
            <span className={`text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded-full ${
              alert.severity === 'critical' ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-600 text-white'
            }`}>
              {alert.severity} ALERT
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
              Source: {alert.source.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-2 leading-relaxed">{alert.description}</p>
          {alert.suggestedAction && (
            <div className="flex items-start gap-2 bg-black/40 rounded-lg p-2.5 border border-white/10 text-xs">
              <span className="font-bold text-brand-300 shrink-0">Suggested Action:</span>
              <span className="text-slate-200">{alert.suggestedAction}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
