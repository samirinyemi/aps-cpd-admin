// Compliance calculation per APS HLBR v2.1 — US-1302, US-1304, US-1305, US-1307.
//
// Variable names (MAP, MAS, MACPD, etc.) map directly to the HLBR glossary on
// lines 2425–2479 so each formula is traceable to the source document.

function minutesOf(a) {
  return Number(a.hours || 0) * 60 + Number(a.minutes || 0);
}

function directContactMinutesOf(a) {
  return Number(a.directContactHours || 0) * 60 + Number(a.directContactMinutes || 0);
}

function hoursRequiredToMinutes(h) {
  return Number(h || 0) * 60;
}

function percent(numMinutes, denMinutes) {
  if (!denMinutes) return 0;
  return Math.round((numMinutes / denMinutes) * 100);
}

export function formatHours(decimalOrMinutes, opts = {}) {
  // Accepts minutes by default; pass { fromDecimalHours: true } for decimal hours input
  const mins = opts.fromDecimalHours ? Math.round(decimalOrMinutes * 60) : Math.round(decimalOrMinutes);
  if (!mins) return '0h';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export function formatPercent(num, den) {
  if (!den) return '0%';
  return `${Math.round((num / den) * 100)}%`;
}

/**
 * Overall compliance percent for a member program against its template.
 * Uses the HLBR US-1304 formula: (MAP + MAS + MACPD) / (MPP + MPS + MPCPD).
 * Returns 0 when inputs are missing.
 */
export function compliancePercent(program, template, cpdActivities = []) {
  const metrics = computeCompliance(program, template, cpdActivities);
  if (!metrics) return 0;
  return metrics.overall.percent;
}

/**
 * Resolve the AoPE template a member program is linked to.
 * Prefers explicit aopeComplianceId, falls back to matching by areaOfPractice.
 */
export function findLinkedTemplate(program, aoPEPrograms = []) {
  if (!program) return null;
  if (program.aopeComplianceId) {
    const byId = aoPEPrograms.find((t) => t.id === program.aopeComplianceId);
    if (byId) return byId;
  }
  return aoPEPrograms.find((t) => t.areaOfPractice === program.areaOfPractice) || null;
}

/**
 * Extract a member's CPD activities from the profiles store.
 * CPD activities are the unified cycle-scoped store on each CPD profile.
 */
export function findMemberCpdActivities(program, cpdProfiles = []) {
  if (!program || !program.memberNumber) return [];
  const profile = cpdProfiles.find((p) => p.memberNumber === program.memberNumber);
  return profile?.activities || [];
}

/**
 * Compute compliance metrics for a member program against its AoPE template.
 * Returns null if either required input is missing. All hour values are expressed
 * as minute totals internally and surfaced via hoursText strings.
 *
 * HLBR variable mapping (all totals in MINUTES internally):
 *   MAP     = Practice minutes (from program.activities)
 *   MADC    = Direct client contact minutes on Practice activities
 *   MAS     = Supervision minutes (from program.activities)
 *   MASI    = Supervision where supervisionType === 'Individual'
 *   MASG    = Supervision where supervisionType === 'Group'
 *   MASP    = Supervision where the allocated supervisor is Primary on this program
 *   MASS    = Supervision where allocated supervisor is Secondary AND supervisor's AoPE matches program's AoPE
 *   MASS_X  = Supervision where allocated supervisor is Secondary AND supervisor's AoPE does NOT match
 *   MACPD   = CPD profile activities where allocation === program.areaOfPractice
 *             (CPD is stored on the member's CPD profile, NOT on the program — unified store)
 *
 * @param cpdActivities optional — member's CPD activities pulled from cpdProfile.
 *                       Pass an empty array (the default) to treat CPD as zero.
 */
export function computeCompliance(program, template, cpdActivities = []) {
  if (!program || !template) return null;

  const activities = program.activities || [];
  const supervisors = program.supervisors || [];

  const supervisorById = new Map(supervisors.map((s) => [s.id, s]));

  // Activity aggregates
  let MAP = 0;
  let MADC = 0;
  let MAS = 0;
  let MASI = 0;
  let MASG = 0;
  let MASP = 0;
  let MASS = 0;
  let MASS_X = 0;
  let MACPD = 0;
  let earliestCpdDate = null;

  for (const a of activities) {
    const m = minutesOf(a);
    if (a.activityType === 'Practice') {
      MAP += m;
      MADC += directContactMinutesOf(a);
    } else if (a.activityType === 'Supervision') {
      MAS += m;
      if (a.supervisionType === 'Individual') MASI += m;
      if (a.supervisionType === 'Group') MASG += m;

      const sup = a.supervisorId ? supervisorById.get(a.supervisorId) : null;
      if (sup) {
        if (sup.supervisionType === 'Primary') {
          MASP += m;
        } else if (sup.supervisionType === 'Secondary') {
          if (sup.supervisorAoPE === program.areaOfPractice) MASS += m;
          else MASS_X += m;
        }
      }
    }
  }

  // CPD: unified store on cpdProfile.activities. Filter to activities allocated
  // to this program's AoPE (HLBR MACPD formula).
  for (const a of cpdActivities) {
    if (a.allocation === program.areaOfPractice) {
      // cpdProfile activity shape uses `cpdHrs` (decimal hours) for duration.
      MACPD += Math.round(Number(a.cpdHrs || 0) * 60);
      if (!earliestCpdDate || (a.completedDate && a.completedDate < earliestCpdDate)) {
        earliestCpdDate = a.completedDate || earliestCpdDate;
      }
    }
  }

  // Required thresholds (template side), converted to minutes
  const MPP = hoursRequiredToMinutes(template.requiredPracticeHours);
  const MPDC = hoursRequiredToMinutes(template.directClientContactHours);
  const MPS = hoursRequiredToMinutes(template.requiredSupervisionHours);
  const MPSP = hoursRequiredToMinutes(template.minPrimaryHours);
  const MPSS = hoursRequiredToMinutes(template.maxSecondaryHours);
  const MPSS_X = hoursRequiredToMinutes(template.maxSecondaryNonAoPEHours);
  const MPSG = hoursRequiredToMinutes(template.maxGroupHours);
  const MPCPD = hoursRequiredToMinutes(template.requiredCPDHours);

  const overallLogged = MAP + MAS + MACPD;
  const overallRequired = MPP + MPS + MPCPD;

  const mkMeet = (logged, required) => ({
    logged,
    required,
    percent: percent(logged, required),
    hoursText: formatHours(logged),
    requiredText: formatHours(required),
  });

  return {
    byActivity: {
      practice: mkMeet(MAP, MPP),
      directContact: mkMeet(MADC, MPDC),
      supervision: {
        ...mkMeet(MAS, MPS),
        individual: { logged: MASI, hoursText: formatHours(MASI) },
        group:      { logged: MASG, hoursText: formatHours(MASG) },
      },
      cpd: { ...mkMeet(MACPD, MPCPD), earliestCpdDate },
    },
    overall: {
      logged: overallLogged,
      required: overallRequired,
      percent: percent(overallLogged, overallRequired),
      hoursText: formatHours(overallLogged),
      requiredText: formatHours(overallRequired),
    },
    supervision: {
      primary: {
        A: percent(MPSP, MPS),
        B: formatHours(MASP),
        C: formatHours(MPSP),
      },
      secondary: {
        A: percent(MPSS, MPS),
        B: formatHours(MASS),
        C: formatHours(MPSS),
      },
      secondaryNon: {
        A: percent(MPSS_X, MPS),
        B: formatHours(MASS_X),
        C: formatHours(MPSS_X),
      },
      group: {
        A: percent(MPSG, MPS),
        B: formatHours(MASG),
        C: formatHours(MPSG),
      },
    },
  };
}
