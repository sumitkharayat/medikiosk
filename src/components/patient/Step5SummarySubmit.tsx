import React, { useState, useEffect } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { TRANSLATIONS } from '../../data/languages';
import { getDepartmentById } from '../../data/opdDepartments';
import { 
  CheckCircle2, 
  Printer, 
  RotateCcw, 
  Clock, 
  Stethoscope,
  Building2,
  Calendar,
  GraduationCap
} from 'lucide-react';

export const Step5SummarySubmit: React.FC = () => {
  const { 
    activeKioskPatient, 
    submitKioskIntake, 
    resetKiosk, 
    currentLanguage,
    currentUser,
    setCurrentView
  } = useKiosk();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [isProcessing, setIsProcessing] = useState(true);
  const [queueToken, setQueueToken] = useState<string>('');

  useEffect(() => {
    const runSubmit = async () => {
      try {
        const token = await submitKioskIntake();
        setQueueToken(token || activeKioskPatient.personalInfo.queueToken);
      } catch (e) {
        setQueueToken(activeKioskPatient.personalInfo.queueToken);
      } finally {
        setIsProcessing(false);
      }
    };
    runSubmit();
  }, []);

  const info = activeKioskPatient.personalInfo;
  const assignedDeptName = activeKioskPatient.assignedDepartment || info.assignedDepartment || 'General Medicine';
  const dept = getDepartmentById(assignedDeptName);
  const assignedDoctorName = activeKioskPatient.assignedDoctorName || info.assignedDoctorName || dept.defaultDoctor.name;
  const assignedChamber = activeKioskPatient.assignedChamber || info.assignedChamber || dept.chamber;

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      
      {isProcessing ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">
            {t.step5Subtitle}
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Routing patient to specialized OPD physician queue & chamber...
          </p>
        </div>
      ) : (
        <>
          {/* Success Slip Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-600/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold inline-block">
                ✓ {t.tokenSuccess}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t.step5Title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {t.step5Subtitle}
              </p>
            </div>

            {/* Big Token Number Display */}
            <div className="bg-emerald-50/80 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                {t.tokenLabel}
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-emerald-700">
                {queueToken || info.queueToken || 'MED-4535'}
              </div>
              <div className="text-xs text-emerald-950 font-bold">
                {info.fullName || 'Patient'} • Age: {info.age} • Gender: {info.gender}
              </div>
            </div>

            {/* Prominent Assigned Doctor & OPD Specialist Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 text-left space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" /> Assigned Attending Specialist
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black">
                  {dept.defaultDoctor.rating}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">{assignedDoctorName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                    <span>{dept.defaultDoctor.qualification}</span>
                  </p>
                </div>
                
                <div className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-center self-start sm:self-center font-black text-xs shadow-md">
                  🚪 {assignedChamber}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-slate-200">{dept.name} OPD</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OPD Timings: {dept.defaultDoctor.consultationHours}</span>
                </span>
              </div>
            </div>

            {/* Waiting Instructions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-0.5">{t.waitingTitle}</strong>
                Please proceed directly to <span className="font-extrabold text-slate-900">{assignedChamber}</span> for consultation with <span className="font-extrabold text-slate-900">{assignedDoctorName}</span>. Your clinical intake and AI synthesis have been transferred to the doctor queue.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>{t.printSlip}</span>
              </button>

              {currentUser?.role === 'doctor' && (
                <button
                  type="button"
                  onClick={() => setCurrentView('doctor')}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-mediblue-600 hover:bg-mediblue-700 flex items-center justify-center gap-2 shadow-md shadow-mediblue-600/20 transition-all"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{t.doctorQueueBtn}</span>
                </button>
              )}

              <button
                type="button"
                onClick={resetKiosk}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 mx-auto pt-2 transition-colors font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.startNewCheckIn}</span>
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
