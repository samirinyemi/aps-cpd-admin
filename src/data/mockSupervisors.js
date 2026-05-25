// Top-level supervisors catalogue.
// Each supervisor can be assigned to zero or more registrar programs. The per-assignment
// metadata (supervisionType) lives on the assignedPrograms entry, not on the supervisor itself,
// so the same supervisor can be Primary on one program and Secondary on another.
export const initialSupervisors = [
  {
    id: 's1',
    title: 'Dr',
    firstName: 'James',
    lastName: 'Mitchell',
    ahpraNumber: 'PSY0001234567',
    supervisorAoPE: 'Clinical Psychology',
    email: 'j.mitchell@melbournepsych.com.au',
    phone: '03 9347 1200',
    assignedPrograms: [
      { programId: '1',  supervisionType: 'Primary' },   // 2024–2025
      { programId: '6',  supervisionType: 'Primary' },   // 2025–2026
      { programId: '13', supervisionType: 'Primary' },   // 2023–2024
    ],
  },
  {
    id: 's2',
    title: 'Prof',
    firstName: 'Linda',
    lastName: 'Nguyen',
    ahpraNumber: 'PSY0009876543',
    supervisorAoPE: 'Clinical Psychology',
    email: 'l.nguyen@unimelb.edu.au',
    phone: '03 8344 6300',
    assignedPrograms: [
      { programId: '1',  supervisionType: 'Secondary' }, // 2024–2025
      { programId: '11', supervisionType: 'Primary' },   // 2022–2023
    ],
  },
  {
    id: 's3',
    title: 'Dr',
    firstName: 'Karen',
    lastName: 'Patel',
    ahpraNumber: 'PSY0002345678',
    supervisorAoPE: 'Organisational Psychology',
    email: 'k.patel@orgpsych.com.au',
    phone: '02 9267 4455',
    assignedPrograms: [
      { programId: '2',  supervisionType: 'Primary' },   // 2024–2025
      { programId: '8',  supervisionType: 'Primary' },   // 2025–2026
      { programId: '9',  supervisionType: 'Primary' },   // 2021–2022
      { programId: '14', supervisionType: 'Primary' },   // 2023–2024
    ],
  },
  {
    id: 's4',
    title: 'Dr',
    firstName: 'Michael',
    lastName: "O'Brien",
    ahpraNumber: 'PSY0003456789',
    supervisorAoPE: 'Forensic Psychology',
    email: 'michael.obrien@forensicpsych.com.au',
    phone: '07 3221 8899',
    assignedPrograms: [
      { programId: '3',  supervisionType: 'Primary' },   // 2023–2024
      { programId: '7',  supervisionType: 'Primary' },   // 2025–2026
      { programId: '15', supervisionType: 'Primary' },   // 2024–2025
    ],
  },
  {
    id: 's5',
    title: 'Dr',
    firstName: 'Amanda',
    lastName: 'Foster',
    ahpraNumber: 'PSY0004567890',
    supervisorAoPE: 'Clinical Psychology',
    email: 'a.foster@brisbaneclinic.com.au',
    phone: '07 3009 2211',
    assignedPrograms: [
      { programId: '3', supervisionType: 'Secondary' },  // 2023–2024
    ],
  },
  {
    id: 's6',
    title: 'Prof',
    firstName: 'Robert',
    lastName: 'Shaw',
    ahpraNumber: 'PSY0005678901',
    supervisorAoPE: 'Clinical Neuropsychology',
    email: 'r.shaw@adelaide.edu.au',
    phone: '08 8313 5200',
    assignedPrograms: [
      { programId: '4',  supervisionType: 'Primary' },   // 2022–2023
      { programId: '10', supervisionType: 'Primary' },   // 2021–2022
    ],
  },
  {
    id: 's7',
    title: 'Dr',
    firstName: 'Priya',
    lastName: 'Sharma',
    ahpraNumber: 'PSY0006789012',
    supervisorAoPE: 'Health Psychology',
    email: 'p.sharma@healthpsych.com.au',
    phone: '03 9654 3300',
    assignedPrograms: [
      { programId: '5',  supervisionType: 'Primary' },   // 2021–2022
      { programId: '12', supervisionType: 'Primary' },   // 2022–2023
    ],
  },
  {
    id: 's8',
    title: 'Mr',
    firstName: 'Daniel',
    lastName: 'Kovacs',
    ahpraNumber: 'PSY0007890123',
    supervisorAoPE: 'Educational & Developmental Psychology',
    email: 'd.kovacs@edpsych.com.au',
    phone: '02 8080 7654',
    assignedPrograms: [],
  },
];
