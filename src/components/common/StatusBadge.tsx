import React from 'react';
import { PatientStatus } from '../../types';
import { Clock, CheckCircle2, AlertCircle, Eye, Activity } from 'lucide-react';

interface Props {
  status: PatientStatus;
  triagePriority?: 'routine' | 'urgent' | 'emergency';
}

export const StatusBadge: React.FC<Props> = ({ status, triagePriority }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'waiting_intake':
        return {
          label: 'Intake In Progress',
          color: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <Clock className="w-3.5 h-3.5 text-slate-400" />
        };
      case 'ai_completed':
        return {
          label: 'AI Intake Complete',
          color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'doctor_reviewing':
        return {
          label: 'Doctor Reviewing',
          color: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          icon: <Eye className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'confirmed':
        return {
          label: 'Signed Off by Doctor',
          color: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
        };
      case 'escalated':
        return {
          label: 'Immediate STAT Attention',
          color: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        };
    }
  };

  const getTriageDisplay = () => {
    switch (triagePriority) {
      case 'emergency':
        return 'bg-rose-600 text-white font-extrabold shadow-rose-600/30';
      case 'urgent':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'routine':
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  const { label, color, icon } = getStatusDisplay();

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {triagePriority && (
        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full shadow-sm ${getTriageDisplay()}`}>
          {triagePriority}
        </span>
      )}
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        {icon}
        <span>{label}</span>
      </span>
    </div>
  );
};
