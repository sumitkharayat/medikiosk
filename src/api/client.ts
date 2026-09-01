import { 
  PatientRecord, 
  MedicalReport, 
  ChatMessage, 
  DoctorNote, 
  StructuredClinicalHistory, 
  PatientPersonalInfo, 
  ConsentRecord,
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData
} from '../types';

// In local dev this stays '/api' and is proxied to the backend by vite.config.ts.
// On Render (or anywhere the frontend and backend are on different domains), set
// VITE_API_BASE_URL to the backend's full URL, e.g. https://medikiosk-backend.onrender.com/api
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiClient {
  private token: string | null = null;
  private userId: string | null = null;

  setAuth(token: string | null, userId: string | null) {
    this.token = token;
    this.userId = userId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.userId ? { 'x-user-id': this.userId } : {}),
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers as Record<string, string> || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: options.body instanceof FormData ? (this.userId ? { 'x-user-id': this.userId } : undefined) : headers
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.warn(`API request to ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  // --- Authentication ---
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.success && res.token && res.user) {
      this.setAuth(res.token, res.user.id);
    }
    return res;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.success && res.token && res.user) {
      this.setAuth(res.token, res.user.id);
    }
    return res;
  }

  async getMe(): Promise<{ success: boolean; user: User }> {
    return this.request('/auth/me');
  }

  async logout(): Promise<{ success: boolean }> {
    this.setAuth(null, null);
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Health
  async health(): Promise<{ status: string; totalPatients: number; aiModelReady: boolean }> {
    return this.request('/health');
  }

  // Doctor Queue
  async getDoctorQueue(params?: { priority?: string; status?: string; search?: string }): Promise<{
    success: boolean;
    patients: PatientRecord[];
    metrics: { total: number; critical: number; inReview: number; signedOff: number };
  }> {
    const query = new URLSearchParams();
    if (params?.priority) query.append('priority', params.priority);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/doctor/queue${qs}`);
  }

  async getPatient(id: string): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request(`/doctor/patients/${id}`);
  }

  // Patient Intake
  async createPatient(primaryLanguage = 'en'): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify({ primaryLanguage })
    });
  }

  async updatePersonalInfo(
    id: string, 
    info: Partial<PatientPersonalInfo>
  ): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request(`/patients/${id}/personal-info`, {
      method: 'PUT',
      body: JSON.stringify(info)
    });
  }

  async updateConsent(
    id: string, 
    consent: Partial<ConsentRecord>
  ): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request(`/patients/${id}/consent`, {
      method: 'PUT',
      body: JSON.stringify(consent)
    });
  }

  async uploadReportFile(
    id: string, 
    file: File
  ): Promise<{ success: boolean; report: MedicalReport; patient: PatientRecord }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/patients/${id}/reports`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('File upload failed');
    return await response.json();
  }

  async uploadSampleReport(
    id: string, 
    sampleReport: MedicalReport
  ): Promise<{ success: boolean; report: MedicalReport; patient: PatientRecord }> {
    return this.request(`/patients/${id}/reports`, {
      method: 'POST',
      body: JSON.stringify({ sampleReport })
    });
  }

  async deleteReport(
    id: string, 
    reportId: string
  ): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request(`/patients/${id}/reports/${reportId}`, {
      method: 'DELETE'
    });
  }

  async sendChatMessage(
    id: string, 
    message: string, 
    language = 'en'
  ): Promise<{
    success: boolean;
    patientMessage: ChatMessage;
    aiMessage: ChatMessage;
    isComplete: boolean;
    patient: PatientRecord;
  }> {
    return this.request(`/patients/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, language })
    });
  }

  async saveFullPatient(patient: PatientRecord): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request(`/patients/${patient.id}`, {
      method: 'PUT',
      body: JSON.stringify({ patient })
    });
  }

  async synthesize(
    id: string,
    patient?: PatientRecord
  ): Promise<{ success: boolean; patient: PatientRecord; queueToken: string }> {
    return this.request(`/patients/${id}/synthesize`, {
      method: 'POST',
      body: patient ? JSON.stringify({ patient }) : undefined
    });
  }

  // Doctor Operations
  async updateDoctorHistory(
    id: string, 
    history: Partial<StructuredClinicalHistory>
  ): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request(`/doctor/patients/${id}/history`, {
      method: 'PUT',
      body: JSON.stringify(history)
    });
  }

  async updateDoctorNotes(
    id: string, 
    notes: Partial<DoctorNote>
  ): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request(`/doctor/patients/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify(notes)
    });
  }

  async signOff(
    id: string, 
    doctorName: string, 
    doctorRole: string, 
    note?: Partial<DoctorNote>
  ): Promise<{ success: boolean; patient: PatientRecord }> {
    return this.request(`/doctor/patients/${id}/sign-off`, {
      method: 'POST',
      body: JSON.stringify({ doctorName, doctorRole, note })
    });
  }

  async resetSeed(): Promise<{ success: boolean; patients: PatientRecord[] }> {
    return this.request('/doctor/seed', {
      method: 'POST'
    });
  }
}

export const api = new ApiClient();
