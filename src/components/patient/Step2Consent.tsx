import React from 'react';
import { useKiosk } from '../../context/KioskContext';
import { TRANSLATIONS } from '../../data/languages';
import { 
  FileCheck2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Lock
} from 'lucide-react';

export const Step2Consent: React.FC = () => {
  const { updateActiveKioskPatient, setKioskStep, currentLanguage } = useKiosk();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const handleConfirmConsent = () => {
    updateActiveKioskPatient(prev => ({
      ...prev,
      consent: {
        granted: true,
        timestamp: new Date().toISOString(),
        agreedToAIProcessing: true,
        agreedToDataSharingWithDoctor: true,
        termsAccepted: true
      }
    }));
    setKioskStep(3);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {t.step2Title}
        </h2>
        <p className="text-sm text-slate-500">
          {t.step2Subtitle}
        </p>
      </div>

      {/* 1-Click Plain Consent Card (No hand drawing needed) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        
        <div className="flex items-start gap-4 p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-emerald-950">
              {t.consentAgreeBox}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
              {t.consentAgreeSubtitle}
            </p>
          </div>
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            100% Private & Confidential. Your medical data is strictly protected under hospital clinical privacy standards.
          </span>
        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setKioskStep(1)}
          className="py-4 rounded-2xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <button
          type="button"
          onClick={handleConfirmConsent}
          className="py-4 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span>{t.consentConfirmBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
