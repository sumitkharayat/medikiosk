export interface OpdDoctor {
  name: string;
  qualification: string;
  experience: string;
  consultationHours: string;
  rating: string;
}

export interface OpdDepartment {
  id: string;
  name: string;
  code: string;
  chamber: string;
  icon: string;
  description: string;
  defaultDoctor: OpdDoctor;
  commonSymptoms: string[];
  keywords: string[];
}

export const OPD_DEPARTMENTS: OpdDepartment[] = [
  {
    id: 'general_medicine',
    name: 'General Medicine',
    code: 'GEN-MED',
    chamber: 'OPD Chamber 101',
    icon: '🩺',
    description: 'General health, fever, infections, diabetes, hypertension & chronic wellness',
    defaultDoctor: {
      name: 'Dr. Satish Sharma',
      qualification: 'MBBS, MD (General Medicine)',
      experience: '12 Years Experience',
      consultationHours: '09:00 AM - 02:00 PM',
      rating: '4.9 ★'
    },
    commonSymptoms: ['Fever', 'Weakness', 'Body Ache', 'High Blood Sugar', 'General Malaise'],
    keywords: ['fever', 'weakness', 'body ache', 'tired', 'malaise', 'diabetes', 'sugar', 'bukhar', 'kamzori', 'jwar', 'thakan']
  },
  {
    id: 'cardiology',
    name: 'Cardiology',
    code: 'CARDIO',
    chamber: 'OPD Chamber 102',
    icon: '🫀',
    description: 'Heart conditions, chest pain, palpitations, hypertension & ECG abnormalities',
    defaultDoctor: {
      name: 'Dr. Sarah Chen',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experience: '15 Years Experience',
      consultationHours: '10:00 AM - 03:00 PM',
      rating: '5.0 ★'
    },
    commonSymptoms: ['Chest Pain', 'Palpitations', 'Shortness of Breath', 'High Blood Pressure', 'Angina'],
    keywords: ['chest', 'heart', 'palpitation', 'angina', 'ecg', 'cardiac', 'bp', 'blood pressure', 'chhati', 'dhadkan', 'dil']
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics & Joint Care',
    code: 'ORTHO',
    chamber: 'OPD Chamber 103',
    icon: '🦴',
    description: 'Bone, joint, spine, backache, knee pain, fractures & arthritis care',
    defaultDoctor: {
      name: 'Dr. Vikram Malhotra',
      qualification: 'MBBS, MS (Orthopedics)',
      experience: '14 Years Experience',
      consultationHours: '09:30 AM - 02:30 PM',
      rating: '4.8 ★'
    },
    commonSymptoms: ['Knee Pain', 'Back Pain', 'Joint Swelling', 'Bone Injury', 'Arthritis'],
    keywords: ['bone', 'joint', 'knee', 'back', 'spine', 'fracture', 'arthritis', 'sprain', 'kamar', 'ghutna', 'haddi', 'jod']
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology / Chest Medicine',
    code: 'PULMO',
    chamber: 'OPD Chamber 104',
    icon: '🫁',
    description: 'Respiratory diseases, chronic cough, asthma, bronchitis & breathing difficulty',
    defaultDoctor: {
      name: 'Dr. Rajesh Sen',
      qualification: 'MBBS, MD (Pulmonary Medicine)',
      experience: '11 Years Experience',
      consultationHours: '09:00 AM - 01:30 PM',
      rating: '4.9 ★'
    },
    commonSymptoms: ['Chronic Cough', 'Asthma', 'Wheezing', 'Breathlessness', 'Chest Congestion'],
    keywords: ['cough', 'asthma', 'breath', 'wheeze', 'lungs', 'phlegm', 'bronchitis', 'khansi', 'saans', 'dama', 'kaf']
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics (Child Healthcare)',
    code: 'PEDIA',
    chamber: 'OPD Chamber 105',
    icon: '👶',
    description: 'Infant, child & adolescent health, vaccinations, childhood fever & growth',
    defaultDoctor: {
      name: 'Dr. Ananya Roy',
      qualification: 'MBBS, MD, DCH (Pediatrics)',
      experience: '10 Years Experience',
      consultationHours: '09:00 AM - 03:00 PM',
      rating: '4.9 ★'
    },
    commonSymptoms: ['Child Fever', 'Teething', 'Vaccinations', 'Pediatric Cough', 'Poor Appetite'],
    keywords: ['child', 'baby', 'infant', 'kid', 'pediatric', 'vaccine', 'baccha', 'shishu', 'bal']
  },
  {
    id: 'dermatology',
    name: 'Dermatology & Skin Care',
    code: 'DERMA',
    chamber: 'OPD Chamber 106',
    icon: '🧴',
    description: 'Skin infections, rash, itching, eczema, acne, hair & nail disorders',
    defaultDoctor: {
      name: 'Dr. Kavita Joshi',
      qualification: 'MBBS, MD (Dermatology & Venereology)',
      experience: '9 Years Experience',
      consultationHours: '10:00 AM - 02:00 PM',
      rating: '4.8 ★'
    },
    commonSymptoms: ['Skin Rash', 'Itching', 'Allergic Hives', 'Fungal Infection', 'Eczema'],
    keywords: ['skin', 'rash', 'itch', 'eczema', 'allergy', 'fungal', 'boil', 'acne', 'khujli', 'tvacha', 'chakatte']
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology & Digestive Health',
    code: 'GASTRO',
    chamber: 'OPD Chamber 107',
    icon: '🥗',
    description: 'Stomach pain, acidity, GERD, indigestion, liver, diarrhea & nausea',
    defaultDoctor: {
      name: 'Dr. Sunil Mehta',
      qualification: 'MBBS, MD, DM (Gastroenterology)',
      experience: '16 Years Experience',
      consultationHours: '10:30 AM - 03:30 PM',
      rating: '5.0 ★'
    },
    commonSymptoms: ['Stomach Pain', 'Acidity', 'Vomiting', 'Constipation', 'Loose Motions'],
    keywords: ['stomach', 'abdomen', 'acidity', 'vomit', 'nausea', 'diarrhea', 'constipation', 'gas', 'pet', 'ulti', 'dast']
  },
  {
    id: 'neurology',
    name: 'Neurology',
    code: 'NEURO',
    chamber: 'OPD Chamber 108',
    icon: '🧠',
    description: 'Headache, migraine, dizziness, tremors, neuropathy & nerve disorders',
    defaultDoctor: {
      name: 'Dr. Rohan Kapoor',
      qualification: 'MBBS, MD, DM (Neurology)',
      experience: '13 Years Experience',
      consultationHours: '11:00 AM - 04:00 PM',
      rating: '4.9 ★'
    },
    commonSymptoms: ['Migraine', 'Severe Headache', 'Dizziness / Vertigo', 'Tingling / Numbness', 'Tremors'],
    keywords: ['headache', 'migraine', 'dizzy', 'vertigo', 'numb', 'seizure', 'tingling', 'tremor', 'sirdard', 'chakkar', 'sunn']
  },
  {
    id: 'ent',
    name: 'ENT (Ear, Nose & Throat)',
    code: 'ENT',
    chamber: 'OPD Chamber 109',
    icon: '👂',
    description: 'Sore throat, ear pain, sinus infection, tonsillitis & hearing issues',
    defaultDoctor: {
      name: 'Dr. Deepa Nair',
      qualification: 'MBBS, MS (ENT / Otorhinolaryngology)',
      experience: '12 Years Experience',
      consultationHours: '09:00 AM - 01:00 PM',
      rating: '4.8 ★'
    },
    commonSymptoms: ['Sore Throat', 'Earache', 'Sinus Block', 'Tonsils', 'Ear Discharge'],
    keywords: ['throat', 'ear', 'nose', 'sinus', 'tonsil', 'hearing', 'gala', 'kaan', 'naak']
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology (Eye Clinic)',
    code: 'OPHTHAL',
    chamber: 'OPD Chamber 110',
    icon: '👁️',
    description: 'Eye redness, vision blurriness, irritation, watery eyes & cataract check',
    defaultDoctor: {
      name: 'Dr. Arvind Swamy',
      qualification: 'MBBS, MS (Ophthalmology)',
      experience: '14 Years Experience',
      consultationHours: '09:30 AM - 02:00 PM',
      rating: '4.9 ★'
    },
    commonSymptoms: ['Eye Redness', 'Blurred Vision', 'Eye Strain', 'Watery Eyes', 'Eye Pain'],
    keywords: ['eye', 'vision', 'blur', 'cataract', 'glasses', 'sight', 'aankh', 'dhundla']
  }
];

export function getDepartmentById(id: string): OpdDepartment {
  return OPD_DEPARTMENTS.find(d => 
    d.id === id || 
    d.name.toLowerCase() === (id || '').toLowerCase() ||
    d.name.toLowerCase().includes((id || '').toLowerCase()) ||
    (id || '').toLowerCase().includes(d.id)
  ) || OPD_DEPARTMENTS[0];
}

export function findMatchingDepartment(complaint: string, age: number = 30): OpdDepartment {
  const norm = (complaint || '').toLowerCase();
  
  // 1. Pediatric rule
  if (age <= 14 || norm.includes('child') || norm.includes('infant') || norm.includes('baby') || norm.includes('baccha')) {
    return OPD_DEPARTMENTS.find(d => d.id === 'pediatrics') || OPD_DEPARTMENTS[4];
  }

  // 2. Keyword match
  let bestDept = OPD_DEPARTMENTS[0];
  let maxScore = 0;

  for (const dept of OPD_DEPARTMENTS) {
    let score = 0;
    for (const kw of dept.keywords) {
      if (norm.includes(kw)) {
        score += kw.length > 4 ? 3 : 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestDept = dept;
    }
  }

  return bestDept;
}
