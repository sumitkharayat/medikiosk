import React from 'react';
import { useKiosk } from '../../context/KioskContext';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../../data/languages';
import { 
  Stethoscope, 
  User, 
  HeartPulse, 
  LogOut, 
  Globe2,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    currentLanguage, 
    setCurrentLanguage,
    currentUser,
    isAuthenticated,
    hospitalSession,
    isHospitalAuthenticated,
    logoutHospital,
    logout,
    patients,
    isBackendConnected
  } = useKiosk();

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const emergencyCount = patients.filter(p => p.triagePriority === 'emergency' && !p.isDoctorConfirmed).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Medi<span className="text-emerald-600">Kiosk</span>
                </span>
                {isHospitalAuthenticated && hospitalSession && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    🏥 {hospitalSession.hospitalName} ({hospitalSession.hospitalId})
                  </span>
                )}
                <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                  isBackendConnected 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                  {isBackendConnected ? t.online : t.connecting}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Right Area: Language Selector + User Info / Logout */}
          <div className="flex items-center space-x-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:border-emerald-500 transition-colors">
                <Globe2 className="w-4 h-4 text-emerald-600" />
                <select
                  value={currentLanguage}
                  onChange={e => setCurrentLanguage(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Authenticated User Controls */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center space-x-2.5">
                
                {/* Doctor View Switcher (If Doctor is logged in) */}
                {currentUser.role === 'doctor' && (
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setCurrentView('doctor')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentView === 'doctor'
                          ? 'bg-mediblue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{t.doctorRole}</span>
                      {emergencyCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black animate-pulse">
                          {emergencyCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setCurrentView('kiosk')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentView === 'kiosk'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{t.patientRole}</span>
                    </button>
                  </div>
                )}

                {/* User Pill with OPD Department */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className={`w-2 h-2 rounded-full ${currentUser.role === 'doctor' ? 'bg-mediblue-500' : 'bg-emerald-500'}`} />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 max-w-[140px] truncate">{currentUser.fullName}</span>
                    {currentUser.role === 'doctor' && currentUser.specialization && (
                      <span className="text-[9px] font-semibold text-mediblue-700 truncate">
                        {currentUser.specialization} ({currentUser.chamberNumber || 'OPD'})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 px-1.5 py-0.5 bg-slate-200 rounded">
                    {currentUser.role === 'doctor' ? t.doctorRole : t.patientRole}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                  title={t.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>

              </div>
            ) : null}

          </div>

        </div>
      </div>
    </header>
  );
};
