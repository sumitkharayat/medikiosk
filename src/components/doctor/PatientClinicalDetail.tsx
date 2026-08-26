import React, { useState } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { PatientRecord, DoctorNote, StructuredClinicalHistory } from '../../types';
import { RedFlagBadge } from '../common/RedFlagBadge';
import { StatusBadge } from '../common/StatusBadge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Edit3, 
  Save, 
  RotateCcw, 
  FileText, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Printer, 
  ShieldCheck, 
  User, 
  Eye, 
  Layers, 
  Plus, 
  Trash2,
  Stethoscope,
  HeartCrack,
  Clock
} from 'lucide-react';

interface Props {
  patient: PatientRecord;
  onBack: () => void;
}

export const PatientClinicalDetail: React.FC<Props> = ({ patient, onBack }) => {
  const { 
    updateDoctorNotes, 
    updateDoctorModifiedHistory, 
    confirmDoctorSignOff 
  } = useKiosk();

  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'clinical_history' | 'reports_ocr' | 'doctor_plan' | 'transcript'>('clinical_history');
  const [selectedReportId, setSelectedReportId] = useState<string>(patient.reports[0]?.id || '');
  const [showSignOffModal, setShowSignOffModal] = useState(false);

  // Form states for editable history
  const activeHistory = {
    ...patient.structuredHistory,
    ...(patient.doctorModifiedHistory || {})
  };

  const [editedHpi, setEditedHpi] = useState(activeHistory.hpi || '');
  const [editedChiefComplaint, setEditedChiefComplaint] = useState(activeHistory.chiefComplaint || patient.personalInfo.chiefComplaint);
  const [editedPmh, setEditedPmh] = useState(activeHistory.pastMedicalHistory.join('\n'));
  const [editedSummary, setEditedSummary] = useState(activeHistory.aiSynthesizedSummary || '');

  // Form states for Doctor's Plan / Clinical Note
  const existingNote = patient.doctorNote;
  const [clinicalImpression, setClinicalImpression] = useState(existingNote?.clinicalImpression || '');
  const [differentialList, setDifferentialList] = useState<string[]>(existingNote?.differentialDiagnosis || ['Acute evaluation pending']);
  const [newDiffInput, setNewDiffInput] = useState('');
  const [carePlanList, setCarePlanList] = useState<string[]>(existingNote?.planOfCare || ['STAT 12-lead ECG and continuous telemetry', 'Blood draw for cardiac enzymes and metabolic panel']);
  const [newPlanInput, setNewPlanInput] = useState('');
  const [prescriptions, setPrescriptions] = useState<string[]>(existingNote?.prescriptionsPrescribed || []);
  const [newRxInput, setNewRxInput] = useState('');

  const [signOffDoctorName, setSignOffDoctorName] = useState(existingNote?.doctorName || 'Dr. Sarah Chen, MD');
  const [signOffDoctorRole, setSignOffDoctorRole] = useState(existingNote?.doctorRole || 'Attending Physician / Internal Medicine');

  const handleSaveEditedHistory = () => {
    const updatedHistory: Partial<StructuredClinicalHistory> = {
      chiefComplaint: editedChiefComplaint,
      hpi: editedHpi,
      pastMedicalHistory: editedPmh.split('\n').filter(s => s.trim().length > 0),
      aiSynthesizedSummary: editedSummary
    };
    updateDoctorModifiedHistory(patient.id, updatedHistory);
    setIsEditingHistory(false);
  };

  const handleAddDiff = () => {
    if (!newDiffInput.trim()) return;
    setDifferentialList([...differentialList, newDiffInput.trim()]);
    setNewDiffInput('');
  };

  const handleAddPlan = () => {
    if (!newPlanInput.trim()) return;
    setCarePlanList([...carePlanList, newPlanInput.trim()]);
    setNewPlanInput('');
  };

  const handleAddRx = () => {
    if (!newRxInput.trim()) return;
    setPrescriptions([...prescriptions, newRxInput.trim()]);
    setNewRxInput('');
  };

  const handleSaveDoctorNotes = () => {
    updateDoctorNotes(patient.id, {
      doctorName: signOffDoctorName,
      doctorRole: signOffDoctorRole,
      clinicalImpression,
      differentialDiagnosis: differentialList,
      planOfCare: carePlanList,
      prescriptionsPrescribed: prescriptions
    });
  };

  const handleConfirmFinalSignOff = () => {
    const finalNote: DoctorNote = {
      id: `doc-sign-${Date.now()}`,
      doctorName: signOffDoctorName,
      doctorRole: signOffDoctorRole,
      timestamp: new Date().toISOString(),
      clinicalImpression: clinicalImpression || 'Clinical history verified and verified with patient.',
      differentialDiagnosis: differentialList,
      planOfCare: carePlanList,
      prescriptionsPrescribed: prescriptions,
      isSignedOff: true,
      signedAt: new Date().toISOString()
    };

    confirmDoctorSignOff(patient.id, finalNote);
    setShowSignOffModal(false);
  };

  const selectedReport = patient.reports.find(r => r.id === selectedReportId) || patient.reports[0];
  const vitals = patient.personalInfo.vitals || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient Queue</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div>
            <span className="text-xs text-slate-500 font-semibold">Queue Token: </span>
            <span className="text-sm font-mono font-bold text-mediblue-700">{patient.personalInfo.queueToken}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Encounter</span>
          </button>

          {patient.isDoctorConfirmed ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Signed & Verified by {patient.doctorNote?.doctorName || 'Doctor'}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowSignOffModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Sign Off Clinical History</span>
            </button>
          )}
        </div>

      </div>

      {/* Patient Banner & Vitals Ribbon */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Patient Details */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-mediblue-50 border border-mediblue-200 text-mediblue-700 flex items-center justify-center font-bold text-lg shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {patient.personalInfo.fullName || 'Patient File'}
                </h1>
                <span className="text-sm text-slate-500 font-bold">
                  {patient.personalInfo.age} yrs • {patient.personalInfo.gender}
                </span>
                <StatusBadge status={patient.status} triagePriority={patient.triagePriority} />
              </div>
              <p className="text-xs text-slate-700 mt-1 font-medium">
                <span className="text-slate-500 font-semibold">Chief Complaint: </span>
                {patient.personalInfo.chiefComplaint}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Phone: {patient.personalInfo.phone} • Intake: {new Date(patient.personalInfo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Native Language: {patient.personalInfo.primaryLanguage?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Vitals Cards */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Blood Pressure</span>
              <span className={`text-sm font-mono font-bold ${vitals.bloodPressureSystolic && vitals.bloodPressureSystolic >= 140 ? 'text-rose-700' : 'text-slate-800'}`}>
                {vitals.bloodPressureSystolic ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}` : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center min-w-[80px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pulse</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                {vitals.heartRate ? `${vitals.heartRate} bpm` : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center min-w-[80px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">SpO2</span>
              <span className={`text-sm font-mono font-bold ${vitals.oxygenSaturation && vitals.oxygenSaturation < 95 ? 'text-rose-700' : 'text-slate-800'}`}>
                {vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center min-w-[80px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Temp</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                {vitals.temperature ? `${vitals.temperature}°F` : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-center min-w-[85px]">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Blood Sugar</span>
              <span className="text-sm font-mono font-bold text-amber-700">
                {vitals.bloodGlucose ? `${vitals.bloodGlucose} mg/dL` : 'N/A'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Red-Flag Alerts Center (Prominent Banner) */}
      {patient.redFlags && patient.redFlags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              Automated Triage Risk Alerts ({patient.redFlags.length})
            </h2>
            <span className="text-xs text-slate-400">Cross-analyzed from Voice AI Interview + Diagnostic OCR + Vitals</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patient.redFlags.map(alert => (
              <RedFlagBadge key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('clinical_history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'clinical_history'
              ? 'bg-mediblue-600 text-white shadow-md shadow-mediblue-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Structured Clinical History</span>
        </button>

        <button
          onClick={() => setActiveTab('reports_ocr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports_ocr'
              ? 'bg-mediblue-600 text-white shadow-md shadow-mediblue-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Uploaded Reports & OCR ({patient.reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('doctor_plan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'doctor_plan'
              ? 'bg-mediblue-600 text-white shadow-md shadow-mediblue-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Impression & Care Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transcript'
              ? 'bg-mediblue-600 text-white shadow-md shadow-mediblue-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Interview Dialogue ({patient.conversationHistory.length})</span>
        </button>
      </div>

      {/* Tab 1: AI Structured Clinical History & Interactive Doctor Editor */}
      {activeTab === 'clinical_history' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Synthesized Clinical History
                </span>
                <p className="text-[11px] text-slate-400">
                  Doctor can edit or correct any AI section inline before final sign-off.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditingHistory ? (
                <>
                  <button
                    onClick={() => setIsEditingHistory(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedHistory}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Edits</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingHistory(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-mediblue-600 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brand-400" />
                  <span>Edit / Correct AI History</span>
                </button>
              )}
            </div>
          </div>

          {/* Clinical Blocks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Cols: HPI, PMH, ROS */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* History of Present Illness */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-mediblue-400">
                    History of Present Illness (HPI)
                  </span>
                  {patient.doctorModifiedHistory?.hpi && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      Doctor Edited
                    </span>
                  )}
                </div>

                {isEditingHistory ? (
                  <textarea
                    rows={6}
                    value={editedHpi}
                    onChange={(e) => setEditedHpi(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-mediblue-500/60 text-white text-sm focus:outline-none leading-relaxed"
                  />
                ) : (
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {activeHistory.hpi}
                  </p>
                )}
              </div>

              {/* Past Medical & Surgical History */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-mediblue-400">
                  Past Medical & Surgical History
                </span>

                {isEditingHistory ? (
                  <textarea
                    rows={4}
                    value={editedPmh}
                    onChange={(e) => setEditedPmh(e.target.value)}
                    placeholder="Enter each condition on a new line"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-mediblue-500/60 text-white text-sm focus:outline-none"
                  />
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
                    {activeHistory.pastMedicalHistory.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {activeHistory.pastSurgicalHistory.map((item, idx) => (
                      <li key={`s-${idx}`} className="text-slate-400">{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Review of Systems (ROS) */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-mediblue-400">
                  Review of Systems (ROS)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-1">Cardiovascular:</span>
                    <span className="text-slate-400">{activeHistory.reviewOfSystems.cardiovascular || 'Negative for chest symptoms'}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-1">Respiratory:</span>
                    <span className="text-slate-400">{activeHistory.reviewOfSystems.respiratory || 'Clear'}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-1">Gastrointestinal:</span>
                    <span className="text-slate-400">{activeHistory.reviewOfSystems.gastrointestinal || 'Negative'}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-1">Neurological:</span>
                    <span className="text-slate-400">{activeHistory.reviewOfSystems.neurological || 'Negative for focal deficits'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Medications, Allergies, Family & Social */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Current Medications */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-brand-400">
                    Current Medications
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeHistory.currentMedications.length} items
                  </span>
                </div>

                <div className="space-y-2">
                  {activeHistory.currentMedications.map((med, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="font-bold text-white">{med.name} {med.dose}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{med.frequency} • {med.compliance}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies & Intolerances */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-rose-900/40 space-y-3">
                <span className="font-bold text-xs uppercase tracking-wider text-rose-400">
                  Allergies & Adverse Reactions
                </span>

                <div className="space-y-2">
                  {activeHistory.allergies.map((all, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">
                      <div className="font-bold">{all.allergen}</div>
                      <div className="text-[11px] text-rose-300/80">{all.reaction} ({all.severity})</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Family & Social History */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Family & Social History
                </span>

                <div className="space-y-2 text-slate-300">
                  <div>
                    <span className="font-bold text-slate-400 block mb-0.5">Family History:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                      {activeHistory.familyHistory.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px]">
                    <p><span className="font-bold text-slate-400">Smoking:</span> {activeHistory.socialHistory?.smoking || 'None'}</p>
                    <p><span className="font-bold text-slate-400">Alcohol:</span> {activeHistory.socialHistory?.alcohol || 'None'}</p>
                    <p><span className="font-bold text-slate-400">Occupation:</span> {activeHistory.socialHistory?.occupation || 'Recorded'}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Uploaded Reports & OCR Biomarkers Side-by-Side */}
      {activeTab === 'reports_ocr' && (
        <div className="space-y-6">
          {patient.reports.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              No diagnostic documents uploaded by this patient.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 4 Cols: Reports List Selector */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Diagnostic Records ({patient.reports.length})
                </span>

                <div className="space-y-2">
                  {patient.reports.map((rep) => {
                    const isSelected = rep.id === (selectedReport?.id || '');

                    return (
                      <button
                        key={rep.id}
                        onClick={() => setSelectedReportId(rep.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-mediblue-950/70 border-mediblue-500 text-white shadow-lg ring-1 ring-mediblue-400'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-xs">{rep.title}</span>
                          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-brand-300">
                            {rep.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {rep.fileName} • {rep.date}
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-2 font-mono">
                          {rep.extractedMarkers.length} biomarkers extracted
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 8 Cols: Detailed OCR & Biomarker Inspection Table */}
              {selectedReport && (
                <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6">
                  
                  {/* Report Header */}
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedReport.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        File: <span className="font-mono text-slate-300">{selectedReport.fileName}</span> ({selectedReport.fileSize || '1.2 MB'}) • Facility: {selectedReport.facility || 'Verified Diagnostic Center'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold">
                      OCR Verified 100%
                    </span>
                  </div>

                  {/* Extracted Biomarkers Table */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-brand-400" />
                      Extracted Diagnostic Biomarkers & Reference Ranges
                    </h4>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="p-3">Biomarker / Test</th>
                            <th className="p-3">Result Value</th>
                            <th className="p-3">Reference Range</th>
                            <th className="p-3">Clinical Context</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-200">
                          {selectedReport.extractedMarkers.map((marker, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 font-semibold text-white">{marker.name}</td>
                              <td className="p-3 font-mono font-bold">{marker.value}</td>
                              <td className="p-3 font-mono text-slate-400">{marker.referenceRange || 'N/A'}</td>
                              <td className="p-3 text-slate-300 text-[11px]">{marker.clinicalContext || '-'}</td>
                              <td className="p-3">
                                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                                  marker.status === 'critical'
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : marker.status === 'high' || marker.status === 'abnormal'
                                    ? 'bg-amber-600 text-white'
                                    : marker.status === 'low'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-emerald-800 text-emerald-100'
                                }`}>
                                  {marker.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Raw OCR Text Snippet */}
                  {selectedReport.extractedText && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                        Raw OCR Full Text Transcript:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {selectedReport.extractedText}
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Tab 3: Doctor Impression & Care Plan Workspace */}
      {activeTab === 'doctor_plan' && (
        <div className="space-y-6 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-mediblue-400" />
              Doctor Clinical Impression, Differential & Order Set
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and finalize clinical management orders before signing off the chart.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Impression & Differential Diagnoses */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Attending Clinical Impression
                </label>
                <textarea
                  rows={4}
                  value={clinicalImpression}
                  onChange={(e) => setClinicalImpression(e.target.value)}
                  placeholder="e.g. 56M with high pre-test probability for Acute Coronary Syndrome / Unstable Angina in setting of Stage 2 HTN and HbA1c 9.4%..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-mediblue-500"
                />
              </div>

              {/* Differential Diagnosis Builder */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Differential Diagnoses (ICD Triage)
                </label>
                <div className="space-y-2 mb-3">
                  {differentialList.map((diff, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      <span>• {diff}</span>
                      <button
                        onClick={() => setDifferentialList(differentialList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDiffInput}
                    onChange={(e) => setNewDiffInput(e.target.value)}
                    placeholder="Add differential (e.g. Unstable Angina, NSTEMI)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleAddDiff}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-mediblue-600 text-white text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Plan of Care & Prescriptions Prescribed */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Clinical Plan of Care & Orders
                </label>
                <div className="space-y-2 mb-3">
                  {carePlanList.map((plan, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                      <span>{idx + 1}. {plan}</span>
                      <button
                        onClick={() => setCarePlanList(carePlanList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlanInput}
                    onChange={(e) => setNewPlanInput(e.target.value)}
                    placeholder="Add clinical plan order..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleAddPlan}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-mediblue-600 text-white text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Prescriptions Prescribed */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Prescriptions Prescribed for Encounter
                </label>
                <div className="space-y-2 mb-3">
                  {prescriptions.map((rx, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
                      <span>Rx: {rx}</span>
                      <button
                        onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRxInput}
                    onChange={(e) => setNewRxInput(e.target.value)}
                    placeholder="Add prescription (e.g. Aspirin 325mg PO Chewable)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={handleAddRx}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold"
                  >
                    + Add Rx
                  </button>
                </div>
              </div>

            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                handleSaveDoctorNotes();
                alert("Doctor clinical plan and impression updated successfully.");
              }}
              className="px-6 py-2.5 rounded-xl bg-mediblue-600 hover:bg-mediblue-500 text-white font-bold text-xs shadow-md"
            >
              Save Doctor Plan
            </button>
          </div>

        </div>
      )}

      {/* Tab 4: AI Voice/Chat Transcript */}
      {activeTab === 'transcript' && (
        <div className="space-y-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Full AI Multilingual Voice Consultation Transcript ({patient.conversationHistory.length} turns)
            </h3>
            <span className="text-xs text-slate-400">Intake Audio & Text Log</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {patient.conversationHistory.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl text-xs space-y-1 ${
                  msg.sender === 'ai'
                    ? 'bg-slate-950 border border-slate-800 text-slate-200'
                    : 'bg-brand-950/40 border border-brand-500/30 text-brand-100 ml-6'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[10px] text-slate-400">
                  <span className="uppercase text-brand-400">{msg.sender === 'ai' ? '🤖 MediKiosk AI Assistant' : '👤 Patient'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.translatedText && (
                  <p className="text-[11px] text-slate-400 italic">Translation: "{msg.translatedText}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Sign-Off & Verification Modal */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Attending Physician Sign-Off</h3>
                <p className="text-xs text-slate-400">Verify and confirm final clinical history & triage routing</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                By digitally signing below, you verify that you have reviewed the AI-generated structured clinical history, cross-referenced diagnostic OCR findings and red-flag alerts for <strong className="text-white">{patient.personalInfo.fullName}</strong>.
              </p>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Attending Physician Name</label>
                <input
                  type="text"
                  value={signOffDoctorName}
                  onChange={(e) => setSignOffDoctorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Role / Department</label>
                <input
                  type="text"
                  value={signOffDoctorRole}
                  onChange={(e) => setSignOffDoctorRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowSignOffModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmFinalSignOff}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Sign Clinical History</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
