import React, { useState } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { TRANSLATIONS } from '../../data/languages';
import { OPD_DEPARTMENTS } from '../../data/opdDepartments';
import { 
  UserRole, 
  LoginCredentials, 
  RegisterData 
} from '../../types';
import { 
  User, 
  Stethoscope, 
  Lock, 
  Phone, 
  ArrowRight, 
  AlertCircle,
  Hospital,
  Building2,
  LogOut
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const { login, register, currentLanguage, hospitalSession, logoutHospital } = useKiosk();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  
  // Login Form
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Register Form
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  
  // Doctor OPD Profile
  const [department, setDepartment] = useState<string>('General Medicine');
  const [chamberNumber, setChamberNumber] = useState<string>('OPD Chamber 101');
  const [qualification, setQualification] = useState<string>('MBBS, MD');
  const [experienceYears, setExperienceYears] = useState<number>(8);
  const [consultationHours, setConsultationHours] = useState<string>('09:00 AM - 02:00 PM');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDepartmentChange = (deptName: string) => {
    setDepartment(deptName);
    const found = OPD_DEPARTMENTS.find(d => d.name === deptName);
    if (found) {
      setChamberNumber(found.chamber);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim() || !password) {
      setErrorMsg(selectedRole === 'patient' ? `${t.mobileOrId} & ${t.password}` : `${t.doctorIdOrLicense} & ${t.password}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({
        identifier: identifier.trim(),
        password,
        role: selectedRole
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim() || !password) {
      setErrorMsg(t.nameRequired);
      return;
    }

    setIsLoading(true);
    try {
      const data: RegisterData = {
        fullName: fullName.trim(),
        phone: phone.trim() || identifier.trim(),
        identifier: phone.trim() || identifier.trim(),
        password,
        role: selectedRole,
        age: Number(age) || 30,
        gender,
        primaryLanguage: currentLanguage,
        department: selectedRole === 'doctor' ? department : undefined,
        specialization: selectedRole === 'doctor' ? department : undefined,
        chamberNumber: selectedRole === 'doctor' ? chamberNumber : undefined,
        qualification: selectedRole === 'doctor' ? qualification : undefined,
        experienceYears: selectedRole === 'doctor' ? Number(experienceYears) : undefined,
        consultationHours: selectedRole === 'doctor' ? consultationHours : undefined,
        licenseNumber: selectedRole === 'doctor' ? licenseNumber : undefined
      };

      const res = await register(data);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-100">
      
      {/* Hospital Station Top Bar */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Hospital className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              {hospitalSession?.hospitalName || 'MediKiosk Hospital'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ID: {hospitalSession?.hospitalId || 'HOSP-01'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={logoutHospital}
          className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors"
          title="Exit Hospital Facility"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit Hospital</span>
        </button>
      </div>

      <div className="w-full max-w-lg">
        
        {/* Main Clean Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          {/* Header Title */}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isRegisterMode ? t.registerTitle : t.signInTitle}
            </h1>
            <p className="text-sm text-slate-500">
              {isRegisterMode ? 'Create your account to continue' : t.signInSubtitle}
            </p>
          </div>

          {/* Simple Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('patient');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                selectedRole === 'patient'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.patientRole}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('doctor');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                selectedRole === 'doctor'
                  ? 'bg-mediblue-600 text-white shadow-md shadow-mediblue-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.doctorRole}</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          {!isRegisterMode ? (
            // ---------------- LOGIN FORM ----------------
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {selectedRole === 'patient' ? t.mobileOrId : t.doctorIdOrLicense}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {selectedRole === 'patient' ? <Phone className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={selectedRole === 'patient' ? 'Phone number, Name, or ID' : 'Doctor Name, Phone, or ID'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t.enterPassword}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                  selectedRole === 'patient'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-mediblue-600 hover:bg-mediblue-700 shadow-mediblue-600/20'
                }`}
              >
                {isLoading ? (
                  <span>{t.signingIn}</span>
                ) : (
                  <>
                    <span>{t.signInBtn} ({selectedRole === 'patient' ? t.patientRole : t.doctorRole})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            // ---------------- REGISTER FORM ----------------
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.fullNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={selectedRole === 'doctor' ? 'Dr. Rajesh Sharma' : 'Rahul Kumar'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.mobileLabel}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {t.ageLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.genderLabel}
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                </select>
              </div>

              {/* Doctor OPD Fields */}
              {selectedRole === 'doctor' && (
                <div className="space-y-3 bg-mediblue-50/50 p-3.5 rounded-2xl border border-mediblue-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-mediblue-900">
                    <Building2 className="w-4 h-4 text-mediblue-600" />
                    <span>OPD Department Profile</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        OPD Specialization
                      </label>
                      <select
                        value={department}
                        onChange={e => handleDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-mediblue-500"
                      >
                        {OPD_DEPARTMENTS.map(d => (
                          <option key={d.id} value={d.name}>
                            {d.icon} {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Assigned Chamber Room
                      </label>
                      <input
                        type="text"
                        value={chamberNumber}
                        onChange={e => setChamberNumber(e.target.value)}
                        placeholder="OPD Chamber 101"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Qualification
                      </label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={e => setQualification(e.target.value)}
                        placeholder="MBBS, MD"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        License No.
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={e => setLicenseNumber(e.target.value)}
                        placeholder="MCI-2024-5541"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {t.password}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.enterPassword}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? <span>{t.registering}</span> : <span>{t.createAccountBtn}</span>}
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
              }}
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              {!isRegisterMode ? t.needAccount : t.alreadyAccount}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
