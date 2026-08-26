import React from 'react';
import { useKiosk } from '../../context/KioskContext';
import { TRANSLATIONS } from '../../data/languages';
import { Step1PersonalInfo } from './Step1PersonalInfo';
import { Step2Consent } from './Step2Consent';
import { Step3ReportUpload } from './Step3ReportUpload';
import { Step4AIConsultation } from './Step4AIConsultation';
import { Step5SummarySubmit } from './Step5SummarySubmit';
import { 
  User, 
  FileCheck2, 
  UploadCloud, 
  Stethoscope, 
  Ticket
} from 'lucide-react';

export const PatientWizard: React.FC = () => {
  const { kioskStep, setKioskStep, currentLanguage } = useKiosk();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const STEPS = [
    { num: 1, label: t.step1, icon: <User className="w-4 h-4" /> },
    { num: 2, label: t.step2, icon: <FileCheck2 className="w-4 h-4" /> },
    { num: 3, label: t.step3, icon: <UploadCloud className="w-4 h-4" /> },
    { num: 4, label: t.step4, icon: <Stethoscope className="w-4 h-4" /> },
    { num: 5, label: t.step5, icon: <Ticket className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start">
      
      {/* Clean Stepper */}
      <div className="w-full max-w-2xl mb-6">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {STEPS.map((step) => {
            const isDone = kioskStep > step.num;
            const isCurrent = kioskStep === step.num;

            return (
              <button
                key={step.num}
                onClick={() => {
                  if (step.num <= kioskStep || isDone) {
                    setKioskStep(step.num);
                  }
                }}
                disabled={step.num > kioskStep && !isDone}
                className={`py-2 px-1 sm:px-2 rounded-xl text-center border transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                    : isDone
                    ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    : 'bg-white/60 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="text-xs sm:text-sm font-black">
                  {isDone ? '✓' : step.num}
                </div>
                <div className="text-[10px] sm:text-xs font-bold truncate">
                  {step.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-2xl">
        {kioskStep === 1 && <Step1PersonalInfo />}
        {kioskStep === 2 && <Step2Consent />}
        {kioskStep === 3 && <Step3ReportUpload />}
        {kioskStep === 4 && <Step4AIConsultation />}
        {kioskStep === 5 && <Step5SummarySubmit />}
      </div>

    </div>
  );
};
