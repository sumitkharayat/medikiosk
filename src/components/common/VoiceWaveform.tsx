import React from 'react';

interface Props {
  isListening?: boolean;
  isPlayingAudio?: boolean;
  className?: string;
}

export const VoiceWaveform: React.FC<Props> = ({ isListening = false, isPlayingAudio = false, className = '' }) => {
  const active = isListening || isPlayingAudio;
  const barColor = isListening ? 'bg-rose-400' : (isPlayingAudio ? 'bg-brand-400' : 'bg-slate-600');

  return (
    <div className={`flex items-center justify-center gap-1 h-8 px-3 rounded-full bg-slate-900/60 border border-slate-700/80 ${className}`}>
      <div className={`w-1 rounded-full transition-all duration-300 ${barColor} ${active ? 'h-5 animate-pulse' : 'h-2'}`} />
      <div className={`w-1 rounded-full transition-all duration-300 ${barColor} ${active ? 'h-7 animate-bounce' : 'h-2'}`} style={{ animationDelay: '100ms' }} />
      <div className={`w-1 rounded-full transition-all duration-300 ${barColor} ${active ? 'h-4 animate-pulse' : 'h-2'}`} style={{ animationDelay: '200ms' }} />
      <div className={`w-1 rounded-full transition-all duration-300 ${barColor} ${active ? 'h-8 animate-bounce' : 'h-2'}`} style={{ animationDelay: '150ms' }} />
      <div className={`w-1 rounded-full transition-all duration-300 ${barColor} ${active ? 'h-6 animate-pulse' : 'h-2'}`} style={{ animationDelay: '250ms' }} />
      <div className={`w-1 rounded-full transition-all duration-300 ${barColor} ${active ? 'h-3 animate-bounce' : 'h-2'}`} style={{ animationDelay: '180ms' }} />
    </div>
  );
};
