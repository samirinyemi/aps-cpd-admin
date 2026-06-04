export const aoPEOptions = [
  'Clinical Psychology',
  'Clinical Neuropsychology',
  'Counselling Psychology',
  'Educational & Developmental Psychology',
  'Forensic Psychology',
  'Health Psychology',
  'Organisational Psychology',
  'Sport & Exercise Psychology',
  'Community Psychology',
];

export const qualificationOptions = [
  'Masters degree (5th and 6th year accredited degree)',
  'DPsych/PysD degree (5th to 7th year accredited degree e.g. DPsych or PysD)',
  'Masters degree (5th and 6th year accredited degree with doctoral thesis e.g. Masters/PhD)',
  'Bridging Qualification/Standalone program (6th year accredited degree which includes bridging to a second endorsement)',
];

export const stateOptions = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

export const titleOptions = ['Dr', 'Mr', 'Mrs', 'Ms', 'Miss', 'Prof', 'Other'];

// Candidate members who can be enrolled into a registrar program.
// In a real system this would come from the member directory; here it's a
// static list the admin selects from when creating a new program.
export const candidateMembers = [
  { memberNumber: 'PSY-2025-014', title: 'Ms', firstName: 'Amelia', lastName: 'Brooks', memberGrade: 'Registrar' },
  { memberNumber: 'PSY-2025-022', title: 'Mr', firstName: 'Noah', lastName: 'Patel', memberGrade: 'Registrar' },
  { memberNumber: 'PSY-2025-031', title: 'Dr', firstName: 'Priya', lastName: 'Sharma', memberGrade: 'Registrar' },
  { memberNumber: 'PSY-2025-045', title: 'Ms', firstName: 'Hannah', lastName: 'O\u2019Connor', memberGrade: 'Registrar' },
  { memberNumber: 'PSY-2025-058', title: 'Mr', firstName: 'Lachlan', lastName: 'Reid', memberGrade: 'Registrar' },
  { memberNumber: 'PSY-2025-063', title: 'Ms', firstName: 'Sophie', lastName: 'Nguyen', memberGrade: 'Registrar' },
];

export const initialPrograms = [
  {
    id: '1',
    member: { title: 'Dr', firstName: 'Sarah', lastName: 'Chen' },
    memberNumber: 'PSY-2024-001',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-1',
    areaOfPractice: 'Clinical Psychology',
    qualification: 'DPsych/PysD degree (5th to 7th year accredited degree e.g. DPsych or PysD)',
    commencementDate: '2024-07-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      {
        id: 's1',
        title: 'Dr',
        firstName: 'James',
        lastName: 'Mitchell',
        ahpraNumber: 'PSY0001234567',
        supervisionType: 'Primary',
        supervisorAoPE: 'Clinical Psychology',
      },
      {
        id: 's2',
        title: 'Prof',
        firstName: 'Linda',
        lastName: 'Nguyen',
        ahpraNumber: 'PSY0009876543',
        supervisionType: 'Secondary',
        supervisorAoPE: 'Clinical Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p1',
        positionTitle: 'Psychologist',
        employerName: 'Melbourne Health',
        phone: '03 9342 7000',
        email: 'sarah.chen@melbournehealth.org.au',
        addressLine1: '300 Grattan St',
        addressLine2: '',
        suburb: 'Parkville',
        postcode: '3050',
        state: 'VIC',
      },
    ],
    activities: [
      { id: 'act-1', activityType: 'Supervision', completionDate: '2025-01-15', hours: 2, minutes: 0, supervisionType: 'Individual', supervisorId: 's1', supervisorName: 'Dr James Mitchell', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Clinical Psychology' },
      { id: 'act-2', activityType: 'Supervision', completionDate: '2025-01-22', hours: 1, minutes: 30, supervisionType: 'Group', supervisorId: 's2', supervisorName: 'Prof Linda Nguyen', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Clinical Psychology' },
      { id: 'act-3', activityType: 'Practice', completionDate: '2025-02-05', hours: 8, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: 5, directContactMinutes: 30, placeId: 'p1', employerName: 'Melbourne Health', allocation: 'Clinical Psychology' },
      { id: 'act-4', activityType: 'Supervision', completionDate: '2025-02-12', hours: 2, minutes: 0, supervisionType: 'Individual', supervisorId: 's1', supervisorName: 'Dr James Mitchell', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Clinical Psychology' },
      { id: 'act-5', activityType: 'Practice', completionDate: '2025-03-01', hours: 40, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: 25, directContactMinutes: 0, placeId: 'p1', employerName: 'Melbourne Health', allocation: 'Clinical Psychology' },
      { id: 'act-5a', activityType: 'CPD', completionDate: '2025-02-20', hours: 3, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Clinical Psychology', activityTitle: 'Workshop: Evidence-Based Trauma-Focused CBT' },
      { id: 'act-5b', activityType: 'CPD', completionDate: '2025-03-14', hours: 1, minutes: 30, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Clinical Psychology', activityTitle: 'APS Webinar: Contemporary Issues in Assessment' },
    ],
  },
  // ── Dr Sarah Chen — Community Psychology (second program) ──────────────────
  {
    id: '1b',
    member: { title: 'Dr', firstName: 'Sarah', lastName: 'Chen' },
    memberNumber: 'PSY-2024-001',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-9',
    areaOfPractice: 'Community Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2024-07-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      {
        id: 's1b',
        title: 'Dr',
        firstName: 'Yolanda',
        lastName: 'Park',
        ahpraNumber: 'PSY0008765432',
        supervisionType: 'Primary',
        supervisorAoPE: 'Community Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p1b',
        positionTitle: 'Community Psychologist',
        employerName: 'Merri Health',
        phone: '03 9389 0300',
        email: 'sarah.chen@merrihealth.org.au',
        addressLine1: '389 Mt Alexander Rd',
        addressLine2: '',
        suburb: 'Ascot Vale',
        postcode: '3032',
        state: 'VIC',
      },
    ],
    activities: [
      { id: 'act-c1', activityType: 'Supervision', completionDate: '2025-02-10', hours: 1, minutes: 30, supervisionType: 'Individual', supervisorId: 's1b', supervisorName: 'Dr Yolanda Park', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Community Psychology' },
      { id: 'act-c2', activityType: 'Practice', completionDate: '2025-03-05', hours: 20, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: 14, directContactMinutes: 0, placeId: 'p1b', employerName: 'Merri Health', allocation: 'Community Psychology' },
    ],
  },
  // ── Dr Sarah Chen — Counselling Psychology (third program) ─────────────────
  {
    id: '1c',
    member: { title: 'Dr', firstName: 'Sarah', lastName: 'Chen' },
    memberNumber: 'PSY-2024-001',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-5',
    areaOfPractice: 'Counselling Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2025-01-15',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      {
        id: 's1c',
        title: 'Prof',
        firstName: 'Marcus',
        lastName: 'Webb',
        ahpraNumber: 'PSY0007654321',
        supervisionType: 'Primary',
        supervisorAoPE: 'Counselling Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p1c',
        positionTitle: 'Counselling Psychologist',
        employerName: 'Mind Australia',
        phone: '03 8415 1111',
        email: 'sarah.chen@mindaustralia.org.au',
        addressLine1: 'Level 4, 369 Royal Parade',
        addressLine2: '',
        suburb: 'Parkville',
        postcode: '3052',
        state: 'VIC',
      },
    ],
    activities: [
      { id: 'act-cs1', activityType: 'Supervision', completionDate: '2025-03-08', hours: 1, minutes: 0, supervisionType: 'Individual', supervisorId: 's1c', supervisorName: 'Prof Marcus Webb', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Counselling Psychology' },
    ],
  },
  {
    id: '2',
    member: { title: 'Mr', firstName: 'David', lastName: 'Thompson' },
    memberNumber: 'PSY-2024-015',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-3',
    areaOfPractice: 'Organisational Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2024-09-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      {
        id: 's3',
        title: 'Dr',
        firstName: 'Karen',
        lastName: 'Patel',
        ahpraNumber: 'PSY0002345678',
        supervisionType: 'Primary',
        supervisorAoPE: 'Organisational Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p2',
        positionTitle: 'Organisational Consultant',
        employerName: 'Deloitte Australia',
        phone: '02 9322 7000',
        email: 'd.thompson@deloitte.com.au',
        addressLine1: '225 George St',
        addressLine2: 'Level 12',
        suburb: 'Sydney',
        postcode: '2000',
        state: 'NSW',
      },
    ],
    activities: [
      { id: 'act-6', activityType: 'Supervision', completionDate: '2025-01-10', hours: 1, minutes: 30, supervisionType: 'Individual', supervisorId: 's3', supervisorName: 'Dr Karen Patel', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Organisational Psychology' },
      { id: 'act-7', activityType: 'Practice', completionDate: '2025-02-01', hours: 20, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: 12, directContactMinutes: 0, placeId: 'p2', employerName: 'Deloitte Australia', allocation: 'Organisational Psychology' },
      { id: 'act-8', activityType: 'Supervision', completionDate: '2025-02-14', hours: 1, minutes: 0, supervisionType: 'Group', supervisorId: 's3', supervisorName: 'Dr Karen Patel', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Organisational Psychology' },
      { id: 'act-8a', activityType: 'CPD', completionDate: '2025-01-28', hours: 2, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Organisational Psychology', activityTitle: 'Seminar: Positive Psychology in the Workplace' },
    ],
  },
  {
    id: '3',
    member: { title: 'Ms', firstName: 'Emily', lastName: 'Rodriguez' },
    memberNumber: 'PSY-2023-042',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-4',
    areaOfPractice: 'Forensic Psychology',
    qualification: 'DPsych/PysD degree (5th to 7th year accredited degree e.g. DPsych or PysD)',
    commencementDate: '2023-07-01',
    holdsAoPE: true,
    dualQualification: true,
    status: 'Open',
    supervisors: [
      {
        id: 's4',
        title: 'Dr',
        firstName: 'Michael',
        lastName: 'O\'Brien',
        ahpraNumber: 'PSY0003456789',
        supervisionType: 'Primary',
        supervisorAoPE: 'Forensic Psychology',
      },
      {
        id: 's5',
        title: 'Dr',
        firstName: 'Amanda',
        lastName: 'Foster',
        ahpraNumber: 'PSY0004567890',
        supervisionType: 'Secondary',
        supervisorAoPE: 'Clinical Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p3',
        positionTitle: 'Forensic Psychologist',
        employerName: 'QLD Corrective Services',
        phone: '07 3227 7111',
        email: 'e.rodriguez@corrections.qld.gov.au',
        addressLine1: '41 George St',
        addressLine2: '',
        suburb: 'Brisbane',
        postcode: '4000',
        state: 'QLD',
      },
      {
        id: 'p4',
        positionTitle: 'Private Practice',
        employerName: 'Brisbane Psychology Group',
        phone: '07 3356 8255',
        email: 'emily@brisbanepsych.com.au',
        addressLine1: '15 Newmarket Rd',
        addressLine2: 'Suite 3',
        suburb: 'Newmarket',
        postcode: '4051',
        state: 'QLD',
      },
    ],
    activities: [
      { id: 'act-9', activityType: 'Supervision', completionDate: '2024-08-15', hours: 2, minutes: 0, supervisionType: 'Individual', supervisorId: 's4', supervisorName: "Dr Michael O'Brien", directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Forensic Psychology' },
      { id: 'act-10', activityType: 'Practice', completionDate: '2024-09-10', hours: 35, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: 20, directContactMinutes: 0, placeId: 'p3', employerName: 'QLD Corrective Services', allocation: 'Forensic Psychology' },
      { id: 'act-11', activityType: 'Supervision', completionDate: '2024-10-01', hours: 1, minutes: 30, supervisionType: 'Individual', supervisorId: 's5', supervisorName: 'Dr Amanda Foster', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Forensic Psychology' },
      { id: 'act-12', activityType: 'Practice', completionDate: '2024-11-15', hours: 45, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: 30, directContactMinutes: 0, placeId: 'p4', employerName: 'Brisbane Psychology Group', allocation: 'Forensic Psychology' },
    ],
  },
  {
    id: '4',
    member: { title: 'Dr', firstName: 'Rachel', lastName: 'Kim' },
    memberNumber: 'PSY-2022-088',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-2',
    areaOfPractice: 'Clinical Neuropsychology',
    qualification: 'Masters degree (5th and 6th year accredited degree with doctoral thesis e.g. Masters/PhD)',
    commencementDate: '2022-07-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Closed',
    supervisors: [
      {
        id: 's6',
        title: 'Prof',
        firstName: 'Robert',
        lastName: 'Shaw',
        ahpraNumber: 'PSY0005678901',
        supervisionType: 'Primary',
        supervisorAoPE: 'Clinical Neuropsychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p5',
        positionTitle: 'Neuropsychologist',
        employerName: 'Royal Adelaide Hospital',
        phone: '08 7074 0000',
        email: 'rachel.kim@rah.sa.gov.au',
        addressLine1: 'Port Rd',
        addressLine2: '',
        suburb: 'Adelaide',
        postcode: '5000',
        state: 'SA',
      },
    ],
    activities: [],
  },

  // 2021–2022 cycle — Health Psychology (Closed)
  {
    id: '5',
    member: { title: 'Dr', firstName: 'Sophie', lastName: 'Hartley' },
    memberNumber: 'PSY-2021-055',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-5',
    areaOfPractice: 'Health Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2021-08-01',
    holdsAoPE: true,
    dualQualification: false,
    status: 'Closed',
    supervisors: [
      {
        id: 's7',
        title: 'Dr',
        firstName: 'Priya',
        lastName: 'Sharma',
        ahpraNumber: 'PSY0006789012',
        supervisionType: 'Primary',
        supervisorAoPE: 'Health Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p7',
        positionTitle: 'Health Psychologist',
        employerName: 'Royal Prince Alfred Hospital',
        phone: '02 9515 6111',
        email: 'sophie.hartley@rpa.nsw.gov.au',
        addressLine1: 'Missenden Rd',
        addressLine2: '',
        suburb: 'Camperdown',
        postcode: '2050',
        state: 'NSW',
      },
    ],
    activities: [],
  },

  // 2025–2026 cycle — Clinical Psychology (Open)
  {
    id: '6',
    member: { title: 'Ms', firstName: 'Emily', lastName: 'Chen' },
    memberNumber: 'PSY-2025-112',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-1',
    areaOfPractice: 'Clinical Psychology',
    qualification: 'DPsych/PysD degree (5th to 7th year accredited degree e.g. DPsych or PysD)',
    commencementDate: '2025-07-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      {
        id: 's1',
        title: 'Dr',
        firstName: 'James',
        lastName: 'Mitchell',
        ahpraNumber: 'PSY0001234567',
        supervisionType: 'Primary',
        supervisorAoPE: 'Clinical Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p6',
        positionTitle: 'Clinical Psychologist',
        employerName: 'Perth Community Health',
        phone: '08 9224 8222',
        email: 'emily.chen@pch.health.wa.gov.au',
        addressLine1: '30 Roe St',
        addressLine2: '',
        suburb: 'East Perth',
        postcode: '6004',
        state: 'WA',
      },
    ],
    activities: [],
  },

  // 2025–2026 cycle — Forensic Psychology (Open)
  {
    id: '7',
    member: { title: 'Mr', firstName: 'Noah', lastName: 'Patel' },
    memberNumber: 'PSY-2025-022',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-4',
    areaOfPractice: 'Forensic Psychology',
    qualification: 'DPsych/PysD degree (5th to 7th year accredited degree e.g. DPsych or PysD)',
    commencementDate: '2025-09-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      {
        id: 's4',
        title: 'Dr',
        firstName: 'Michael',
        lastName: "O'Brien",
        ahpraNumber: 'PSY0003456789',
        supervisionType: 'Primary',
        supervisorAoPE: 'Forensic Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p8',
        positionTitle: 'Forensic Psychologist',
        employerName: 'NSW Justice Health',
        phone: '02 9289 4000',
        email: 'n.patel@justicehealth.nsw.gov.au',
        addressLine1: '14 College St',
        addressLine2: '',
        suburb: 'Darlinghurst',
        postcode: '2010',
        state: 'NSW',
      },
    ],
    activities: [
      { id: 'act-f1', activityType: 'Supervision', completionDate: '2025-10-08', hours: 1, minutes: 30, supervisionType: 'Individual', supervisorId: 's4', supervisorName: "Dr Michael O'Brien", directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Forensic Psychology' },
      { id: 'act-f2', activityType: 'Practice', completionDate: '2025-10-20', hours: 20, minutes: 0, supervisionType: null, supervisorId: null, supervisorName: null, directContactHours: 12, directContactMinutes: 0, placeId: 'p8', employerName: 'NSW Justice Health', allocation: 'Forensic Psychology' },
    ],
  },

  // 2025–2026 cycle — Organisational Psychology (Open)
  {
    id: '8',
    member: { title: 'Ms', firstName: 'Hannah', lastName: "O'Connor" },
    memberNumber: 'PSY-2025-045',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-3',
    areaOfPractice: 'Organisational Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2026-01-15',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      {
        id: 's3',
        title: 'Dr',
        firstName: 'Karen',
        lastName: 'Patel',
        ahpraNumber: 'PSY0002345678',
        supervisionType: 'Primary',
        supervisorAoPE: 'Organisational Psychology',
      },
    ],
    placesOfPractice: [
      {
        id: 'p9',
        positionTitle: 'Organisational Psychologist',
        employerName: 'Accenture Australia',
        phone: '02 9005 5000',
        email: 'h.oconnor@accenture.com',
        addressLine1: '1 Martin Place',
        addressLine2: 'Level 22',
        suburb: 'Sydney',
        postcode: '2000',
        state: 'NSW',
      },
    ],
    activities: [
      { id: 'act-o1', activityType: 'Supervision', completionDate: '2026-02-05', hours: 1, minutes: 0, supervisionType: 'Individual', supervisorId: 's3', supervisorName: 'Dr Karen Patel', directContactHours: null, directContactMinutes: null, placeId: null, employerName: null, allocation: 'Organisational Psychology' },
    ],
  },

  // ─── 2021–2022 additions (need 2 more for ≥3 per cycle) ──────────────────

  // 2021–2022 — Organisational Psychology (Closed)
  {
    id: '9',
    member: { title: 'Ms', firstName: 'Amelia', lastName: 'Brooks' },
    memberNumber: 'PSY-2021-033',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-3',
    areaOfPractice: 'Organisational Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2021-10-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Closed',
    supervisors: [
      { id: 's3', title: 'Dr', firstName: 'Karen', lastName: 'Patel', ahpraNumber: 'PSY0002345678', supervisionType: 'Primary', supervisorAoPE: 'Organisational Psychology' },
    ],
    placesOfPractice: [
      { id: 'p10', positionTitle: 'Organisational Consultant', employerName: 'PwC Australia', phone: '03 8603 1000', email: 'a.brooks@pwc.com.au', addressLine1: '2 Riverside Quay', addressLine2: '', suburb: 'Southbank', postcode: '3006', state: 'VIC' },
    ],
    activities: [],
  },

  // 2021–2022 — Clinical Neuropsychology (Closed)
  {
    id: '10',
    member: { title: 'Mr', firstName: 'Thomas', lastName: 'Walsh' },
    memberNumber: 'PSY-2022-001',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-2',
    areaOfPractice: 'Clinical Neuropsychology',
    qualification: 'Masters degree (5th and 6th year accredited degree with doctoral thesis e.g. Masters/PhD)',
    commencementDate: '2022-01-10',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Closed',
    supervisors: [
      { id: 's6', title: 'Prof', firstName: 'Robert', lastName: 'Shaw', ahpraNumber: 'PSY0005678901', supervisionType: 'Primary', supervisorAoPE: 'Clinical Neuropsychology' },
    ],
    placesOfPractice: [
      { id: 'p11', positionTitle: 'Neuropsychologist', employerName: 'The Alfred Hospital', phone: '03 9076 2000', email: 't.walsh@alfred.org.au', addressLine1: '55 Commercial Rd', addressLine2: '', suburb: 'Prahran', postcode: '3004', state: 'VIC' },
    ],
    activities: [],
  },

  // ─── 2022–2023 additions (need 2 more for ≥3 per cycle) ──────────────────

  // 2022–2023 — Clinical Psychology (Closed)
  {
    id: '11',
    member: { title: 'Ms', firstName: 'Sophie', lastName: 'Nguyen' },
    memberNumber: 'PSY-2022-078',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-1',
    areaOfPractice: 'Clinical Psychology',
    qualification: 'DPsych/PysD degree (5th to 7th year accredited degree e.g. DPsych or PysD)',
    commencementDate: '2022-08-15',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Closed',
    supervisors: [
      { id: 's2', title: 'Prof', firstName: 'Linda', lastName: 'Nguyen', ahpraNumber: 'PSY0009876543', supervisionType: 'Primary', supervisorAoPE: 'Clinical Psychology' },
    ],
    placesOfPractice: [
      { id: 'p12', positionTitle: 'Psychologist', employerName: 'Austin Health', phone: '03 9496 5000', email: 's.nguyen@austin.org.au', addressLine1: '145 Studley Rd', addressLine2: '', suburb: 'Heidelberg', postcode: '3084', state: 'VIC' },
    ],
    activities: [],
  },

  // 2022–2023 — Health Psychology (Closed)
  {
    id: '12',
    member: { title: 'Mr', firstName: 'Chris', lastName: 'Nguyen' },
    memberNumber: 'PSY-2023-004',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-5',
    areaOfPractice: 'Health Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2022-11-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Closed',
    supervisors: [
      { id: 's7', title: 'Dr', firstName: 'Priya', lastName: 'Sharma', ahpraNumber: 'PSY0006789012', supervisionType: 'Primary', supervisorAoPE: 'Health Psychology' },
    ],
    placesOfPractice: [
      { id: 'p13', positionTitle: 'Health Psychologist', employerName: "St Vincent's Hospital", phone: '02 8382 1111', email: 'c.nguyen@svhs.org.au', addressLine1: '390 Victoria St', addressLine2: '', suburb: 'Darlinghurst', postcode: '2010', state: 'NSW' },
    ],
    activities: [],
  },

  // ─── 2023–2024 additions (need 2 more for ≥3 per cycle) ──────────────────

  // 2023–2024 — Clinical Psychology (Open)
  {
    id: '13',
    member: { title: 'Ms', firstName: 'Lena', lastName: 'Park' },
    memberNumber: 'PSY-2023-055',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-1',
    areaOfPractice: 'Clinical Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2023-08-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      { id: 's1', title: 'Dr', firstName: 'James', lastName: 'Mitchell', ahpraNumber: 'PSY0001234567', supervisionType: 'Primary', supervisorAoPE: 'Clinical Psychology' },
    ],
    placesOfPractice: [
      { id: 'p14', positionTitle: 'Psychologist', employerName: 'Monash Medical Centre', phone: '03 9594 6666', email: 'l.park@monashhealth.org', addressLine1: '246 Clayton Rd', addressLine2: '', suburb: 'Clayton', postcode: '3168', state: 'VIC' },
    ],
    activities: [],
  },

  // 2023–2024 — Organisational Psychology (Open)
  {
    id: '14',
    member: { title: 'Dr', firstName: 'Wei', lastName: 'Zhang' },
    memberNumber: 'PSY-2024-003',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-3',
    areaOfPractice: 'Organisational Psychology',
    qualification: 'Masters degree (5th and 6th year accredited degree)',
    commencementDate: '2024-02-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      { id: 's3', title: 'Dr', firstName: 'Karen', lastName: 'Patel', ahpraNumber: 'PSY0002345678', supervisionType: 'Primary', supervisorAoPE: 'Organisational Psychology' },
    ],
    placesOfPractice: [
      { id: 'p15', positionTitle: 'Organisational Consultant', employerName: 'IBM Australia', phone: '02 9354 4000', email: 'w.zhang@ibm.com', addressLine1: '60 City Rd', addressLine2: '', suburb: 'Southbank', postcode: '3006', state: 'VIC' },
    ],
    activities: [],
  },

  // ─── 2024–2025 addition (need 1 more for ≥3 per cycle) ───────────────────

  // 2024–2025 — Forensic Psychology (Open)
  {
    id: '15',
    member: { title: 'Ms', firstName: 'Zoe', lastName: 'Martinez' },
    memberNumber: 'PSY-2024-067',
    memberGrade: 'Registrar',
    aopeComplianceId: 'aope-4',
    areaOfPractice: 'Forensic Psychology',
    qualification: 'DPsych/PysD degree (5th to 7th year accredited degree e.g. DPsych or PysD)',
    commencementDate: '2024-11-01',
    holdsAoPE: false,
    dualQualification: false,
    status: 'Open',
    supervisors: [
      { id: 's4', title: 'Dr', firstName: 'Michael', lastName: "O'Brien", ahpraNumber: 'PSY0003456789', supervisionType: 'Primary', supervisorAoPE: 'Forensic Psychology' },
    ],
    placesOfPractice: [
      { id: 'p16', positionTitle: 'Forensic Psychologist', employerName: 'Victoria Police Forensic Services', phone: '03 9247 6666', email: 'z.martinez@police.vic.gov.au', addressLine1: '637 Flinders St', addressLine2: '', suburb: 'Docklands', postcode: '3008', state: 'VIC' },
    ],
    activities: [],
  },
];
