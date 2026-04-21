import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import LogSessionModal from '../../components/LogSessionModal';
import LogHoursModal from '../../components/LogHoursModal';
import { computeCompliance, findLinkedTemplate, findMemberCpdActivities, formatHours } from '../../lib/compliance';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getMemberName(p) {
  return `${p.member.title} ${p.member.firstName} ${p.member.lastName}`;
}

function Field({ label, value, children }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{children || value}</dd>
    </div>
  );
}

function formatDuration(h, m) {
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
}

// ---------------------------------------------------------------------------
// Compliance Dashboard — HLBR v2.1 §3.5.3 US-1301 through US-1307
// Hybrid: renders a strict HLBR view by default, with a toggle to an
// "improved" view that uses a three-state traffic light, separates caps from
// minimums, shows progress-share percentages, and surfaces the biggest gap.
// ---------------------------------------------------------------------------

// Binary red/green per HLBR US-1306: red if <100%, green if =100%.
function hlbrColour(pct) {
  return pct >= 100 ? 'bg-green-500' : 'bg-red-500';
}

// Three-state traffic light for the improved view.
function trafficLight(pct) {
  if (pct <= 0) return { bar: 'bg-gray-300', label: 'Not started', pill: 'bg-gray-100 text-gray-600 border-gray-200' };
  if (pct >= 100) return { bar: 'bg-green-500', label: 'Complete', pill: 'bg-green-50 text-green-700 border-green-200' };
  return { bar: 'bg-amber-400', label: 'In progress', pill: 'bg-amber-50 text-amber-700 border-amber-200' };
}

// Cap semantics for the improved view: green until exceeded, red when over.
function capState(logged, cap) {
  if (!cap) return { bar: 'bg-gray-300', pct: 0, label: '—', pill: 'bg-gray-100 text-gray-600 border-gray-200' };
  const pct = Math.min(100, Math.round((logged / cap) * 100));
  const over = logged > cap;
  return {
    bar: over ? 'bg-red-500' : 'bg-green-500',
    pct,
    label: over ? 'Cap exceeded' : 'Within cap',
    pill: over
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-green-50 text-green-700 border-green-200',
  };
}

function ProgressBar({ fillClass, pct }) {
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${fillClass} transition-all`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

function MetricCard({ label, logged, required, pct, fillClass, footnote }) {
  return (
    <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{pct}%</p>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        <span className="font-medium text-gray-900">{logged}</span>
        <span> / {required}</span>
      </p>
      <ProgressBar fillClass={fillClass} pct={pct} />
      {footnote && <p className="text-[11px] text-gray-500 mt-2">{footnote}</p>}
    </div>
  );
}

function HlbrView({ metrics }) {
  const { overall, byActivity, supervision } = metrics;

  return (
    <>
      {/* Block 1 — Overall progress (US-1304) */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-sm font-medium text-gray-900">Overall progress</p>
          <p className="text-2xl font-semibold text-gray-900">{overall.percent}%</p>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          {overall.hoursText} logged of {overall.requiredText} required
        </p>
        <ProgressBar fillClass={hlbrColour(overall.percent)} pct={overall.percent} />
      </div>

      {/* Block 2 — Per-activity (US-1302, US-1305) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <MetricCard
          label="Psych Practice"
          logged={byActivity.practice.hoursText}
          required={byActivity.practice.requiredText}
          pct={byActivity.practice.percent}
          fillClass={hlbrColour(byActivity.practice.percent)}
        />
        <MetricCard
          label="Direct Client Contact"
          logged={byActivity.directContact.hoursText}
          required={byActivity.directContact.requiredText}
          pct={byActivity.directContact.percent}
          fillClass={hlbrColour(byActivity.directContact.percent)}
        />
        <MetricCard
          label="Supervision"
          logged={byActivity.supervision.hoursText}
          required={byActivity.supervision.requiredText}
          pct={byActivity.supervision.percent}
          fillClass={hlbrColour(byActivity.supervision.percent)}
          footnote={`Individual: ${byActivity.supervision.individual.hoursText} · Group: ${byActivity.supervision.group.hoursText}`}
        />
        <MetricCard
          label="CPD"
          logged={byActivity.cpd.hoursText}
          required={byActivity.cpd.requiredText}
          pct={byActivity.cpd.percent}
          fillClass={hlbrColour(byActivity.cpd.percent)}
          footnote={byActivity.cpd.earliestCpdDate ? `CPD started ${formatDate(byActivity.cpd.earliestCpdDate)}` : undefined}
        />
      </div>

      {/* Block 4 — Supervision statements (US-1307) — verbatim */}
      <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/60">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Supervision requirements</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            A minimum of <span className="font-medium">{supervision.primary.A}%</span> supervision hours with a primary supervisor.
            You have logged <span className="font-medium">{supervision.primary.B}</span> and your minimum is <span className="font-medium">{supervision.primary.C}</span>.
          </li>
          <li>
            A maximum of <span className="font-medium">{supervision.secondary.A}%</span> supervision hours with a secondary supervisor who holds an AoPE in the same area of practice.
            You have logged <span className="font-medium">{supervision.secondary.B}</span> and your maximum is <span className="font-medium">{supervision.secondary.C}</span>.
          </li>
          <li>
            A maximum of <span className="font-medium">{supervision.secondaryNon.A}%</span> supervision hours with a secondary supervisor who does not hold an AoPE in the same area of practice.
            You have logged <span className="font-medium">{supervision.secondaryNon.B}</span> and your maximum is <span className="font-medium">{supervision.secondaryNon.C}</span>.
          </li>
          <li>
            A maximum of <span className="font-medium">{supervision.group.A}%</span> of group supervision.
            You have logged <span className="font-medium">{supervision.group.B}</span> and your maximum is <span className="font-medium">{supervision.group.C}</span>.
          </li>
        </ul>
      </div>
    </>
  );
}

function ImprovedView({ metrics, program, template }) {
  const { overall, byActivity } = metrics;

  // Pick biggest gap across the four must-meet metrics
  const mustMeets = [
    { key: 'practice', label: 'Psych Practice', pct: byActivity.practice.percent },
    { key: 'directContact', label: 'Direct Client Contact', pct: byActivity.directContact.percent },
    { key: 'supervision', label: 'Supervision', pct: byActivity.supervision.percent },
    { key: 'cpd', label: 'CPD', pct: byActivity.cpd.percent },
  ];
  const biggestGap = [...mustMeets].sort((a, b) => a.pct - b.pct)[0];

  // Supervision sub-metrics: minimum (primary) + three caps
  const MASP_minutes = minutesFromHoursText(metrics.supervision.primary.B);
  const MPSP_minutes = minutesFromHoursText(metrics.supervision.primary.C);
  const MASS_minutes = minutesFromHoursText(metrics.supervision.secondary.B);
  const MPSS_minutes = minutesFromHoursText(metrics.supervision.secondary.C);
  const MASS_X_minutes = minutesFromHoursText(metrics.supervision.secondaryNon.B);
  const MPSS_X_minutes = minutesFromHoursText(metrics.supervision.secondaryNon.C);
  const MASG_minutes = minutesFromHoursText(metrics.supervision.group.B);
  const MPSG_minutes = minutesFromHoursText(metrics.supervision.group.C);

  const primaryPct = MPSP_minutes > 0 ? Math.round((MASP_minutes / MPSP_minutes) * 100) : 0;
  const primaryLight = trafficLight(primaryPct);
  const secondaryCap = capState(MASS_minutes, MPSS_minutes);
  const secondaryNonCap = capState(MASS_X_minutes, MPSS_X_minutes);
  const groupCap = capState(MASG_minutes, MPSG_minutes);

  const overallLight = trafficLight(overall.percent);

  return (
    <>
      {/* Focus banner */}
      {biggestGap && biggestGap.pct < 100 && (
        <div className="mb-5 border border-aps-blue/20 bg-aps-blue-light/40 rounded-lg p-3 flex items-start gap-2">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v5M10 14h.01" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900">Focus: {biggestGap.label}</p>
            <p className="text-xs text-gray-600 mt-0.5">
              This is your biggest gap — currently at {biggestGap.pct}%. Log more {biggestGap.label.toLowerCase()} hours to move toward compliance.
            </p>
          </div>
        </div>
      )}

      {/* Overall card with traffic-light */}
      <div className="mb-5 bg-gray-50/60 border border-gray-100 rounded-lg p-5">
        <div className="flex items-baseline justify-between mb-1">
          <div>
            <p className="text-sm text-gray-500">Overall progress</p>
            <p className="text-3xl font-semibold text-gray-900 mt-0.5">{overall.percent}%</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${overallLight.pill}`}>
            {overallLight.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2 mb-2">
          {overall.hoursText} logged of {overall.requiredText} total
        </p>
        <ProgressBar fillClass={overallLight.bar} pct={overall.percent} />
      </div>

      {/* Must-meet metrics */}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Required hours</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {[
          { key: 'practice', label: 'Psych Practice', data: byActivity.practice },
          { key: 'directContact', label: 'Direct Client Contact', data: byActivity.directContact },
          { key: 'supervision', label: 'Supervision', data: byActivity.supervision,
            footnote: `Individual ${byActivity.supervision.individual.hoursText} · Group ${byActivity.supervision.group.hoursText}` },
          { key: 'cpd', label: 'CPD', data: byActivity.cpd,
            footnote: byActivity.cpd.earliestCpdDate ? `Started ${formatDate(byActivity.cpd.earliestCpdDate)}` : undefined },
        ].map(({ key, label, data, footnote }) => {
          const light = trafficLight(data.percent);
          return (
            <div key={key} className="bg-gray-50/60 border border-gray-100 rounded-lg p-4">
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium border ${light.pill}`}>
                  {light.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2 text-xs text-gray-600">
                <span><span className="font-medium text-gray-900">{data.hoursText}</span> / {data.requiredText}</span>
                <span className="font-medium text-gray-900">{data.percent}%</span>
              </div>
              <ProgressBar fillClass={light.bar} pct={data.percent} />
              {footnote && <p className="text-[11px] text-gray-500 mt-2">{footnote}</p>}
            </div>
          );
        })}
      </div>

      {/* Supervision breakdown — minimum first, then caps */}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Supervision breakdown</p>
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        {/* Primary — minimum */}
        <div className="p-4 bg-gray-50/60">
          <div className="flex items-baseline justify-between mb-1.5">
            <p className="text-sm font-medium text-gray-900">Primary supervisor <span className="text-gray-400 font-normal">· minimum</span></p>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium border ${primaryLight.pill}`}>
              {primaryLight.label}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2 text-xs text-gray-600">
            <span><span className="font-medium text-gray-900">{metrics.supervision.primary.B}</span> logged / {metrics.supervision.primary.C} minimum</span>
            <span className="font-medium text-gray-900">{primaryPct}%</span>
          </div>
          <ProgressBar fillClass={primaryLight.bar} pct={primaryPct} />
        </div>
        {/* Caps */}
        {[
          { label: 'Secondary (same AoPE)', state: secondaryCap, logged: metrics.supervision.secondary.B, max: metrics.supervision.secondary.C },
          { label: 'Secondary (different AoPE)', state: secondaryNonCap, logged: metrics.supervision.secondaryNon.B, max: metrics.supervision.secondaryNon.C },
          { label: 'Group supervision', state: groupCap, logged: metrics.supervision.group.B, max: metrics.supervision.group.C },
        ].map((row) => (
          <div key={row.label} className="p-4 border-t border-gray-100">
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-sm font-medium text-gray-900">{row.label} <span className="text-gray-400 font-normal">· cap</span></p>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium border ${row.state.pill}`}>
                {row.state.label}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              <span className="font-medium text-gray-900">{row.logged}</span> of {row.max} maximum
            </p>
            <ProgressBar fillClass={row.state.bar} pct={row.state.pct} />
          </div>
        ))}
      </div>
    </>
  );
}

// Utility — parse "Xh Ym" or "Xh" or "Ym" back to minutes (for the improved view's cap math)
function minutesFromHoursText(text) {
  if (!text) return 0;
  let total = 0;
  const hMatch = text.match(/(\d+)h/);
  const mMatch = text.match(/(\d+)m/);
  if (hMatch) total += Number(hMatch[1]) * 60;
  if (mMatch) total += Number(mMatch[1]);
  return total;
}

function ComplianceDashboard({ program, aoPEPrograms, cpdProfiles }) {
  const [viewMode, setViewMode] = useState('hlbr'); // 'hlbr' (default) | 'improved'

  const template = findLinkedTemplate(program, aoPEPrograms);
  const memberCpdActivities = findMemberCpdActivities(program, cpdProfiles);

  // US-1301: only show dashboard if program status is Open.
  if (program.status !== 'Open') {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Compliance Progress</h2>
        <p className="text-sm text-gray-500 mb-4">
          Program status is {program.status}. The compliance dashboard is available while the program is Open.
        </p>
        <button
          type="button"
          disabled
          className="px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-md cursor-not-allowed"
          title="Report generation not implemented in this prototype"
        >
          Generate Registrar Logging report
        </button>
      </section>
    );
  }

  if (!template) {
    return (
      <section className="bg-white border border-dashed border-gray-300 rounded-lg p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Compliance Progress</h2>
        <p className="text-sm text-gray-500">
          This registrar program is not linked to an AoPE compliance program, so compliance hours can't be calculated.
          <span className="block text-xs text-gray-400 mt-1">
            Edit the program and select an AoPE to enable this view.
          </span>
        </p>
      </section>
    );
  }

  const metrics = computeCompliance(program, template, memberCpdActivities);
  if (!metrics) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-baseline justify-between mb-1 gap-3 flex-wrap">
        <h2 className="text-base font-semibold text-gray-900">Compliance Progress</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Template: {template.name}</span>
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden ml-2">
            <button
              onClick={() => setViewMode('hlbr')}
              title="View aligned to HLBR v2.1 specification"
              className={`px-2.5 py-1 text-[11px] font-medium ${
                viewMode === 'hlbr' ? 'bg-aps-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              HLBR
            </button>
            <button
              onClick={() => setViewMode('improved')}
              title="Improved view: 3-state traffic light, caps vs minimums, focus gap"
              className={`px-2.5 py-1 text-[11px] font-medium border-l border-gray-300 ${
                viewMode === 'improved' ? 'bg-aps-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Improved
            </button>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Logged hours vs required hours under <span className="font-medium text-gray-700">{template.areaOfPractice}</span>.
      </p>

      {viewMode === 'hlbr'
        ? <HlbrView metrics={metrics} />
        : <ImprovedView metrics={metrics} program={program} template={template} />}
    </section>
  );
}

export default function ProgramDetail({ programs, setPrograms, supervisors, practiceLocations, aoPEPrograms = [], cpdProfiles = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, member } = useAuth();
  const isMemberRole = role === 'Member';
  const program = programs.find((p) => p.id === id);

  // Member access guard: members may only view their own programs.
  if (isMemberRole && program && program.memberNumber !== member?.memberNumber) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">This registrar program belongs to another member.</p>
          <Link to="/member/registrar" className="text-aps-blue hover:underline text-sm">
            Back to My Registrar Programs
          </Link>
        </div>
      </PageShell>
    );
  }

  const listPath = isMemberRole ? '/member/registrar' : '/admin/registrar/programs';
  const listLabel = isMemberRole ? 'My Registrar Programs' : 'Registrar Programs';
  const editPath = isMemberRole
    ? `/member/registrar/${id}/edit`
    : `/admin/registrar/programs/${id}/edit`;

  const [logSession, setLogSession] = useState({ open: false, supervisor: null });
  const [logHours, setLogHours] = useState({ open: false, location: null });
  const [dialog, setDialog] = useState({ open: false });

  function handleLogSession(programId, activity) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, activities: [...(p.activities || []), activity] } : p))
    );
    setLogSession({ open: false, supervisor: null });
  }

  function handleLogHours(programId, activity) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, activities: [...(p.activities || []), activity] } : p))
    );
    setLogHours({ open: false, location: null });
  }


  function openSupervisorLog(supervisorId) {
    const cat = (supervisors || []).find((s) => s.id === supervisorId);
    const fallback = program.supervisors.find((s) => s.id === supervisorId);
    const subject = cat || (fallback && { ...fallback, assignedPrograms: [{ programId: program.id, supervisionType: fallback.supervisionType }] });
    setLogSession({ open: true, supervisor: subject });
  }

  function openLocationLog(placeId) {
    const cat = (practiceLocations || []).find((l) => l.id === placeId);
    const fallback = program.placesOfPractice.find((p) => p.id === placeId);
    const subject = cat || (fallback && { ...fallback, assignedPrograms: [{ programId: program.id }] });
    setLogHours({ open: true, location: subject });
  }

  if (!program) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Program not found.</p>
          <Link to={listPath} className="text-aps-blue hover:underline text-sm">
            Back to {listLabel}
          </Link>
        </div>
      </PageShell>
    );
  }

  const isReadOnly = program.status === 'Closed';

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link to={listPath} className="text-aps-blue hover:underline">
              {listLabel}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{getMemberName(program)}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{getMemberName(program)}</h1>
          <p className="text-sm text-gray-500 mt-1">{program.areaOfPractice}</p>
          <div className="mt-2">
            <StatusBadge status={program.status} />
          </div>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => navigate(editPath)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit Program
          </button>
        )}
      </div>

      {/* US-1202: Closed-program restricted actions for Members */}
      {isMemberRole && isReadOnly && (
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#6b7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <rect x="3" y="5" width="14" height="12" rx="2" />
              <path d="M7 5V3a2 2 0 014 0v2M3 10h14" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">This registrar program is Closed</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Logging and editing are disabled. You can generate a report of everything you logged, or begin a new registrar program in a different area of practice.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  disabled
                  title="Report generation not implemented in this prototype"
                  className="px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-200 rounded-md cursor-not-allowed"
                >
                  Generate Registrar Logging report
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/member/registrar/new')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
                >
                  Begin new registrar program
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Member Information */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Member Information</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8">
          <Field label="Member Name" value={getMemberName(program)} />
          <Field label="Member Number" value={program.memberNumber} />
          <Field label="Member Grade" value={program.memberGrade} />
        </dl>
      </section>

      {/* Program Details */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Program Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <Field label="Area of Practice" value={program.areaOfPractice} />
          <Field label="Qualification" value={program.qualification} />
          <Field label="Date of Commencement" value={formatDate(program.commencementDate)} />
          <Field label="Status" >
            <StatusBadge status={program.status} />
          </Field>
          <Field label="Currently holds AoPE with PsyBA?">
            <StatusBadge status={program.holdsAoPE ? 'Yes' : 'No'} />
          </Field>
          <Field label="Qualification accredited for two areas?">
            <StatusBadge status={program.dualQualification ? 'Yes' : 'No'} />
          </Field>
        </dl>
      </section>

      {/* Compliance Dashboard — HLBR US-1301..1307 */}
      <ComplianceDashboard program={program} aoPEPrograms={aoPEPrograms} cpdProfiles={cpdProfiles} />

      {/* Supervisors */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Supervisors
          <span className="text-sm font-normal text-gray-400 ml-2">({program.supervisors.length})</span>
        </h2>
        {program.supervisors.length === 0 ? (
          <p className="text-sm text-gray-400">No supervisors assigned.</p>
        ) : (
          <div className="space-y-3">
            {program.supervisors.map((s) => (
              <div key={s.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {s.title} {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      AHPRA: {s.ahpraNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.supervisionType === 'Primary'
                        ? 'bg-aps-blue/10 text-aps-blue'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.supervisionType}
                    </span>
                    {!isReadOnly && (
                      <button
                        onClick={() => openSupervisorLog(s.id)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark"
                      >
                        Log session
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">AoPE: {s.supervisorAoPE}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Places of Practice */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Places of Practice
          <span className="text-sm font-normal text-gray-400 ml-2">({program.placesOfPractice.length})</span>
        </h2>
        {program.placesOfPractice.length === 0 ? (
          <p className="text-sm text-gray-400">No places of practice recorded.</p>
        ) : (
          <div className="space-y-3">
            {program.placesOfPractice.map((p) => (
              <div key={p.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.employerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.positionTitle}</p>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => openLocationLog(p.id)}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark shrink-0 ml-3"
                    >
                      Log hours
                    </button>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                  <p>{p.addressLine1}{p.addressLine2 ? `, ${p.addressLine2}` : ''}</p>
                  <p>{p.suburb} {p.state} {p.postcode}</p>
                  {(p.phone || p.email) && (
                    <p className="mt-1">{p.phone}{p.phone && p.email ? ' · ' : ''}{p.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Activities */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Activities
            <span className="text-sm font-normal text-gray-400 ml-2">({(program.activities || []).length})</span>
          </h2>
          {!isReadOnly && isMemberRole && (
            <button
              onClick={() => navigate('/member/cpd')}
              title="Log CPD activities on your CPD dashboard; CPD logged against this AoPE counts toward compliance."
              className="px-2.5 py-1 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark"
            >
              Log CPD (via My CPD) →
            </button>
          )}
        </div>
        {(program.activities || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No activities logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Supervisor / Place</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Supervision Type</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Duration</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Direct Contact</th>
                </tr>
              </thead>
              <tbody>
                {[...(program.activities || [])].sort((a, b) => b.completionDate.localeCompare(a.completionDate)).map((a) => (
                  <tr key={a.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">{formatDate(a.completionDate)}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.activityType === 'Supervision' ? 'bg-aps-blue/10 text-aps-blue'
                          : a.activityType === 'Practice' ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {a.activityType}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{a.supervisorName || a.employerName || '—'}</td>
                    <td className="py-3 pr-4">{a.supervisionType || '—'}</td>
                    <td className="py-3 pr-4">{formatDuration(a.hours, a.minutes)}</td>
                    <td className="py-3 pr-4">
                      {a.activityType === 'Practice' ? formatDuration(a.directContactHours, a.directContactMinutes) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <LogSessionModal
        open={logSession.open}
        supervisor={logSession.supervisor}
        programs={programs}
        lockedProgramId={program.id}
        onSave={handleLogSession}
        onCancel={() => setLogSession({ open: false, supervisor: null })}
      />
      <LogHoursModal
        open={logHours.open}
        location={logHours.location}
        programs={programs}
        lockedProgramId={program.id}
        onSave={handleLogHours}
        onCancel={() => setLogHours({ open: false, location: null })}
      />
      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog({ open: false })}
      />
    </PageShell>
  );
}
