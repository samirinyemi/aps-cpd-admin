// ---------------------------------------------------------------------------
// Data padding for demo volume
// ---------------------------------------------------------------------------
// Every persona should have 20 learning plans and 20 activities so the
// Manage Learning Plan and Activities listings have meaningful pagination
// (10 per page). Hand-written entries are authored per persona above; the
// padLearningPlans and padActivities helpers below extend each persona's
// list up to 20 with AoPE-themed generated entries.

const LEARNING_TOPICS_BY_AOPE = {
  'Clinical Psychology': [
    'Trauma-focused CBT', 'Dialectical Behaviour Therapy (DBT) foundations', 'Acceptance & Commitment Therapy',
    'Schema therapy for personality', 'Mindfulness-based CBT', 'Crisis assessment essentials',
    'Eating-disorder treatment overview', 'Grief & bereavement therapy', 'Parent-management training basics',
    'Couples therapy fundamentals', 'Adult ADHD assessment', 'Working with chronic pain',
  ],
  'Organisational Psychology': [
    'Psychometric assessment refresh', '360-degree feedback delivery', 'Leadership coaching frameworks',
    'Change management essentials', 'Workplace mental-health programs', 'Team dynamics and intervention',
    'Selection interview design', 'Organisational culture assessment', 'Performance management systems',
    'Employee engagement strategies', 'Workplace investigation skills', 'Executive coaching models',
  ],
  'Forensic Psychology': [
    'Risk assessment best practice', 'Report writing for court', 'Interview technique refresh',
    'Cross-cultural forensic practice', 'Trauma-informed interviewing', 'Youth-justice assessment',
    'Domestic violence risk formulation', 'Civil forensic work', 'Substance misuse and offending',
    'Correctional treatment design', 'Victim impact evaluations', 'Fitness-for-work assessments',
  ],
  'Clinical Neuropsychology': [
    'Dementia screening updates', 'TBI assessment protocols', 'Paediatric neuropsychology',
    'Cognitive rehabilitation frameworks', 'Neuropsychological feedback sessions', 'Driving assessment basics',
    'Capacity evaluations', 'Cognitive testing in low-literacy populations', 'Stroke recovery interventions',
    'Memory clinic workflows', 'Executive function interventions', 'MS & neurological conditions',
  ],
  'Counselling Psychology': [
    'Person-centred updates', 'Grief & loss work', 'Couples and relationship counselling',
    'Ethics in digital practice', 'Working with complex trauma', 'Attachment-informed approaches',
    'Short-term solution-focused therapy', 'Career counselling frameworks', 'Boundaries in small communities',
    'Group facilitation skills', 'Mindful self-compassion', 'Cultural humility practice',
  ],
  'Health Psychology': [
    'Chronic pain management approaches', 'Motivational interviewing refresh', 'Health-behaviour change models',
    'Diabetes psychosocial support', 'Weight management interventions', 'Cardiac rehab psychology',
    'Oncology support programs', 'Sleep-focused CBT (CBT-I)', 'Behavioural medicine integration',
    'Smoking cessation programs', 'Stress-management group protocols', 'Caregiver support interventions',
  ],
  'Educational & Developmental Psychology': [
    'Autism spectrum assessment in adolescents', 'School-based intervention programs', 'ADHD classroom supports',
    'Learning-disability identification', 'Early-childhood assessment tools', 'Reading intervention frameworks',
    'Social-skills programs (PEERS)', 'Cognitive-behavioural parenting', 'Twice-exceptional learners',
    'School-refusal interventions', 'Anxiety in schools', 'Giftedness assessment',
  ],
  'Sport & Exercise Psychology': [
    'Injury rehabilitation psychology', 'Team cohesion models', 'Performance-profiling frameworks',
    'Imagery and visualisation', 'Burnout in elite athletes', 'Youth sport participation models',
    'Concussion psychology', 'Return-to-play assessment', 'Body-image interventions',
    'Coach-education frameworks', 'Pressure & performance-anxiety protocols', 'Retirement transition support',
  ],
  'Community Psychology': [
    'Community resilience frameworks', 'Disaster mental-health response', 'Participatory action research',
    'Trauma-informed community work', 'Social-justice-informed practice', 'Program evaluation methods',
    'Community consultation skills', 'Grant-writing for community programs', 'Cultural-safety collective work',
    'Public mental-health literacy', 'Community advocacy basics', 'Peer-support program design',
  ],
};

const ACTIVITY_TEMPLATES_BY_AOPE = {
  generic: [
    { kind: 'Active CPD', title: 'Workshop', actionHrs: 6 },
    { kind: 'Active CPD', title: 'Online course', actionHrs: 4 },
    { kind: 'Active CPD', title: 'Webinar series', actionHrs: 3 },
    { kind: 'Active CPD', title: 'Conference attendance', actionHrs: 8 },
    { kind: 'Active CPD', title: 'Case presentation', actionHrs: 2 },
    { kind: 'Active CPD', title: 'Professional masterclass', actionHrs: 4 },
    { kind: 'Peer Consultation', peerHrs: 1.5, actionHrs: 0 },
    { kind: 'Peer Consultation', peerHrs: 2, actionHrs: 0 },
    { kind: 'Peer Consultation', peerHrs: 1, actionHrs: 1 },
    { kind: 'Peer Consultation', peerHrs: 2, actionHrs: 0.5 },
    { kind: 'Other CPD', title: 'Journal article review', actionHrs: 1.5 },
    { kind: 'Other CPD', title: 'Textbook chapter reading', actionHrs: 2 },
    { kind: 'Other CPD', title: 'Evidence-based practice update', actionHrs: 2 },
  ],
};

const PEER_FOCUS_LIBRARY = [
  'Complex case formulation', 'Risk and safety planning', 'Supervision skills reflection',
  'Cultural considerations in practice', 'Intervention selection for a new referral',
  'Ethics consultation', 'Case closure and transition planning', 'Psychometric interpretation',
  'Assessment feedback with family', 'Boundary and self-care reflection',
];

function padLearningPlans(persona) {
  const existing = Array.isArray(persona.learningNeeds) ? persona.learningNeeds : [];
  if (existing.length >= 20) return existing;
  const aope = (persona.aoPEs && persona.aoPEs[0]) || 'Clinical Psychology';
  const topics = LEARNING_TOPICS_BY_AOPE[aope] || LEARNING_TOPICS_BY_AOPE['Clinical Psychology'];
  const existingTitles = new Set(existing.map((n) => (n.title || n.need || '').toLowerCase()));
  const padded = [...existing];
  const statuses = ['In Progress', 'Not Started', 'Completed'];
  let idx = 1;
  for (const topic of topics) {
    if (padded.length >= 20) break;
    if (existingTitles.has(topic.toLowerCase())) continue;
    const status = statuses[padded.length % statuses.length];
    padded.push({
      id: `${persona.id}-gen-ln${idx++}`,
      title: topic,
      description: `Planned professional development around ${topic.toLowerCase()}.`,
      proposedDate: 'Across Q2–Q4 of the current cycle.',
      anticipatedOutcome: `Apply ${topic.toLowerCase()} learning in at least one client context.`,
      status,
      reviews: status === 'Completed'
        ? [{ id: `${persona.id}-gen-rv${idx}`, reviewedAt: '2025-10-15', notes: 'Completed the planned training and reviewed outcomes with peer.' }]
        : [],
    });
  }
  // If the topic library wasn't big enough, continue with numbered fillers.
  let filler = 1;
  while (padded.length < 20) {
    const status = statuses[padded.length % statuses.length];
    padded.push({
      id: `${persona.id}-gen-ln-extra${filler}`,
      title: `Area of focus ${filler}`,
      description: 'Additional learning need planned for this cycle.',
      proposedDate: 'Flexible — rolling across the cycle.',
      anticipatedOutcome: 'Captured reflection and integrated into practice.',
      status,
      reviews: [],
    });
    filler++;
  }
  return padded;
}

function padActivities(persona) {
  const existing = Array.isArray(persona.activities) ? persona.activities : [];
  if (existing.length >= 20) return existing;
  const aope = (persona.aoPEs && persona.aoPEs[0]) || 'Clinical Psychology';
  const templates = ACTIVITY_TEMPLATES_BY_AOPE.generic;
  const padded = [...existing];
  let idx = 1;
  while (padded.length < 20) {
    const t = templates[(padded.length) % templates.length];
    // Fan out completion dates across 2025
    const month = String(((padded.length * 3) % 11) + 1).padStart(2, '0');
    const day = String(((padded.length * 7) % 27) + 1).padStart(2, '0');
    const completedDate = `2025-${month}-${day}`;
    const loggedDate = completedDate;
    const base = {
      id: `${persona.id}-gen-a${idx++}`,
      cycleId: '2',
      allocation: aope,
      activityKind: t.kind,
      activityType: t.kind,
      completedDate,
      loggedDate,
      journalMode: 'PD Tool',
      journalNotes: `Generated demo activity tied to ${aope}.`,
    };
    if (t.kind === 'Peer Consultation') {
      const focus = PEER_FOCUS_LIBRARY[padded.length % PEER_FOCUS_LIBRARY.length];
      padded.push({
        ...base,
        focus,
        colleagues: 'Peer group',
        peerHrs: t.peerHrs,
        actionHrs: t.actionHrs,
        cpdHrs: (t.peerHrs || 0) + (t.actionHrs || 0),
      });
    } else {
      padded.push({
        ...base,
        activityTitle: `${t.title} — ${aope}`,
        details: `Focused on an aspect of ${aope.toLowerCase()} practice.`,
        peerHrs: 0,
        actionHrs: t.actionHrs,
        cpdHrs: t.actionHrs,
      });
    }
  }
  return padded;
}

function applyPadding(profiles) {
  return profiles.map((p) => ({
    ...p,
    learningNeeds: padLearningPlans(p),
    activities: padActivities(p),
  }));
}

const rawInitialCpdProfiles = [
  {
    id: '1',
    memberName: 'Dr Sarah Chen',
    memberNumber: 'PSY-2024-001',
    grade: 'Registrar',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    generalRegistrationDate: '2015-03-12',
    regDate: '2015-03-12',
    cpdExemption: false,
    termsOfUse: true,
    learningPlanMethod: 'PD Tool',
    aoPEs: ['Clinical Psychology'],
    requirementsMet: true,
    learningNeeds: [
      {
        id: 'ln1', title: 'Evidence-based trauma interventions',
        description: 'Deepen my application of trauma-focused CBT, EMDR, and phase-based approaches with complex PTSD clients.',
        proposedDate: 'Across Q3 and Q4 — 2-day workshop plus monthly peer consultation.',
        anticipatedOutcome: 'Confidently formulate and deliver phased trauma treatment for complex presentations.',
        status: 'In Progress',
        reviews: [
          { id: 'rv1', reviewedAt: '2025-09-30', notes: 'Completed EMDR refresher and applied with two clients. Peer group helpful for case conceptualisation.' },
          { id: 'rv2', reviewedAt: '2025-11-15', notes: 'Reviewed progress with supervisor. Next step: integrate somatic grounding techniques.' },
        ],
      },
      {
        id: 'ln2', title: 'Supervision skills development',
        description: 'Build my skills as a secondary supervisor with registrars — including reflective practice frameworks and feedback delivery.',
        proposedDate: 'Semester 2 — monthly reading + quarterly supervision-of-supervision.',
        anticipatedOutcome: 'Provide structured, reflective supervision to at least one registrar this cycle.',
        status: 'Completed',
        reviews: [
          { id: 'rv3', reviewedAt: '2025-10-10', notes: 'Completed supervisor training course; registrar assignment started in October.' },
        ],
      },
      {
        id: 'ln3', title: 'Cultural competence for First Nations clients',
        description: 'Strengthen culturally safe practice with Aboriginal and Torres Strait Islander clients and their families.',
        proposedDate: 'Rolling — reading + cultural supervision throughout the year.',
        anticipatedOutcome: 'Embed cultural safety framework across all intake assessments and treatment plans.',
        status: 'In Progress',
        reviews: [
          { id: 'rv4', reviewedAt: '2025-10-22', notes: 'Attended AIPA cultural safety webinar; started using yarning approach in intake.' },
        ],
      },
      {
        id: 'ln4', title: 'Adolescent depression treatment',
        description: 'Improve outcomes for adolescent clients presenting with depression by integrating IPT-A and family involvement.',
        proposedDate: 'Term 3 workshop + 6-month application phase.',
        anticipatedOutcome: 'Deliver IPT-A to at least 3 adolescent clients with measured symptom reduction.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'ln5', title: 'DBT skills groups',
        description: 'Lead a full 24-week DBT skills group for adult clients with emotional dysregulation.',
        proposedDate: 'Facilitator training Feb 2026, group commences Mar 2026.',
        anticipatedOutcome: 'Co-facilitate one DBT group cycle and evaluate outcomes.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'ln6', title: 'Telehealth best practice',
        description: 'Refine telehealth delivery with children and older adults — platform, consent, safety planning.',
        proposedDate: 'Online module + APS practice note review, September.',
        anticipatedOutcome: 'Updated telehealth protocol adopted across my caseload.',
        status: 'Completed',
        reviews: [
          { id: 'rv5', reviewedAt: '2025-10-01', notes: 'Protocol updated; shared with team.' },
        ],
      },
      {
        id: 'ln7', title: 'Clinical risk assessment',
        description: 'Formalise suicide and self-harm risk assessment using the Columbia Suicide Severity Rating Scale.',
        proposedDate: 'Workshop in August + in-session integration over 3 months.',
        anticipatedOutcome: 'C-SSRS embedded in intake and review workflow.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'ln8', title: 'Psychopharmacology literacy',
        description: 'Improve working knowledge of common SSRI/SNRI/antipsychotic side-effect profiles and interactions.',
        proposedDate: 'Quarterly self-directed reading + GP liaison debriefs.',
        anticipatedOutcome: 'More collaborative medication-related conversations with prescribing GPs.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'ln9', title: 'Outcome measurement rigor',
        description: 'Implement routine outcome monitoring (ORS/SRS or PHQ-9/GAD-7) across all new clients.',
        proposedDate: 'Roll out in Q2 after template design.',
        anticipatedOutcome: 'Outcome data captured for 90% of new clients across a 6-month window.',
        status: 'Completed',
        reviews: [
          { id: 'rv6', reviewedAt: '2025-08-05', notes: 'ORS/SRS now standard intake; data captured on 88% of new clients.' },
        ],
      },
      {
        id: 'ln10', title: 'Ethics: boundaries in small communities',
        description: 'Explore ethical decision-making in rural/regional practice where multiple relationships are common.',
        proposedDate: 'Reading + ethics consultation.',
        anticipatedOutcome: 'Documented decision framework used in at least 2 cases.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'ln11', title: 'Group formulation skills',
        description: 'Strengthen case formulation for complex clients drawing on CBT, schema, and attachment lenses.',
        proposedDate: 'Monthly formulation-focused peer consultation across the year.',
        anticipatedOutcome: 'Integrated formulation applied to 5+ complex cases with peer feedback.',
        status: 'In Progress',
        reviews: [
          { id: 'rv7', reviewedAt: '2025-11-02', notes: 'Peer group noted growth in integrating schema with CBT for personality presentations.' },
        ],
      },
      {
        id: 'ln12', title: 'Neurodiversity-affirming practice',
        description: 'Adopt neurodiversity-affirming approach with autistic and ADHD clients — assessment language, accommodation planning.',
        proposedDate: 'Workshop plus ongoing reading over 6 months.',
        anticipatedOutcome: 'Report templates and session language reflect a neurodiversity-affirming stance.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'ln13', title: 'Brief interventions for anxiety',
        description: 'Equip for short-course (4–6 session) evidence-based anxiety work suitable for EAP/short-contract referrals.',
        proposedDate: 'Online course + 3-month application window.',
        anticipatedOutcome: 'Structured 6-session template available for new EAP referrals.',
        status: 'Completed',
        reviews: [
          { id: 'rv8', reviewedAt: '2025-07-20', notes: 'Template live; used with 4 clients to date — positive feedback.' },
        ],
      },
      {
        id: 'ln14', title: 'Supervisor training — primary role',
        description: 'Upgrade from secondary to primary supervisor accreditation so I can supervise registrars end-to-end.',
        proposedDate: 'Primary-supervisor workshop Feb 2026; application by April 2026.',
        anticipatedOutcome: 'Primary supervisor endorsement obtained.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'ln15', title: 'Private practice business literacy',
        description: 'Grow business-side knowledge — Medicare MBS updates, record-keeping, insurance basics.',
        proposedDate: 'APS webinar + quarterly check-ins.',
        anticipatedOutcome: 'Updated practice systems aligned with current MBS and retention rules.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'ln16', title: 'Motivational Interviewing refresh',
        description: 'Re-anchor MI skills — reflective listening, evoking change talk, resistance roll-with approach — for substance-use referrals.',
        proposedDate: 'Two-day workshop in February + recorded-session review over following month.',
        anticipatedOutcome: 'Measurable increase in change-talk utterances across session recordings.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'ln17', title: 'Perinatal mental health fundamentals',
        description: 'Build a working knowledge base for assessment and treatment of perinatal depression and anxiety.',
        proposedDate: 'MHPN perinatal series (4 webinars) March–June.',
        anticipatedOutcome: 'Confidence to accept perinatal referrals; screening protocol in place.',
        status: 'In Progress',
        reviews: [
          { id: 'rv9', reviewedAt: '2025-10-12', notes: 'First two webinars done; key insight: importance of routine screening across both antenatal and postnatal touchpoints.' },
        ],
      },
      {
        id: 'ln18', title: 'Sleep-focused CBT (CBT-I)',
        description: 'Structured CBT for insomnia — sleep hygiene, stimulus control, sleep restriction, cognitive components.',
        proposedDate: 'CBT-I online certification + 3-month application phase.',
        anticipatedOutcome: 'Deliver a full 6-session CBT-I protocol to at least 2 clients.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'ln19', title: 'Working with interpreters',
        description: 'Best-practice for psychological work with professional interpreters — briefing, turn-taking, debriefing.',
        proposedDate: 'Reading list + peer consultation in Q1.',
        anticipatedOutcome: 'Established protocol documented and trialed with two referrals.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'ln20', title: 'Clinical writing and case notes',
        description: 'Improve case-note quality — SOAP-style structure, risk formulation clarity, defensible language.',
        proposedDate: 'Quarterly self-audit + peer review pairing.',
        anticipatedOutcome: 'Peer reviewer rates my sample notes as "fit for purpose" without major edits.',
        status: 'In Progress',
        reviews: [
          { id: 'rv10', reviewedAt: '2025-11-08', notes: 'Self-audit Q3 complete; main gap flagged: explicit safety-plan language in risk notes.' },
        ],
      },
    ],
    activities: [
      // 2021–2022 cycle
      { id: 'a00a', cycleId: '0a', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Conference Attendance', peerHrs: 0, actionHrs: 12, cpdHrs: 12, completedDate: '2021-11-14', loggedDate: '2021-11-15', journalNotes: 'APS conference — three-day clinical stream.' },
      { id: 'a00b', cycleId: '0a', allocation: 'Clinical Psychology', activityKind: 'Peer Consultation', peerHrs: 4, actionHrs: 2, cpdHrs: 6, completedDate: '2022-03-18', loggedDate: '2022-03-19', journalNotes: 'Quarterly peer group.' },
      // 2022–2023 cycle
      { id: 'a00c', cycleId: '0b', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Online Learning', peerHrs: 0, actionHrs: 15, cpdHrs: 15, completedDate: '2022-10-05', loggedDate: '2022-10-06', journalNotes: 'Online course on schema therapy.' },
      { id: 'a00d', cycleId: '0b', allocation: 'Clinical Psychology', activityKind: 'Peer Consultation', peerHrs: 6, actionHrs: 2, cpdHrs: 8, completedDate: '2023-04-12', loggedDate: '2023-04-13', journalNotes: 'Monthly peer consultation across the year.' },
      // 2023–2024 cycle
      { id: 'a00e', cycleId: '0c', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Workshop', peerHrs: 0, actionHrs: 10, cpdHrs: 10, completedDate: '2023-09-22', loggedDate: '2023-09-23', journalNotes: 'EMDR foundational training.' },
      { id: 'a00f', cycleId: '0c', allocation: 'Clinical Psychology', activityKind: 'Peer Consultation', peerHrs: 5, actionHrs: 3, cpdHrs: 8, completedDate: '2024-05-20', loggedDate: '2024-05-21', journalNotes: 'Peer consultation group — complex cases.' },
      // 2024–2025 cycle (now-closed)
      { id: 'a0a', cycleId: '1', allocation: 'Clinical Psychology', activityType: 'Workshop', peerHrs: 0, actionHrs: 6, cpdHrs: 6, completedDate: '2025-02-12', loggedDate: '2025-02-13', journalNotes: 'Two-day workshop on trauma-focused CBT.' },
      { id: 'a0b', cycleId: '1', allocation: 'Clinical Psychology', activityType: 'Peer Consultation', peerHrs: 3, actionHrs: 0, cpdHrs: 3, completedDate: '2025-04-05', loggedDate: '2025-04-06', journalNotes: 'Monthly peer consultation group — 3 sessions.' },
      // 2025–2026 cycle (Open) — richer seed so the dashboard is demo-ready
      { id: 'a1', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Complex trauma case conceptualisation', colleagues: 'Dr Mitchell, Dr Patel', peerHrs: 2, actionHrs: 0, cpdHrs: 2, completedDate: '2025-08-15', loggedDate: '2025-08-16', journalMode: 'PD Tool', journalNotes: 'Discussed complex trauma case with peer group — revised formulation.' },
      { id: 'a2', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'APS Annual Conference', details: 'Attended three keynote sessions on CBT advances and trauma-focused interventions.', peerHrs: 0, actionHrs: 4, cpdHrs: 4, completedDate: '2025-09-20', loggedDate: '2025-09-21', journalMode: 'PD Tool', journalNotes: 'Takeaway: precision CBT protocols improve dropout rates.' },
      { id: 'a3', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Supervision approaches', colleagues: 'Dr Nguyen', peerHrs: 1.5, actionHrs: 0, cpdHrs: 1.5, completedDate: '2025-10-05', loggedDate: '2025-10-06', journalMode: 'PD Tool', journalNotes: 'Monthly peer supervision session.' },
      { id: 'a4', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'Telehealth best practices module', details: 'APS online course covering consent, privacy, safety planning over telehealth.', peerHrs: 0, actionHrs: 3, cpdHrs: 3, completedDate: '2025-11-10', loggedDate: '2025-11-12', journalMode: 'PD Tool', journalNotes: 'Completed module; updated my telehealth consent template.' },
      { id: 'a5', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'Reading — "The Body Keeps the Score"', details: 'Re-read chapters 4–7 on developmental trauma.', peerHrs: 0, actionHrs: 2, cpdHrs: 2, completedDate: '2025-08-02', loggedDate: '2025-08-03', journalMode: 'PD Tool', journalNotes: 'Integrated somatic language into two intake sessions.' },
      { id: 'a6', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Risk assessment — adolescent self-harm', colleagues: 'Dr Tran, Dr Rodriguez', peerHrs: 1, actionHrs: 1, cpdHrs: 2, completedDate: '2025-09-05', loggedDate: '2025-09-06', journalMode: 'PD Tool', journalNotes: 'Consult on 16yo presenting with NSSI. Agreed on C-SSRS structure.' },
      { id: 'a7', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'EMDR supervision group', details: 'Quarterly EMDR consultation group.', peerHrs: 0, actionHrs: 2, cpdHrs: 2, completedDate: '2025-09-28', loggedDate: '2025-09-29', journalMode: 'PD Tool', journalNotes: 'Case presentation and targeted protocol feedback.' },
      { id: 'a8', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'Two-day DBT skills workshop', details: 'Introduction to DBT skills group facilitation.', peerHrs: 0, actionHrs: 14, cpdHrs: 14, completedDate: '2025-10-18', loggedDate: '2025-10-20', journalMode: 'PD Tool', journalNotes: 'Ready to co-facilitate distress-tolerance module in Q2 2026.' },
      { id: 'a9', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Supervisor-of-supervisor reflection', colleagues: 'Dr Mitchell', peerHrs: 2, actionHrs: 0, cpdHrs: 2, completedDate: '2025-10-22', loggedDate: '2025-10-23', journalMode: 'PD Tool', journalNotes: 'Reviewed approach to feedback delivery with registrar.' },
      { id: 'a10', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'APS journal — ethics special issue', details: 'Read three articles from the Ethics special issue.', peerHrs: 0, actionHrs: 1.5, cpdHrs: 1.5, completedDate: '2025-07-12', loggedDate: '2025-07-13', journalMode: 'PD Tool', journalNotes: 'Reflection: flagged dual-relationship concern with a new referral.' },
      { id: 'a11', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'Webinar — neurodiversity-affirming assessment', details: 'Two-hour live webinar by Dr Amos.', peerHrs: 0, actionHrs: 2, cpdHrs: 2, completedDate: '2025-11-01', loggedDate: '2025-11-02', journalMode: 'PD Tool', journalNotes: 'Updated my report language for adult autism assessments.' },
      { id: 'a12', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Complex PTSD formulation', colleagues: 'Dr Kim, Dr Foster', peerHrs: 1.5, actionHrs: 0.5, cpdHrs: 2, completedDate: '2025-11-18', loggedDate: '2025-11-19', journalMode: 'Offline', journalNotes: 'Journal documented in personal practice notebook.' },
      { id: 'a13', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'Cultural safety webinar (AIPA)', details: 'AIPA cultural safety webinar for non-Indigenous clinicians.', peerHrs: 0, actionHrs: 1.5, cpdHrs: 1.5, completedDate: '2025-11-22', loggedDate: '2025-11-23', journalMode: 'PD Tool', journalNotes: 'Yarning approach now used in intake; reflected with supervisor.' },
      { id: 'a14', cycleId: '2', allocation: 'Clinical Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'Reading — IPT-A manual (Mufson)', details: 'Chapters on session structure and family sessions.', peerHrs: 0, actionHrs: 3, cpdHrs: 3, completedDate: '2025-11-26', loggedDate: '2025-11-27', journalMode: 'PD Tool', journalNotes: 'Preparing to trial with one adolescent client.' },
    ],
  },
  {
    id: '2',
    memberName: 'Mr David Thompson',
    memberNumber: 'PSY-2024-015',
    grade: 'Registrar',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    generalRegistrationDate: '2019-07-01',
    regDate: '2019-07-01',
    cpdExemption: false,
    termsOfUse: true,
    learningPlanMethod: 'Offline',
    aoPEs: ['Organisational Psychology'],
    requirementsMet: false,
    learningNeeds: [
      { id: 'ln3', title: 'Leadership coaching frameworks', description: '', proposedDate: '', anticipatedOutcome: '', status: 'In Progress', reviews: [] },
      { id: 'ln4', title: 'Psychometric assessment updates', description: '', proposedDate: '', anticipatedOutcome: '', status: 'Not Started', reviews: [] },
    ],
    activities: [
      { id: 'a5', cycleId: '2', allocation: 'Organisational Psychology', activityType: 'Workshop', peerHrs: 0, actionHrs: 6, cpdHrs: 6, completedDate: '2025-08-22', loggedDate: '2025-08-23', journalNotes: 'Full-day workshop on 360-degree feedback.' },
      { id: 'a6', cycleId: '2', allocation: 'Organisational Psychology', activityType: 'Peer Consultation', peerHrs: 1, actionHrs: 0, cpdHrs: 1, completedDate: '2025-09-15', loggedDate: '2025-09-16', journalNotes: 'Consultation with colleague on org culture assessment.' },
    ],
  },
  {
    id: '3',
    memberName: 'Ms Emily Rodriguez',
    memberNumber: 'PSY-2023-042',
    grade: 'Registrar',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    generalRegistrationDate: '2012-01-15',
    regDate: '2012-01-15',
    cpdExemption: true,
    termsOfUse: true,
    learningPlanMethod: 'PD Tool',
    aoPEs: ['Forensic Psychology', 'Clinical Psychology'],
    requirementsMet: true,
    learningNeeds: [],
    activities: [],
  },
  {
    id: '4',
    memberName: 'Dr Michael Torres',
    memberNumber: 'APS-11456',
    grade: 'Associate Member',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    generalRegistrationDate: '2021-02-28',
    regDate: '2021-02-28',
    cpdExemption: false,
    termsOfUse: true,
    learningPlanMethod: 'PD Tool',
    aoPEs: ['Counselling Psychology'],
    requirementsMet: false,
    learningNeeds: [
      { id: 'ln5', title: 'Cultural competency in counselling', description: '', proposedDate: '', anticipatedOutcome: '', status: 'In Progress', reviews: [] },
      { id: 'ln6', title: 'Grief and loss interventions', description: '', proposedDate: '', anticipatedOutcome: '', status: 'Not Started', reviews: [] },
      { id: 'ln7', title: 'Ethics in digital practice', description: '', proposedDate: '', anticipatedOutcome: '', status: 'Completed', reviews: [] },
    ],
    activities: [
      { id: 'a7', cycleId: '2', activityType: 'Peer Supervision', peerHrs: 2, actionHrs: 0, cpdHrs: 2, completedDate: '2025-07-20', loggedDate: '2025-07-21', journalNotes: 'Group supervision with three peers on complex cases.' },
      { id: 'a8', cycleId: '2', activityType: 'Reading/Research', peerHrs: 0, actionHrs: 2, cpdHrs: 2, completedDate: '2025-08-05', loggedDate: '2025-08-10', journalNotes: 'Reviewed recent literature on cultural safety frameworks.' },
      { id: 'a9', cycleId: '2', activityType: 'Conference Attendance', peerHrs: 0, actionHrs: 8, cpdHrs: 8, completedDate: '2025-09-20', loggedDate: '2025-09-22', journalNotes: 'APS Annual Conference – full two-day attendance.' },
    ],
  },
  {
    id: '5',
    memberName: 'Dr Priya Sharma',
    memberNumber: 'APS-12010',
    grade: 'Member',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    generalRegistrationDate: '2018-11-10',
    regDate: '2018-11-10',
    cpdExemption: false,
    termsOfUse: false,
    learningPlanMethod: 'Offline',
    aoPEs: ['Health Psychology'],
    requirementsMet: false,
    learningNeeds: [
      { id: 'ln8', title: 'Chronic pain management approaches', description: '', proposedDate: '', anticipatedOutcome: '', status: 'In Progress', reviews: [] },
    ],
    activities: [
      { id: 'a10', cycleId: '2', activityType: 'Online Learning', peerHrs: 0, actionHrs: 4, cpdHrs: 4, completedDate: '2025-08-01', loggedDate: '2025-08-02', journalNotes: 'Online course on motivational interviewing in health settings.' },
      { id: 'a11', cycleId: '2', activityType: 'Peer Consultation', peerHrs: 1.5, actionHrs: 0, cpdHrs: 1.5, completedDate: '2025-10-18', loggedDate: '2025-10-19', journalNotes: 'Peer discussion on chronic disease management program.' },
    ],
  },
  {
    id: '6',
    memberName: 'Dr Robert Kim',
    memberNumber: 'APS-12345',
    grade: 'Fellow',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    generalRegistrationDate: '2010-06-20',
    regDate: '2010-06-20',
    cpdExemption: false,
    termsOfUse: true,
    learningPlanMethod: 'PD Tool',
    aoPEs: ['Forensic Psychology'],
    requirementsMet: true,
    learningNeeds: [
      {
        id: 'rk-ln1', title: 'HCR-20 V3 updates and re-calibration',
        description: 'Stay current with the latest HCR-20 V3 coding guidelines and align practice with the updated risk formulation framework.',
        proposedDate: 'Workshop in July + case application through Q3/Q4.',
        anticipatedOutcome: 'All current forensic reports reference the HCR-20 V3 formulation model consistently.',
        status: 'Completed',
        reviews: [
          { id: 'rk-rv1', reviewedAt: '2025-09-12', notes: 'Workshop completed in July; applied to three pre-sentence reports.' },
        ],
      },
      {
        id: 'rk-ln2', title: 'Expert witness testimony skills',
        description: 'Refine courtroom presentation — cross-examination technique, clarity under pressure, credibility markers.',
        proposedDate: 'Advanced expert-witness training in October + mock-trial practice.',
        anticipatedOutcome: 'Deliver three court appearances with peer feedback rating "confident and clear."',
        status: 'In Progress',
        reviews: [
          { id: 'rk-rv2', reviewedAt: '2025-11-03', notes: 'Completed two mock-trial exercises; adjusted pacing and plain-language explanations.' },
        ],
      },
      {
        id: 'rk-ln3', title: 'Malingering detection — SIRS-2 & MMPI-2-RF validity',
        description: 'Deepen knowledge of symptom validity testing in forensic contexts, especially with compensation/legal referrals.',
        proposedDate: 'Reading program Q1 + supervision in Q2.',
        anticipatedOutcome: 'Competent, defensible use of SIRS-2 and MMPI-2-RF validity scales in forensic assessments.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'rk-ln4', title: 'Violence risk assessment — SVR-20',
        description: 'Build SVR-20 competence for pre-release and parole contexts.',
        proposedDate: 'Manual review + SVR-20 workshop in March.',
        anticipatedOutcome: 'SVR-20 integrated into two parole-board reports.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'rk-ln5', title: 'Cultural considerations in forensic assessment',
        description: 'Strengthen culturally informed practice — especially assessments involving Aboriginal and Torres Strait Islander clients.',
        proposedDate: 'AIPA cultural safety webinar + ongoing cultural supervision.',
        anticipatedOutcome: 'Cultural formulation documented in every forensic assessment involving First Nations clients.',
        status: 'In Progress',
        reviews: [
          { id: 'rk-rv3', reviewedAt: '2025-10-18', notes: 'Attended AIPA webinar; drafted cultural formulation template.' },
        ],
      },
      {
        id: 'rk-ln6', title: 'Juvenile forensic assessment (SAVRY)',
        description: 'Up-skill on SAVRY and developmental considerations for adolescent forensic assessments.',
        proposedDate: 'Online training Q2 + case consultation.',
        anticipatedOutcome: 'SAVRY used appropriately across all juvenile justice referrals.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'rk-ln7', title: 'Competence to stand trial evaluations',
        description: 'Refresh fitness-to-stand-trial assessment process and relevant legislation.',
        proposedDate: 'Reading + legislative refresher.',
        anticipatedOutcome: 'Confident independent delivery of two fitness evaluations.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'rk-ln8', title: 'Forensic report writing — clarity & defensibility',
        description: 'Tighten forensic report structure — findings, limitations, formulation, recommendations; minimise jargon.',
        proposedDate: 'Quarterly peer-review of sample reports.',
        anticipatedOutcome: 'Peer reviewers rate sample reports as "fit for court" without major edits.',
        status: 'In Progress',
        reviews: [
          { id: 'rk-rv4', reviewedAt: '2025-11-10', notes: 'Q3 peer review completed; feedback: tighter formulation paragraphs.' },
        ],
      },
      {
        id: 'rk-ln9', title: 'Trauma-informed interviewing',
        description: 'Apply trauma-informed principles to forensic interviewing without compromising evidentiary clarity.',
        proposedDate: 'Two-day workshop + role-play supervision.',
        anticipatedOutcome: 'Documented trauma-informed interviewing protocol in my practice manual.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'rk-ln10', title: 'Working with interpreters in forensic contexts',
        description: 'Best practice for working with professional interpreters when conducting forensic interviews and assessments.',
        proposedDate: 'Reading + peer consultation Q2.',
        anticipatedOutcome: 'Established interpreter briefing protocol used on all non-English assessments.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'rk-ln11', title: 'Psychopathy assessment (PCL-R)',
        description: 'Maintain PCL-R accreditation and refresh inter-rater reliability.',
        proposedDate: 'Annual PCL-R calibration workshop in May.',
        anticipatedOutcome: 'PCL-R accreditation renewed; inter-rater agreement within acceptable range.',
        status: 'Completed',
        reviews: [
          { id: 'rk-rv5', reviewedAt: '2025-06-02', notes: 'Calibration workshop completed; reliability within 1 point.' },
        ],
      },
      {
        id: 'rk-ln12', title: 'Sex-offender treatment and risk (Static-99R, Stable-2007)',
        description: 'Currency on sex-offender risk tools used in treatment planning and parole contexts.',
        proposedDate: 'Training refresher + peer consultation across the year.',
        anticipatedOutcome: 'Up-to-date use of Static-99R and Stable-2007 documented in three cases.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'rk-ln13', title: 'Ethics in dual-role forensic/therapy referrals',
        description: 'Clarify ethical pathway when a referrer requests both assessment and therapy.',
        proposedDate: 'Ethics consultation + APS code review.',
        anticipatedOutcome: 'Clear, documented decision framework applied to new referrals.',
        status: 'Completed',
        reviews: [
          { id: 'rk-rv6', reviewedAt: '2025-08-25', notes: 'Decision framework finalised and circulated within team.' },
        ],
      },
      {
        id: 'rk-ln14', title: 'Neuropsychological screening in forensic contexts',
        description: 'Introductory-level neuropsychology for detecting cognitive impairment relevant to criminal responsibility.',
        proposedDate: 'Online course Q3 + supervision.',
        anticipatedOutcome: 'Appropriate screening + referral pathway documented.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'rk-ln15', title: 'Supervision of forensic registrars',
        description: 'Build primary-supervisor competence for registrars specialising in forensic psychology.',
        proposedDate: 'Supervisor training + supervision-of-supervision quarterly.',
        anticipatedOutcome: 'Primary supervision delivered to at least one forensic registrar.',
        status: 'In Progress',
        reviews: [
          { id: 'rk-rv7', reviewedAt: '2025-10-29', notes: 'Primary supervisor training complete; first registrar assignment under way.' },
        ],
      },
      {
        id: 'rk-ln16', title: 'Mental health act legislation refresh',
        description: 'Stay current with state-level mental health and guardianship legislation relevant to forensic clients.',
        proposedDate: 'Quarterly legislative reading digest.',
        anticipatedOutcome: 'Client-rights sections of reports updated and accurate.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'rk-ln17', title: 'Working in custodial settings — best practice',
        description: 'Practical skills for assessment and intervention inside correctional facilities.',
        proposedDate: 'On-site shadowing + peer consultation.',
        anticipatedOutcome: 'Comfortable delivering assessments across two correctional facilities.',
        status: 'In Progress',
        reviews: [],
      },
      {
        id: 'rk-ln18', title: 'Restorative justice approaches',
        description: 'Introductory engagement with restorative-justice models applicable to forensic psychology.',
        proposedDate: 'Reading list + external seminar Q4.',
        anticipatedOutcome: 'Understanding of when and how restorative approaches can integrate with risk-focused work.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'rk-ln19', title: 'Digital evidence and cyber-behavioural analysis',
        description: 'Emerging area — considerations when digital records are central to forensic formulation.',
        proposedDate: 'Online micro-course Q2.',
        anticipatedOutcome: 'Baseline literacy in digital evidence limitations + ethical pitfalls.',
        status: 'Not Started',
        reviews: [],
      },
      {
        id: 'rk-ln20', title: 'Burnout prevention and forensic practice',
        description: 'Proactive wellness — vicarious trauma, caseload management, peer debriefing.',
        proposedDate: 'Monthly peer debriefing + annual wellness audit.',
        anticipatedOutcome: 'Structured wellness routine maintained; caseload caps enforced.',
        status: 'In Progress',
        reviews: [
          { id: 'rk-rv8', reviewedAt: '2025-11-20', notes: 'Q3 wellness audit: caseload within cap; peer debriefing on track.' },
        ],
      },
    ],
    activities: [
      { id: 'a12', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'HCR-20 V3 workshop', details: 'Full-day workshop on HCR-20 V3 risk assessment updates.', peerHrs: 0, actionHrs: 4, cpdHrs: 4, completedDate: '2025-07-15', loggedDate: '2025-07-16', journalMode: 'PD Tool', journalNotes: 'Workshop on HCR-20 V3 risk assessment updates.' },
      { id: 'a13', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Forensic assessment — complex case', colleagues: 'Dr Foster, Dr Tran', peerHrs: 2, actionHrs: 0, cpdHrs: 2, completedDate: '2025-08-20', loggedDate: '2025-08-21', journalMode: 'PD Tool', journalNotes: 'Peer case discussion on forensic assessment.' },
      { id: 'a14', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'ANZAPPL conference', details: 'Two-day ANZAPPL conference on forensic practice.', peerHrs: 0, actionHrs: 6, cpdHrs: 6, completedDate: '2025-09-20', loggedDate: '2025-09-21', journalMode: 'PD Tool', journalNotes: 'ANZAPPL conference on forensic practice.' },
      { id: 'a15', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'Malingering detection literature review', details: 'Reviewed recent meta-analyses on SIRS-2 and MMPI-2-RF validity.', peerHrs: 0, actionHrs: 3, cpdHrs: 3, completedDate: '2025-10-30', loggedDate: '2025-11-01', journalMode: 'PD Tool', journalNotes: 'Literature review on malingering detection.' },
      { id: 'a16', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Complex forensic report', colleagues: 'Dr Kim, Dr Mitchell', peerHrs: 1, actionHrs: 0, cpdHrs: 1, completedDate: '2025-11-15', loggedDate: '2025-11-16', journalMode: 'PD Tool', journalNotes: 'Consultation on complex forensic report.' },
      { id: 'rk-a1', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'Expert witness training', details: 'Advanced expert-witness testimony course, including mock cross-examination.', peerHrs: 0, actionHrs: 8, cpdHrs: 8, completedDate: '2025-10-08', loggedDate: '2025-10-09', journalMode: 'PD Tool', journalNotes: 'Two-day advanced expert witness course.' },
      { id: 'rk-a2', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'PCL-R calibration', details: 'Annual PCL-R inter-rater reliability calibration.', peerHrs: 0, actionHrs: 4, cpdHrs: 4, completedDate: '2025-06-02', loggedDate: '2025-06-03', journalMode: 'PD Tool', journalNotes: 'Calibration workshop — reliability within 1 point.' },
      { id: 'rk-a3', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Juvenile risk assessment (SAVRY)', colleagues: 'Dr Tran', peerHrs: 1.5, actionHrs: 0.5, cpdHrs: 2, completedDate: '2025-09-02', loggedDate: '2025-09-03', journalMode: 'PD Tool', journalNotes: 'Discussion of a 15yo SAVRY formulation.' },
      { id: 'rk-a4', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'AIPA cultural safety webinar', details: 'Cultural safety framework for forensic assessment with First Nations clients.', peerHrs: 0, actionHrs: 1.5, cpdHrs: 1.5, completedDate: '2025-10-18', loggedDate: '2025-10-19', journalMode: 'PD Tool', journalNotes: 'Drafted cultural formulation template for reports.' },
      { id: 'rk-a5', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'Reading — Static-99R updates', details: 'Reviewed the 2021 Static-99R coding rules and recidivism norms.', peerHrs: 0, actionHrs: 2, cpdHrs: 2, completedDate: '2025-08-07', loggedDate: '2025-08-08', journalMode: 'PD Tool', journalNotes: 'Refreshed coding of item 4 (relationship stability).' },
      { id: 'rk-a6', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Fitness-to-stand-trial approach', colleagues: 'Dr Patel', peerHrs: 1, actionHrs: 1, cpdHrs: 2, completedDate: '2025-10-03', loggedDate: '2025-10-04', journalMode: 'PD Tool', journalNotes: 'Discussed cognitive screening approach.' },
      { id: 'rk-a7', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'Supervisor training (primary)', details: 'Primary-supervisor workshop for forensic registrars.', peerHrs: 0, actionHrs: 6, cpdHrs: 6, completedDate: '2025-09-12', loggedDate: '2025-09-13', journalMode: 'PD Tool', journalNotes: 'Primary supervision endorsement now in process.' },
      { id: 'rk-a8', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Report peer-review round', colleagues: 'Dr Foster, Dr Kim', peerHrs: 2, actionHrs: 0, cpdHrs: 2, completedDate: '2025-11-07', loggedDate: '2025-11-08', journalMode: 'Offline', journalNotes: 'Journal kept in personal notebook.' },
      { id: 'rk-a9', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'Ethics consultation case review', details: 'Dual-role referral — reviewed with ethics consultant.', peerHrs: 0, actionHrs: 1.5, cpdHrs: 1.5, completedDate: '2025-08-23', loggedDate: '2025-08-24', journalMode: 'PD Tool', journalNotes: 'Decision framework updated; referral declined on dual-role grounds.' },
      { id: 'rk-a10', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'MHPN forensic webinar series', details: 'Three-session series on forensic practice updates.', peerHrs: 0, actionHrs: 3, cpdHrs: 3, completedDate: '2025-11-20', loggedDate: '2025-11-21', journalMode: 'PD Tool', journalNotes: 'Strong insights on custodial-setting best practice.' },
      { id: 'rk-a11', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'Reading — SVR-20 manual', details: 'Re-read SVR-20 manual Chapters 2–4 for coding refresh.', peerHrs: 0, actionHrs: 2.5, cpdHrs: 2.5, completedDate: '2025-07-29', loggedDate: '2025-07-30', journalMode: 'PD Tool', journalNotes: 'Coding of dynamic factors clearer after refresh.' },
      { id: 'rk-a12', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'Trauma-informed interviewing workshop', details: 'Two-day practical workshop on trauma-informed forensic interviewing.', peerHrs: 0, actionHrs: 12, cpdHrs: 12, completedDate: '2025-10-24', loggedDate: '2025-10-25', journalMode: 'PD Tool', journalNotes: 'Drafted updated interview protocol.' },
      { id: 'rk-a13', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Peer Consultation', activityType: 'Peer Consultation', focus: 'Supervision-of-supervision reflection', colleagues: 'Dr Foster', peerHrs: 1.5, actionHrs: 0, cpdHrs: 1.5, completedDate: '2025-11-02', loggedDate: '2025-11-03', journalMode: 'PD Tool', journalNotes: 'Reviewed approach to new forensic registrar.' },
      { id: 'rk-a14', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Other CPD', activityType: 'Other CPD', activityTitle: 'Journal — Law & Human Behavior', details: 'Three articles on risk assessment in juvenile offenders.', peerHrs: 0, actionHrs: 2, cpdHrs: 2, completedDate: '2025-09-09', loggedDate: '2025-09-10', journalMode: 'Offline', journalNotes: 'Notes kept in personal research journal.' },
      { id: 'rk-a15', cycleId: '2', allocation: 'Forensic Psychology', activityKind: 'Active CPD', activityType: 'Active CPD', activityTitle: 'Mental Health Act legislative update seminar', details: 'State-level MHA update covering guardianship and custodial orders.', peerHrs: 0, actionHrs: 3, cpdHrs: 3, completedDate: '2025-08-14', loggedDate: '2025-08-15', journalMode: 'PD Tool', journalNotes: 'Updated rights paragraph template for reports.' },
    ],
  },
  {
    id: '7',
    memberName: 'Dr Lisa Nguyen',
    memberNumber: 'APS-13001',
    grade: 'Member',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    generalRegistrationDate: '2020-04-15',
    regDate: '2020-04-15',
    cpdExemption: false,
    termsOfUse: true,
    learningPlanMethod: 'PD Tool',
    aoPEs: ['Educational & Developmental Psychology'],
    requirementsMet: false,
    learningNeeds: [
      { id: 'ln11', title: 'Autism spectrum assessment in adolescents', description: '', proposedDate: '', anticipatedOutcome: '', status: 'In Progress', reviews: [] },
      { id: 'ln12', title: 'School-based intervention programs', description: '', proposedDate: '', anticipatedOutcome: '', status: 'Not Started', reviews: [] },
    ],
    activities: [
      { id: 'a17', cycleId: '2', activityType: 'Online Learning', peerHrs: 0, actionHrs: 3, cpdHrs: 3, completedDate: '2025-08-10', loggedDate: '2025-08-11', journalNotes: 'ADOS-2 refresher module.' },
      { id: 'a18', cycleId: '2', activityType: 'Peer Supervision', peerHrs: 1.5, actionHrs: 0, cpdHrs: 1.5, completedDate: '2025-09-25', loggedDate: '2025-09-26', journalNotes: 'Monthly peer supervision on complex student cases.' },
    ],
  },
  {
    id: '8',
    memberName: 'Dr Andrew Blake',
    memberNumber: 'APS-13200',
    grade: 'Member',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    aoPEs: ['Sport & Exercise Psychology'],
    regDate: '2017-09-01',
    cpdExemption: false,
    termsOfUse: true,
    learningPlanMethod: 'Free Text',
    requirementsMet: true,
    learningNeeds: [
      { id: 'ln13', title: 'Mental health in elite athletes', description: '', proposedDate: '', anticipatedOutcome: '', status: 'Completed', reviews: [] },
    ],
    activities: [
      { id: 'a19', cycleId: '2', activityType: 'Conference Attendance', peerHrs: 0, actionHrs: 8, cpdHrs: 8, completedDate: '2025-07-25', loggedDate: '2025-07-26', journalNotes: 'ASCA conference on sports psychology.' },
      { id: 'a20', cycleId: '2', activityType: 'Peer Consultation', peerHrs: 2, actionHrs: 0, cpdHrs: 2, completedDate: '2025-08-30', loggedDate: '2025-08-31', journalNotes: 'Peer discussion on athlete mental health screening.' },
      { id: 'a21', cycleId: '2', activityType: 'Workshop', peerHrs: 0, actionHrs: 4, cpdHrs: 4, completedDate: '2025-10-12', loggedDate: '2025-10-13', journalNotes: 'Workshop on performance psychology interventions.' },
      { id: 'a22', cycleId: '2', activityType: 'Peer Supervision', peerHrs: 1.5, actionHrs: 0, cpdHrs: 1.5, completedDate: '2025-11-20', loggedDate: '2025-11-21', journalNotes: 'Quarterly peer supervision session.' },
    ],
  },
  {
    id: '9',
    memberName: 'Dr Helen Park',
    memberNumber: 'APS-14050',
    grade: 'Associate Member',
    cpdCycle: '2024–2025 CPD Cycle',
    boardRegistration: 'General',
    aoPEs: ['Clinical Psychology'],
    regDate: '2022-01-10',
    cpdExemption: false,
    termsOfUse: true,
    learningPlanMethod: 'Template',
    requirementsMet: true,
    learningNeeds: [
      { id: 'ln14', title: 'ACT-based interventions', description: '', proposedDate: '', anticipatedOutcome: '', status: 'Completed', reviews: [] },
    ],
    activities: [
      { id: 'a23', cycleId: '2', activityType: 'Online Learning', peerHrs: 0, actionHrs: 6, cpdHrs: 6, completedDate: '2024-10-15', loggedDate: '2024-10-16', journalNotes: 'ACT foundations online course.' },
      { id: 'a24', cycleId: '2', activityType: 'Peer Supervision', peerHrs: 2, actionHrs: 0, cpdHrs: 2, completedDate: '2024-11-20', loggedDate: '2024-11-21', journalNotes: 'Monthly peer supervision.' },
    ],
  },
  {
    id: '10',
    memberName: 'Dr David O\'Connor',
    memberNumber: 'APS-14200',
    grade: 'Fellow',
    cpdCycle: '2025–2026 CPD Cycle',
    boardRegistration: 'General',
    aoPEs: ['Community Psychology'],
    regDate: '2008-03-15',
    cpdExemption: false,
    termsOfUse: true,
    learningPlanMethod: 'Free Text',
    requirementsMet: false,
    learningNeeds: [
      { id: 'ln15', title: 'Community resilience frameworks', description: '', proposedDate: '', anticipatedOutcome: '', status: 'In Progress', reviews: [] },
      { id: 'ln16', title: 'Disaster mental health response', description: '', proposedDate: '', anticipatedOutcome: '', status: 'Not Started', reviews: [] },
    ],
    activities: [
      { id: 'a25', cycleId: '2', activityType: 'Reading/Research', peerHrs: 0, actionHrs: 3, cpdHrs: 3, completedDate: '2025-08-20', loggedDate: '2025-08-22', journalNotes: 'Literature review on community psychology interventions.' },
      { id: 'a26', cycleId: '2', activityType: 'Peer Consultation', peerHrs: 1, actionHrs: 0, cpdHrs: 1, completedDate: '2025-09-10', loggedDate: '2025-09-11', journalNotes: 'Peer consultation on program evaluation methods.' },
    ],
  },
];

// Public export — every persona is padded to 20 learning plans + 20 activities.
export const initialCpdProfiles = applyPadding(rawInitialCpdProfiles);
