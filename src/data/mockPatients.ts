import { PatientRecord, MedicalReport } from '../types';

export const SAMPLE_REPORTS_LIBRARY: MedicalReport[] = [
  {
    id: 'rep-sample-1',
    title: 'Comprehensive Metabolic Panel & Lipid Profile',
    type: 'lab',
    date: '2026-07-15',
    facility: 'Metro Diagnostics Laboratory',
    fileName: 'Metabolic_Lipid_Panel_July2026.pdf',
    fileSize: '1.4 MB',
    extractedText: 'Patient: Fasting blood chemistry. Total Cholesterol: 245 mg/dL (High), LDL: 168 mg/dL (High), HDL: 38 mg/dL (Low), Fasting Glucose: 164 mg/dL (High), HbA1c: 9.4% (Critical/Uncontrolled), Triglycerides: 210 mg/dL. Renal function: Serum Creatinine 1.2 mg/dL, eGFR 72 mL/min.',
    extractedMarkers: [
      { name: 'HbA1c', value: '9.4%', referenceRange: '4.0 - 5.6%', status: 'critical', clinicalContext: 'Significantly uncontrolled glycemic control' },
      { name: 'Fasting Plasma Glucose', value: '164 mg/dL', referenceRange: '70 - 99 mg/dL', status: 'high', clinicalContext: 'Fasting hyperglycemia' },
      { name: 'Total Cholesterol', value: '245 mg/dL', referenceRange: '< 200 mg/dL', status: 'high', clinicalContext: 'Hyperlipidemia' },
      { name: 'LDL Cholesterol', value: '168 mg/dL', referenceRange: '< 100 mg/dL', status: 'high', clinicalContext: 'Elevated atherogenic risk' },
      { name: 'HDL Cholesterol', value: '38 mg/dL', referenceRange: '> 40 mg/dL', status: 'low', clinicalContext: 'Suboptimal cardiovascular protection' },
      { name: 'Serum Creatinine', value: '1.2 mg/dL', referenceRange: '0.7 - 1.3 mg/dL', status: 'normal', clinicalContext: 'Baseline renal function' }
    ],
    extractedMedications: ['Metformin 500mg BID (subtherapeutic)', 'Atorvastatin 10mg (poor compliance)'],
    extractedDiagnoses: ['Type 2 Diabetes Mellitus with poor control', 'Mixed Hyperlipidemia'],
    isSample: true
  },
  {
    id: 'rep-sample-2',
    title: '12-Lead Electrocardiogram (ECG) Report',
    type: 'ecg',
    date: '2026-08-10',
    facility: 'St. Jude Heart & Vascular Center',
    fileName: 'ECG_12Lead_Traces.pdf',
    fileSize: '2.1 MB',
    extractedText: 'ECG Findings: Normal Sinus Rhythm at 88 bpm. PR Interval: 162 ms. QRS Duration: 94 ms. Non-specific ST segment depressions (0.8mm) observed in leads V4-V6. T-wave inversions in lateral leads (I, aVL). Borderline left ventricular hypertrophy by Sokolow-Lyon criteria.',
    extractedMarkers: [
      { name: 'Heart Rate (ECG)', value: '88 bpm', referenceRange: '60 - 100 bpm', status: 'normal', clinicalContext: 'Sinus rhythm' },
      { name: 'ST Segment Depression', value: '0.8 mm (V4-V6)', referenceRange: '0 mm', status: 'abnormal', clinicalContext: 'Possible anterolateral subendocardial ischemia' },
      { name: 'T-Wave Morphology', value: 'Inverted (I, aVL)', referenceRange: 'Upright', status: 'abnormal', clinicalContext: 'Lateral strain or ischemic change' },
      { name: 'QRS Axis', value: '-15°', referenceRange: '-30° to +90°', status: 'normal', clinicalContext: 'Normal axis' }
    ],
    extractedDiagnoses: ['Lateral ST-T abnormalities', 'Rule out coronary artery disease/ischemia'],
    isSample: true
  },
  {
    id: 'rep-sample-3',
    title: 'Brain MRI (3T Non-Contrast) with Angiography',
    type: 'imaging',
    date: '2026-06-04',
    facility: 'Apex Advanced Imaging Institute',
    fileName: 'MRI_Brain_Angio_Scan.pdf',
    fileSize: '3.8 MB',
    extractedText: 'Indication: Refractory unilateral hemicranial throbbing headaches with scintillating photopsia. Findings: No acute intracranial hemorrhage, territorial infarction, or mass effect. Mild punctate T2/FLAIR hyperintensities in deep subcortical white matter, non-specific, commonly seen in chronic migraineurs. MRA demonstrates normal intracranial arterial caliber without aneurysm or vascular malformation.',
    extractedMarkers: [
      { name: 'T2/FLAIR White Matter', value: 'Punctate subcortical foci', referenceRange: 'Clear', status: 'abnormal', clinicalContext: 'Typical non-specific microvascular/migrainous changes' },
      { name: 'Mass Effect / Midline Shift', value: 'None (0 mm)', referenceRange: 'None', status: 'normal', clinicalContext: 'No space-occupying lesion' },
      { name: 'Intracranial MRA Vasculature', value: 'Patent without stenosis/aneurysm', referenceRange: 'Normal', status: 'normal', clinicalContext: 'No vascular anomaly' }
    ],
    extractedDiagnoses: ['Chronic Migraine with Aura', 'No acute intracranial pathology'],
    isSample: true
  },
  {
    id: 'rep-sample-4',
    title: 'Pulmonary Function Spirometry & FeNO Report',
    type: 'lab',
    date: '2026-05-19',
    facility: 'Chest & Allergy Specialty Clinic',
    fileName: 'Spirometry_FeNO_Report.pdf',
    fileSize: '1.2 MB',
    extractedText: 'Pre-bronchodilator FEV1/FVC: 68% (Obstructive defect). FEV1: 2.15 L (62% of predicted). Post-albuterol 400mcg: FEV1 increased to 2.68 L (+24.6% improvement, +530 mL), demonstrating significant acute bronchodilator reversibility. FeNO: 52 ppb (Elevated eosinophilic airway inflammation).',
    extractedMarkers: [
      { name: 'FEV1 / FVC Ratio', value: '68%', referenceRange: '> 75%', status: 'low', clinicalContext: 'Airflow obstruction' },
      { name: 'FEV1 Reversibility', value: '+24.6% (+530 mL)', referenceRange: '< 12% & < 200mL', status: 'critical', clinicalContext: 'Positive bronchodilator reversibility confirmative of asthma' },
      { name: 'FeNO (Fractional Exhaled NO)', value: '52 ppb', referenceRange: '< 25 ppb', status: 'high', clinicalContext: 'Active eosinophilic Th2 airway inflammation' }
    ],
    extractedMedications: ['Albuterol HFA Inhaler 2 puffs PRN', 'Fluticasone/Salmeterol 250/50 mcg Diskus'],
    extractedDiagnoses: ['Moderate Persistent Bronchial Asthma with acute hyperreactivity'],
    isSample: true
  }
];

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat-101',
    personalInfo: {
      id: 'pat-101',
      queueToken: 'MED-8902',
      fullName: 'Rajeev Sharma',
      age: 56,
      gender: 'male',
      phone: '+1 (555) 342-9811',
      email: 'rajeev.sharma@example.com',
      emergencyContactName: 'Priya Sharma (Wife)',
      emergencyContactPhone: '+1 (555) 342-9812',
      primaryLanguage: 'en',
      chiefComplaint: 'Substernal pressure-like chest tightness radiating to left arm on exertion for 3 days, accompanied by diaphoresis.',
      vitals: {
        bloodPressureSystolic: 158,
        bloodPressureDiastolic: 96,
        heartRate: 92,
        temperature: 98.6,
        temperatureUnit: 'F',
        oxygenSaturation: 97,
        bloodGlucose: 178,
        heightCm: 172,
        weightKg: 86
      },
      createdAt: '2026-08-22T08:15:00Z'
    },
    consent: {
      granted: true,
      timestamp: '2026-08-22T08:16:30Z',
      agreedToAIProcessing: true,
      agreedToDataSharingWithDoctor: true,
      termsAccepted: true
    },
    reports: [SAMPLE_REPORTS_LIBRARY[0], SAMPLE_REPORTS_LIBRARY[1]],
    conversationHistory: [
      {
        id: 'c1',
        sender: 'ai',
        text: 'Hello Rajeev, I am your MediKiosk AI Clinical Assistant. What primary symptom or health concern brings you in today?',
        language: 'en',
        timestamp: '08:17 AM',
        category: 'complaint'
      },
      {
        id: 'c2',
        sender: 'patient',
        text: 'I have had a heavy, squeezing sensation in the middle of my chest for the past 3 days. It gets worse when I climb stairs or walk quickly.',
        language: 'en',
        timestamp: '08:17 AM'
      },
      {
        id: 'c3',
        sender: 'ai',
        text: 'Does this chest pressure travel or radiate anywhere, such as to your jaw, neck, back, or left arm? And are you having any shortness of breath or cold sweats?',
        language: 'en',
        timestamp: '08:18 AM',
        category: 'redflag'
      },
      {
        id: 'c4',
        sender: 'patient',
        text: 'Yes, it spreads down into my left shoulder and arm. Yesterday evening I felt lightheaded and broke into a heavy cold sweat while resting on the sofa.',
        language: 'en',
        timestamp: '08:19 AM'
      },
      {
        id: 'c5',
        sender: 'ai',
        text: 'Thank you for explaining. How long do these episodes typically last? What medications do you currently take regularly, and do you have any drug allergies?',
        language: 'en',
        timestamp: '08:20 AM',
        category: 'medication'
      },
      {
        id: 'c6',
        sender: 'patient',
        text: 'Each episode lasts about 15 to 20 minutes before slowly easing off. I take Metformin 500mg once or twice a day, but I often forget my cholesterol pill. I had severe hives and facial swelling from Penicillin in the past.',
        language: 'en',
        timestamp: '08:21 AM'
      },
      {
        id: 'c7',
        sender: 'ai',
        text: 'Understood. I have logged your severe Penicillin allergy (anaphylactoid hives/angioedema). Do you have a family history of heart attacks or coronary bypass before age 55?',
        language: 'en',
        timestamp: '08:21 AM',
        category: 'family'
      },
      {
        id: 'c8',
        sender: 'patient',
        text: 'Yes, my father suffered a myocardial infarction at age 51, and his brother has coronary stents.',
        language: 'en',
        timestamp: '08:22 AM'
      }
    ],
    redFlags: [
      {
        id: 'rf-1',
        category: 'cardiovascular',
        severity: 'critical',
        title: 'High-Risk Unstable Angina Pattern / Acute Coronary Syndrome Risk',
        description: 'Substernal squeezing pressure radiating to left arm + diaphoresis + exertion-triggered lasting 15-20 min. Strong paternal history of premature CAD (<55y).',
        source: 'combined',
        suggestedAction: 'Immediate STAT 12-lead ECG, High-Sensitivity Troponin I, Continuous Cardiac Telemetry, IV Access.'
      },
      {
        id: 'rf-2',
        category: 'vital_sign',
        severity: 'high',
        title: 'Stage 2 Hypertension with Tachycardia',
        description: 'Vitals at intake: BP 158/96 mmHg, Heart Rate 92 bpm, Blood Glucose 178 mg/dL.',
        source: 'vitals',
        suggestedAction: 'Re-check automated BP in both arms, assess end-organ symptoms.'
      },
      {
        id: 'rf-3',
        category: 'allergy',
        severity: 'critical',
        title: 'Severe Anaphylactoid Allergy to Penicillin (Beta-Lactams)',
        description: 'Patient reports severe urticaria and facial angioedema. Avoid all penicillin derivatives and evaluate cephalosporin cross-reactivity.',
        source: 'ai_interview',
        suggestedAction: 'Flag electronic prescribing safety firewall against all Beta-lactams.'
      },
      {
        id: 'rf-4',
        category: 'metabolic',
        severity: 'high',
        title: 'Severely Uncontrolled Type 2 Diabetes (HbA1c 9.4%) & Atherogenic Dyslipidemia',
        description: 'Previous report confirms HbA1c 9.4%, Fasting Glucose 164 mg/dL, LDL 168 mg/dL with irregular medication adherence.',
        source: 'report_ocr',
        suggestedAction: 'Optimize anti-diabetic and high-intensity statin therapy following acute cardiac evaluation.'
      }
    ],
    structuredHistory: {
      chiefComplaint: 'Chest tightness radiating to left upper extremity with diaphoresis (duration 3 days)',
      hpi: '56-year-old male with poorly controlled Type 2 Diabetes Mellitus and dyslipidemia presents with a 3-day history of recurrent, exertional substernal squeezing chest discomfort. Episodes typically last 15-20 minutes, exacerbated by moderate physical activity (stair climbing) and partially resolving with rest. Yesterday evening, the patient experienced rest discomfort accompanied by diaphoresis and lightheadedness. Pain radiates down the left shoulder and medial arm. Denies hemoptysis, fever, or prior known coronary interventions.',
      pastMedicalHistory: [
        'Type 2 Diabetes Mellitus (diagnosed 6 years ago, poorly controlled HbA1c 9.4%)',
        'Mixed Hyperlipidemia (elevated LDL 168 mg/dL)',
        'Essential Hypertension (Stage 2)'
      ],
      pastSurgicalHistory: ['Laparoscopic Appendectomy (2014)'],
      currentMedications: [
        { name: 'Metformin', dose: '500 mg', frequency: 'Oral Twice Daily', compliance: 'Intermittent/Irregular' },
        { name: 'Atorvastatin', dose: '10 mg', frequency: 'Oral Nightly', compliance: 'Poor adherence reported' }
      ],
      allergies: [
        { allergen: 'Penicillin (and Beta-Lactams)', reaction: 'Severe urticaria, periorbital/facial angioedema', severity: 'severe' }
      ],
      familyHistory: [
        'Father: Myocardial infarction at age 51 (premature CAD)',
        'Paternal Uncle: Multi-vessel coronary artery disease with stent placement at 54',
        'Mother: Type 2 Diabetes and Osteoarthritis'
      ],
      socialHistory: {
        smoking: 'Former smoker (15 pack-years, quit 8 years ago)',
        alcohol: 'Social (1-2 glasses of wine per week)',
        occupation: 'Senior Logistics Coordinator (sedentary desk job)',
        dietLifestyle: 'High-carbohydrate diet, minimal structured aerobic exercise'
      },
      reviewOfSystems: {
        cardiovascular: 'Positive for exertional substernal pressure, radiation to left arm, palpitations during episodes. Negative for orthopnea.',
        respiratory: 'Mild exertional dyspnea concurrent with chest episodes. Negative for cough or wheezing.',
        gastrointestinal: 'Negative for acid reflux, nausea, dysphagia, or epigastric burning.',
        neurological: 'Transitory lightheadedness during diaphoresis episode. Negative for focal weakness or paresthesias.',
        musculoskeletal: 'No chest wall tenderness upon direct palpation.',
        general: 'Diaphoresis reported with episodes. Negative for fever or unexplained weight loss.'
      },
      aiSynthesizedSummary: 'Synthesis of AI conversational intake with extracted lab/ECG reports reveals high suspicion for Acute Coronary Syndrome / Unstable Angina in a 56M with multiple cardiovascular risk factors (premature CAD family history, uncontrolled diabetes HbA1c 9.4%, dyslipidemia, hypertension). Lateral ST-T segment changes on previous ECG further heighten pre-test probability. Immediate attending physician triage recommended.',
      clinicalConfidenceScore: 94
    },
    status: 'ai_completed',
    triagePriority: 'emergency',
    updatedAt: '2026-08-22T08:24:00Z',
    isDoctorConfirmed: false
  },
  {
    id: 'pat-102',
    personalInfo: {
      id: 'pat-102',
      queueToken: 'MED-8903',
      fullName: 'Lakshmi Rao',
      age: 42,
      gender: 'female',
      phone: '+91 98480 12345',
      email: 'lakshmi.rao@example.in',
      emergencyContactName: 'Venkat Rao (Brother)',
      emergencyContactPhone: '+91 98480 12346',
      primaryLanguage: 'te',
      chiefComplaint: 'తీవ్రమైన కుడివైపు తలనొప్పి, వాంతులు మరియు కాంతిని చూడలేకపోవడం (Intense right-sided throbbing headache with nausea).',
      vitals: {
        bloodPressureSystolic: 122,
        bloodPressureDiastolic: 78,
        heartRate: 74,
        temperature: 98.4,
        temperatureUnit: 'F',
        oxygenSaturation: 99,
        bloodGlucose: 96,
        heightCm: 162,
        weightKg: 60
      },
      createdAt: '2026-08-22T08:40:00Z'
    },
    consent: {
      granted: true,
      timestamp: '2026-08-22T08:41:00Z',
      agreedToAIProcessing: true,
      agreedToDataSharingWithDoctor: true,
      termsAccepted: true
    },
    reports: [SAMPLE_REPORTS_LIBRARY[2]],
    conversationHistory: [
      {
        id: 'c201',
        sender: 'ai',
        text: 'నమస్కారం లక్ష్మీ గారు, నేను మీ మెడికియోస్క్ AI సహాయకుడిని. ఈ రోజు మీకు ఉన్న ప్రధాన సమస్య ఏమిటి?',
        translatedText: 'Hello Lakshmi, I am your MediKiosk AI Clinical Assistant. What primary symptom brings you in today?',
        language: 'te',
        timestamp: '08:42 AM',
        category: 'complaint'
      },
      {
        id: 'c202',
        sender: 'patient',
        text: 'నిన్నటి నుండి కుడివైపు తల విపరీతంగా పోటు పెడుతోంది. వెలుతురు మరియు శబ్దం భరించలేకపోతున్నాను, వాంతి కూడా అవుతోంది.',
        translatedText: 'Since yesterday I have a very severe pulsating headache on the right side. I cannot bear light and sound, and feeling nauseated.',
        language: 'te',
        timestamp: '08:43 AM'
      },
      {
        id: 'c203',
        sender: 'ai',
        text: 'నొప్పి ప్రారంభమయ్యే ముందు మీకు కళ్ల ముందు మెరుపులు లేదా మచ్చలు కనిపించాయా? ఏదైనా నొప్పి నివారణ మందు తీసుకున్నారా?',
        translatedText: 'Did you experience visual flashes or blind spots before pain started? Have you taken any pain medicine?',
        language: 'te',
        timestamp: '08:44 AM',
        category: 'onset'
      },
      {
        id: 'c204',
        sender: 'patient',
        text: 'అవును, నొప్పి రాకముందు మెరుపులు కనిపించాయి. పారాసిటమాల్ వేసుకున్నా నొప్పి తగ్గలేదు.',
        translatedText: 'Yes, flashes appeared before the pain. Paracetamol did not relieve the pain.',
        language: 'te',
        timestamp: '08:45 AM'
      }
    ],
    redFlags: [
      {
        id: 'rf-201',
        category: 'neurological',
        severity: 'moderate',
        title: 'Status Migrainosus Risk (Refractory > 48h to OTC analgesics)',
        description: 'Persistent unilateral pulsating cephalalgia with visual aura, severe phonophotophobia, and intractable nausea.',
        source: 'ai_interview',
        suggestedAction: 'Consider subcutaneous Sumatriptan or IV anti-emetic/NSAID cocktail in dark quiet triage room.'
      }
    ],
    structuredHistory: {
      chiefComplaint: 'Right-sided hemicranial throbbing headache with visual aura and nausea (duration 48h)',
      hpi: '42-year-old female with established history of episodic migraine presents with a 48-hour refractory flare of right-sided pulsating frontotemporal headache (rated 8/10). The episode was preceded by typical scintillating visual scotoma lasting 30 minutes. Associated with severe photophobia, phonophobia, and recurrent nausea without emesis. OTC Ibuprofen and Acetaminophen have yielded minimal improvement. Prior 3T Brain MRI (June 2026) was unremarkable except for benign punctate white matter foci.',
      pastMedicalHistory: ['Episodic Migraine with Aura', 'Mild Allergic Rhinitis'],
      pastSurgicalHistory: ['None'],
      currentMedications: [
        { name: 'Ibuprofen', dose: '400 mg', frequency: 'PRN for headache (ineffective)', compliance: 'Active' },
        { name: 'Cetirizine', dose: '10 mg', frequency: 'Oral Daily as needed', compliance: 'Regular' }
      ],
      allergies: [
        { allergen: 'Sulfa Drugs (Sulfonamides)', reaction: 'Maculopapular rash', severity: 'moderate' }
      ],
      familyHistory: ['Mother: Chronic migraine', 'Sister: Tension-type headaches'],
      socialHistory: {
        smoking: 'Never smoked',
        alcohol: 'Occasional (1 unit/week)',
        occupation: 'Architect / Graphic Designer (prolonged screen time)',
        dietLifestyle: 'Reports irregular sleep and high caffeine intake preceding the attack'
      },
      reviewOfSystems: {
        cardiovascular: 'Negative for chest discomfort or palpitations.',
        respiratory: 'Clear, no breathing difficulty.',
        gastrointestinal: 'Marked nausea, no vomiting or abdominal pain.',
        neurological: 'Unilateral frontotemporal throbbing, scintillating scotoma (resolved). No focal weakness or neck stiffness.',
        musculoskeletal: 'Mild ipsilateral cervical trapezius muscle spasm.',
        general: 'Severe photophobia and phonophobia. Afebrile.'
      },
      aiSynthesizedSummary: 'Intake and prior neuroimaging correlate with an acute exacerbation of Episodic Migraine with Aura refractory to conservative therapy. Red-flag intracranial danger signs (thunderclap onset, meningismus, focal deficit) are absent. Recommended protocol includes acute migraine abortive therapy + antiemetic hydration.',
      clinicalConfidenceScore: 96
    },
    status: 'doctor_reviewing',
    triagePriority: 'urgent',
    updatedAt: '2026-08-22T08:50:00Z',
    isDoctorConfirmed: false
  },
  {
    id: 'pat-103',
    personalInfo: {
      id: 'pat-103',
      queueToken: 'MED-8904',
      fullName: 'Marcus Vance',
      age: 28,
      gender: 'male',
      phone: '+1 (555) 412-7729',
      email: 'marcus.v@example.com',
      emergencyContactName: 'Dana Vance (Spouse)',
      emergencyContactPhone: '+1 (555) 412-7730',
      primaryLanguage: 'en',
      chiefComplaint: 'Worsening nocturnal dry cough, chest tightness, and expiratory wheeze triggered by cold air.',
      vitals: {
        bloodPressureSystolic: 118,
        bloodPressureDiastolic: 76,
        heartRate: 84,
        temperature: 98.7,
        temperatureUnit: 'F',
        oxygenSaturation: 96,
        bloodGlucose: 91,
        heightCm: 180,
        weightKg: 78
      },
      createdAt: '2026-08-22T09:10:00Z'
    },
    consent: {
      granted: true,
      timestamp: '2026-08-22T09:11:00Z',
      agreedToAIProcessing: true,
      agreedToDataSharingWithDoctor: true,
      termsAccepted: true
    },
    reports: [SAMPLE_REPORTS_LIBRARY[3]],
    conversationHistory: [
      {
        id: 'c301',
        sender: 'ai',
        text: 'Hello Marcus, I am your MediKiosk AI Clinical Assistant. What breathing or respiratory symptoms are you experiencing?',
        language: 'en',
        timestamp: '09:12 AM',
        category: 'complaint'
      },
      {
        id: 'c302',
        sender: 'patient',
        text: 'Over the last two weeks, I wake up coughing around 3 AM and feel a tight whistling sound in my chest. Using my rescue inhaler only helps for an hour or two.',
        language: 'en',
        timestamp: '09:13 AM'
      }
    ],
    redFlags: [
      {
        id: 'rf-301',
        category: 'respiratory',
        severity: 'high',
        title: 'Frequent Nocturnal Awakening & Over-reliance on SABA Rescue Inhaler',
        description: 'Nocturnal cough >= 3 nights/week + elevated FeNO (52 ppb) + sub-optimal controller inhaler compliance.',
        source: 'combined',
        suggestedAction: 'Step-up Inhaled Corticosteroid (ICS-LABA) controller regimen; verify inhaler technique.'
      }
    ],
    structuredHistory: {
      chiefComplaint: 'Nocturnal cough and exertional wheeze x 2 weeks',
      hpi: '28-year-old male with history of moderate persistent bronchial asthma presents with 2 weeks of worsening daytime and nocturnal cough, chest tightness, and audible expiratory wheezing. Wakes up 3-4 nights per week coughing. Rescue Albuterol use increased to 4-5 times daily. Prior spirometry confirmed significant bronchodilator reversibility (+24.6% FEV1) with elevated FeNO of 52 ppb indicating Th2-driven eosinophilic inflammation.',
      pastMedicalHistory: ['Bronchial Asthma (childhood onset)', 'Seasonal Allergic Rhinitis'],
      pastSurgicalHistory: ['None'],
      currentMedications: [
        { name: 'Albuterol HFA', dose: '90 mcg 2 puffs', frequency: 'PRN (currently 4-5x daily)', compliance: 'Frequent' },
        { name: 'Fluticasone/Salmeterol', dose: '250/50 mcg', frequency: '1 puff BID', compliance: 'Inconsistent (runs out)' }
      ],
      allergies: [
        { allergen: 'Cat Dander & Dust Mites', reaction: 'Bronchospasm, sneezing, ocular pruritus', severity: 'moderate' },
        { allergen: 'Aspirin / NSAIDs', reaction: 'Mild wheezing (AERD suspected)', severity: 'moderate' }
      ],
      familyHistory: ['Mother: Asthma & Eczema', 'Brother: Allergic Rhinitis'],
      socialHistory: {
        smoking: 'Non-smoker',
        alcohol: 'Social',
        occupation: 'Software Engineer',
        dietLifestyle: 'Active runner, currently restricted by cold-induced bronchoconstriction'
      },
      reviewOfSystems: {
        cardiovascular: 'Negative for chest pain or ankle edema.',
        respiratory: 'Positive for nocturnal cough, expiratory wheeze, dyspnea on brisk walking. Negative for purulent sputum.',
        gastrointestinal: 'No reflux symptoms.',
        neurological: 'Negative.',
        musculoskeletal: 'Negative.',
        general: 'Mild fatigue due to fragmented sleep.'
      },
      aiSynthesizedSummary: 'Findings indicate sub-optimally controlled Moderate Persistent Asthma with high rescue SABA reliance and elevated airway inflammation markers (FeNO 52 ppb). Step-up maintenance controller therapy (ICS-Formoterol SMART or increased dose) and inhaler technique coaching recommended.',
      clinicalConfidenceScore: 95
    },
    doctorNote: {
      id: 'doc-note-301',
      doctorName: 'Dr. Sarah Chen, MD',
      doctorRole: 'Attending Pulmonologist / Internal Medicine',
      timestamp: '2026-08-22T09:30:00Z',
      clinicalImpression: 'Uncontrolled Moderate Persistent Asthma with Nocturnal Flares. AERD Caution.',
      differentialDiagnosis: ['Asthma Exacerbation (Aeroallergen/Viral trigger)', 'Aspirin-Exacerbated Respiratory Disease', 'Vocal Cord Dysfunction'],
      planOfCare: [
        'Step-up to High-Dose ICS/Formoterol maintenance and reliever therapy (SMART strategy)',
        'Check peak flow and administer nebulized ipratropium/albuterol in triage clinic',
        'Review MDI spacer technique',
        'Avoid Aspirin and all non-selective NSAIDs given reported bronchospasm history'
      ],
      prescriptionsPrescribed: [
        'Budesonide/Formoterol 160/4.5 mcg - 2 puffs BID + 1 puff PRN',
        'Montelukast 10 mg PO QHS'
      ],
      isSignedOff: true,
      signedAt: '2026-08-22T09:35:00Z'
    },
    status: 'confirmed',
    triagePriority: 'routine',
    updatedAt: '2026-08-22T09:35:00Z',
    isDoctorConfirmed: true
  }
];
