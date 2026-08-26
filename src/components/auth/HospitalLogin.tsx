import React, { useState } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { 
  Hospital, 
  Lock, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  KeyRound,
  PlusCircle,
  MapPin
} from 'lucide-react';

export const HospitalLogin: React.FC = () => {
  const { loginHospital } = useKiosk();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  
  // Form fields
  const [hospitalId, setHospitalId] = useState<string>('');
  const [hospitalPassword, setHospitalPassword] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [hospitalBranch, setHospitalBranch] = useState<string>('Main OPD Wing');
  
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!hospitalId.trim() || !hospitalPassword) {
      setErrorMsg('Please enter Hospital ID and Password');
      return;
    }

    if (isRegisterMode && !hospitalName.trim()) {
      setErrorMsg('Please enter the Hospital Name');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginHospital(
        hospitalId.trim(), 
        hospitalPassword, 
        isRegisterMode ? hospitalName.trim() : (hospitalName.trim() || hospitalId.trim())
      );
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid hospital credentials');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Hospital login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100">
      <div className="w-full max-w-md space-y-6">
        
        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20 mb-3">
              <Hospital className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hospital Facility Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isRegisterMode ? 'Register New Hospital' : 'Hospital Login'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isRegisterMode 
                ? 'Register your hospital or clinic facility to start digital OPD operations'
                : 'Enter your Hospital ID and Password to open the clinical station'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                !isRegisterMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hospital Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                isRegisterMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + New Hospital
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Hospital Name (if registering) */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hospital / Clinic Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    placeholder="e.g. City Multi-Specialty Hospital"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Hospital ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Hospital ID / Facility Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={hospitalId}
                  onChange={e => setHospitalId(e.target.value)}
                  placeholder="e.g. HOSP-01 or cityhospital"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 uppercase"
                />
              </div>
            </div>

            {/* Branch / Wing (if registering) */}
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Branch / Location (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={hospitalBranch}
                    onChange={e => setHospitalBranch(e.target.value)}
                    placeholder="e.g. Main Campus / OPD Wing"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Hospital Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={hospitalPassword}
                  onChange={e => setHospitalPassword(e.target.value)}
                  placeholder="Enter hospital password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all mt-3 cursor-pointer"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : isRegisterMode ? (
                <>
                  <span>Register & Open Hospital</span>
                  <PlusCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Open Hospital Station</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Security Badge */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>NABH Certified Hospital Station • MediKiosk Digital System</span>
        </div>

      </div>
    </div>
  );
};
