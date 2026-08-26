import React, { useState, useRef } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { TRANSLATIONS } from '../../data/languages';
import { MedicalReport } from '../../types';
import { 
  FileText, 
  CheckCircle2, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Camera
} from 'lucide-react';

export const Step3ReportUpload: React.FC = () => {
  const { activeKioskPatient, addMedicalReportToKiosk, removeMedicalReportFromKiosk, setKioskStep, currentLanguage } = useKiosk();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reports = activeKioskPatient.reports || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newReport: MedicalReport = {
        id: `rep-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
        type: file.name.toLowerCase().includes('ecg') ? 'ecg' : 'lab',
        date: new Date().toISOString().split('T')[0],
        facility: 'Uploaded Report',
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        extractedMarkers: [
          { name: 'Document Attached', value: 'Ready', status: 'normal' }
        ]
      };
      await addMedicalReportToKiosk(newReport, file);
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {t.step3Title}
        </h2>
        <p className="text-sm text-slate-500">
          {t.step3Subtitle}
        </p>
      </div>

      {/* Upload Zone (Clean Single Action for Taking Photo or Choosing File) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 text-center shadow-sm">
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-10 px-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 flex flex-col items-center justify-center gap-3 group transition-all cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-110 flex items-center justify-center transition-transform shadow-sm">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 block">
              {isUploading ? 'Analyzing Report...' : `📷 ${t.uploadBtnText}`}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              {t.uploadBtnSubtext}
            </span>
          </div>
        </button>

        {/* Attached Reports List */}
        {reports.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-2 text-left">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              {t.attachedReports} ({reports.length}):
            </span>
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{rep.title}</div>
                    <div className="text-xs text-slate-500">{rep.fileName} • {rep.date}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMedicalReportFromKiosk(rep.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setKioskStep(2)}
          className="py-4 rounded-2xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <button
          type="button"
          onClick={() => setKioskStep(4)}
          className="py-4 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span>{t.continueToAI}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
