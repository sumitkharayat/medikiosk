import React, { useState } from 'react';
import { useKiosk } from '../../context/KioskContext';
import { PatientRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { OPD_DEPARTMENTS } from '../../data/opdDepartments';
import { 
  Search, 
  ChevronRight,
  Flame,
  CheckCircle2,
  FileText,
  Building2,
  Filter
} from 'lucide-react';

interface Props {
  onSelectPatient: (patientId: string) => void;
}

export const PatientQueue: React.FC<Props> = ({ onSelectPatient }) => {
  const { patients, currentUser } = useKiosk();

  const docSpecialty = currentUser?.specialization || currentUser?.department || 'General Medicine';

  const [activeTab, setActiveTab] = useState<'my_department' | 'all'>('my_department');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const myDeptPatients = patients.filter(p => {
    const pDept = p.assignedDepartment || p.personalInfo.assignedDepartment || 'General Medicine';
    return pDept.toLowerCase() === docSpecialty.toLowerCase();
  });

  const filteredPatients = patients.filter((p: PatientRecord) => {
    const pDept = p.assignedDepartment || p.personalInfo.assignedDepartment || 'General Medicine';
    
    // Tab filtering
    if (activeTab === 'my_department' && pDept.toLowerCase() !== docSpecialty.toLowerCase()) {
      return false;
    }

    // Specific Department filter
    if (activeTab === 'all' && selectedDeptFilter !== 'all' && pDept.toLowerCase() !== selectedDeptFilter.toLowerCase()) {
      return false;
    }

    const nameMatch = p.personalInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.personalInfo.queueToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.personalInfo.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pDept.toLowerCase().includes(searchQuery.toLowerCase());

    const priorityMatch = filterPriority === 'all' || p.triagePriority === filterPriority;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'pending' && !p.isDoctorConfirmed) ||
      (filterStatus === 'confirmed' && p.isDoctorConfirmed) ||
      (filterStatus === 'redflags' && p.redFlags && p.redFlags.length > 0);

    return nameMatch && priorityMatch && statusMatch;
  });

  return (
    <div className="space-y-4">
      
      {/* Department Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('my_department'); setSelectedDeptFilter('all'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my_department'
                ? 'bg-mediblue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>My {docSpecialty} OPD</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
              {myDeptPatients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-mediblue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Hospital OPDs</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black">
              {patients.length}
            </span>
          </button>
        </div>

        {/* Department selector when "All Hospital OPDs" is chosen */}
        {activeTab === 'all' && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-50 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 border border-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All OPD Departments</option>
              {OPD_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.name}>
                  {d.icon} {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'my_department' ? docSpecialty : 'all'} patients by name, token, or symptom...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-mediblue-500 focus:ring-2 focus:ring-mediblue-500/20"
          />
        </div>

        {/* Priority & Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-300 focus:outline-none"
          >
            <option value="all">All Triage Priorities</option>
            <option value="emergency">🚨 Emergency</option>
            <option value="urgent">⚠️ Urgent</option>
            <option value="routine">Routine</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="confirmed">Confirmed / Signed Off</option>
            <option value="redflags">Has Red-Flags</option>
          </select>
        </div>

      </div>

      {/* Patient Queue Cards List */}
      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm shadow-sm">
            No patients found matching criteria.
          </div>
        ) : (
          filteredPatients.map((patient: PatientRecord) => {
            const hasCritical = patient.redFlags?.some((r: any) => r.severity === 'critical');
            const vitals = patient.personalInfo.vitals || {};

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md ${
                  hasCritical && !patient.isDoctorConfirmed
                    ? 'bg-rose-50/50 border-rose-300 hover:border-rose-400'
                    : patient.isDoctorConfirmed
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-mediblue-400'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left Demographics & Complaint */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                      patient.triagePriority === 'emergency'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : patient.triagePriority === 'urgent'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-mediblue-100 text-mediblue-800 border-mediblue-300'
                    }`}>
                      {patient.personalInfo.queueToken}
                    </div>

                    <div className="min-w-0 space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-slate-900 group-hover:text-mediblue-700 transition-colors">
                          {patient.personalInfo.fullName || 'Anonymous Patient'}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          ({patient.personalInfo.age}y, {patient.personalInfo.gender})
                        </span>
                        <StatusBadge status={patient.status} triagePriority={patient.triagePriority} />
                        
                        {/* OPD Department Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mediblue-50 text-mediblue-800 border border-mediblue-200 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-mediblue-600" />
                          <span>{patient.assignedDepartment || patient.personalInfo.assignedDepartment || 'General Medicine'}</span>
                          <span className="opacity-60">•</span>
                          <span className="text-emerald-700 font-bold">{patient.assignedChamber || patient.personalInfo.assignedChamber || 'OPD Chamber 101'}</span>
                        </span>

                        {patient.personalInfo.primaryLanguage && patient.personalInfo.primaryLanguage !== 'en' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase border border-slate-200">
                            Lang: {patient.personalInfo.primaryLanguage}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 font-medium line-clamp-1">
                        <span className="text-slate-500 font-semibold">Complaint: </span>
                        {patient.personalInfo.chiefComplaint}
                      </p>

                      {/* OPD Routing Reason */}
                      {(patient.routingReason || patient.personalInfo.routingReason) && (
                        <p className="text-[11px] text-teal-700 font-medium bg-teal-50/70 px-2 py-0.5 rounded-md border border-teal-200/60 inline-block">
                          💡 {patient.routingReason || patient.personalInfo.routingReason}
                        </p>
                      )}

                      {/* Vitals Summary Strip */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        {vitals.bloodPressureSystolic && (
                          <span className={`font-mono ${vitals.bloodPressureSystolic >= 140 ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                            BP: {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} mmHg
                          </span>
                        )}
                        {vitals.heartRate && (
                          <span className="font-mono text-slate-700">HR: {vitals.heartRate} bpm</span>
                        )}
                        {patient.reports && patient.reports.length > 0 && (
                          <span className="text-teal-700 font-semibold flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {patient.reports.length} report(s)
                          </span>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Right Action */}
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                    
                    {patient.redFlags && patient.redFlags.length > 0 ? (
                      <div className="flex items-center gap-1.5 bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-300 text-xs font-bold text-rose-800">
                        <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                        <span>{patient.redFlags.length} Red-Flags</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Clear of Critical Flags</span>
                      </div>
                    )}

                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 group-hover:bg-mediblue-600 text-slate-700 group-hover:text-white text-xs font-bold transition-all shadow-sm">
                      <span>View Chart</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
