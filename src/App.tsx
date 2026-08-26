import React from 'react';
import { useKiosk } from './context/KioskContext';
import { Header } from './components/common/Header';
import { PatientWizard } from './components/patient/PatientWizard';
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { AuthPortal } from './components/auth/AuthPortal';
import { HospitalLogin } from './components/auth/HospitalLogin';

export const App: React.FC = () => {
  const { currentView, isAuthenticated, isHospitalAuthenticated } = useKiosk();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Global Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {!isHospitalAuthenticated ? (
          <HospitalLogin />
        ) : !isAuthenticated ? (
          <AuthPortal />
        ) : currentView === 'kiosk' ? (
          <PatientWizard />
        ) : (
          <DoctorPortal />
        )}
      </main>
    </div>
  );
};

export default App;
