import React from 'react';
import { useKiosk } from '../../context/KioskContext';
import { PatientQueue } from './PatientQueue';
import { PatientClinicalDetail } from './PatientClinicalDetail';
import { 
  Stethoscope, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Users, 
  Building2,
  Calendar,
  GraduationCap
} from 'lucide-react';

export const DoctorPortal: React.FC = () => {
  const { 
    patients, 
    selectedDoctorPatient, 
    selectedDoctorPatientId, 
    setSelectedDoctorPatientId,
    refreshPatientsList,
    currentUser
  } = useKiosk();

  // Auto-refresh patient queue from backend every 3.5 seconds
  React.useEffect(() => {
    refreshPatientsList();
    const interval = setInterval(() => {
      refreshPatientsList();
    }, 3500);
    return () => clearInterval(interval);
  }, [refreshPatientsList]);

  const docName = currentUser?.fullName || 'Dr. Attending Physician';
  const docSpecialty = currentUser?.specialization || currentUser?.department || 'General Medicine';
  const docChamber = currentUser?.chamberNumber || 'OPD Chamber 101';
  const docQual = currentUser?.qualification || 'MBBS, MD';
  const docHours = currentUser?.consultationHours || '09:00 AM - 02:00 PM';

  // Metrics
  const totalPatients = patients.length;
  const criticalCount = patients.filter(p => p.triagePriority === 'emergency' && !p.isDoctorConfirmed).length;
  const pendingReviewCount = patients.filter(p => (p.status === 'ai_completed' || p.status === 'doctor_reviewing') && !p.isDoctorConfirmed).length;
  const confirmedCount = patients.filter(p => p.isDoctorConfirmed).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-6">
        
        {/* Doctor Header Banner with OPD Specialization */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-mediblue-600 flex items-center justify-center text-white shadow-md shadow-mediblue-600/20">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">{docName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-mediblue-50 text-mediblue-700 border border-mediblue-200 text-xs font-bold flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {docSpecialty} OPD
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    {docChamber}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {docQual}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Shift: {docHours}</span>
                </div>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" /> Total
                </span>
                <span className="text-xl font-extrabold text-slate-800 mt-0.5 block">{totalPatients}</span>
              </div>

              <div className="bg-rose-50/80 p-3 rounded-2xl border border-rose-200 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500" /> Emergency
                </span>
                <span className="text-xl font-extrabold text-rose-600 mt-0.5 block">{criticalCount}</span>
              </div>

              <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> In Review
                </span>
                <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">{pendingReviewCount}</span>
              </div>

              <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Signed Off
                </span>
                <span className="text-xl font-extrabold text-emerald-600 mt-0.5 block">{confirmedCount}</span>
              </div>

            </div>

          </div>
        </div>

        {/* Doctor Split View: Queue vs Patient Clinical Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`${selectedDoctorPatientId ? 'lg:col-span-4' : 'lg:col-span-12'} transition-all duration-300`}>
            <PatientQueue
              onSelectPatient={(id) => setSelectedDoctorPatientId(id)}
            />
          </div>

          {selectedDoctorPatient && (
            <div className="lg:col-span-8 animate-fadeIn">
              <PatientClinicalDetail
                patient={selectedDoctorPatient}
                onBack={() => setSelectedDoctorPatientId(null)}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
