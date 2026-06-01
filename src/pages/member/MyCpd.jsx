import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, BookOpen, RefreshCw, User,
  TrendingUp, BarChart2, ChevronRight, ClipboardList,
} from 'lucide-react';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import LogCpdActivityModal from '../../components/LogCpdActivityModal';
import { useAuth } from '../../context/AuthContext';
import { useSelectedCycle } from '../../context/CycleContext';
import { compliancePercent, findLinkedTemplate, computeCpdCycleMetrics, formatHours } from '../../lib/compliance';

// HLBR §3.4.4 CPD Summary — US-500 through US-506, plus US-803/805/806/807.

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, exempt }) {
  const fill = exempt ? 'bg-gray-400' : 'bg-[#185FA5]';
  return (
    <div className="flex-1 h-2.5 bg-blue-200 rounded-full overflow-hidden">
      <div className={`h-full ${fill} rounded-full transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

// ── Navigation card ───────────────────────────────────────────────────────────
function NavCard({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 hover:border-aps-blue/50 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-aps-blue-light flex items-center justify-center shrink-0">
          <Icon size={16} strokeWidth={1.75} className="text-aps-blue" />
        </div>
        <ChevronRight size={14} strokeWidth={2} className="text-gray-300 group-hover:text-aps-blue transition-colors" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{description}</p>
      </div>
    </Link>
  );
}

export default function MyCpd({ cpdProfiles, setCpdProfiles, programs, aoPEPrograms }) {
  const { member } = useAuth();
  const { selectedCycle } = useSelectedCycle();

  const memberProfile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  const cycleProfile = useMemo(
    () => memberProfile?.cycleProfiles?.find((cp) => cp.cycleId === selectedCycle?.id) || null,
    [memberProfile, selectedCycle]
  );

  const myPrograms = useMemo(
    () => (programs || []).filter((p) => p.memberNumber === member?.memberNumber),
    [programs, member]
  );

  const isCycleOpen = selectedCycle?.status === 'Open';
  const hasExemption = Boolean(cycleProfile?.cpdExemption);

  // US-500: board registration eligibility check
  const ELIGIBLE_BOARD_REG = ['General', 'Not Registered'];
  const boardRegEligible = ELIGIBLE_BOARD_REG.includes(memberProfile?.boardRegistration || '');

  const metrics = useMemo(
    () => cycleProfile && selectedCycle
      ? computeCpdCycleMetrics({ ...memberProfile, ...cycleProfile }, selectedCycle)
      : null,
    [memberProfile, cycleProfile, selectedCycle]
  );

  const [logOpen, setLogOpen] = useState(false);

  function persistCycleProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.id === memberProfile.id
          ? {
              ...p,
              cycleProfiles: (p.cycleProfiles || []).map((cp) =>
                cp.id === cycleProfile.id ? { ...cp, ...patch } : cp
              ),
            }
          : p
      )
    );
  }

  function handleLogActivity(activity) {
    persistCycleProfile({ activities: [...(cycleProfile?.activities || []), activity] });
    setLogOpen(false);
  }

  function handleStartCycle() {
    if (!memberProfile || !selectedCycle) return;
    const newCp = {
      id: `cp-${memberProfile.id}-${selectedCycle.id}-${Date.now()}`,
      cycleId: selectedCycle.id,
      cpdCycle: selectedCycle.name,
      cpdExemption: false,
      termsOfUse: false,
      requirementsMet: false,
      learningPlanMethod: 'PD Tool',
      learningPlanReviews: [],
      learningNeeds: [],
      activities: [],
    };
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.id === memberProfile.id
          ? { ...p, cycleProfiles: [...(p.cycleProfiles || []), newCp] }
          : p
      )
    );
  }

  if (!member) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500">Not logged in as a member.</p>
          <Link to="/login" className="text-aps-blue hover:underline text-sm mt-3 inline-block">Return to login</Link>
        </div>
      </PageShell>
    );
  }

  if (!memberProfile) {
    return (
      <PageShell>
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <BookOpen size={26} strokeWidth={1.5} className="text-gray-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No member profile found</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">No CPD profile exists for this account.</p>
        </div>
      </PageShell>
    );
  }

  if (!cycleProfile && selectedCycle) {
    if (selectedCycle.status === 'Closed') {
      return (
        <PageShell>
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <BookOpen size={26} strokeWidth={1.5} className="text-gray-400" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No records found for {selectedCycle.name}</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">No CPD records were found for this cycle.</p>
          </div>
        </PageShell>
      );
    }
    const isPending = selectedCycle.status === 'Pending';
    return (
      <PageShell>
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className={`w-14 h-14 rounded-full ${isPending ? 'bg-gray-100' : 'bg-aps-blue-light'} flex items-center justify-center`}>
              <BookOpen size={26} strokeWidth={1.5} className={isPending ? 'text-gray-400' : 'text-aps-blue'} />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {isPending ? `Set up your CPD for ${selectedCycle.name}` : `Start your CPD for ${selectedCycle.name}`}
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {isPending
              ? "This cycle hasn't opened yet, but you can set up your profile and learning plan ahead of time."
              : "You don't have a CPD profile for this cycle yet. Create one to begin logging your professional development."}
          </p>
          <button type="button" onClick={handleStartCycle}
            className="px-5 py-2.5 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
            {isPending ? `Set up my CPD for ${selectedCycle.name}` : `Start my CPD for ${selectedCycle.name}`}
          </button>
        </div>
      </PageShell>
    );
  }

  // US-500: if board registration is not General or Not Registered, redirect to Manage Profile
  if (cycleProfile && !boardRegEligible) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} strokeWidth={1.75} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile update required</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your board registration is currently <span className="font-medium text-gray-700">{memberProfile.boardRegistration}</span>.
            To access the CPD dashboard you need to update your profile with your current registration details.
          </p>
          <Link
            to="/member/cpd/profile"
            className="px-5 py-2.5 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark inline-block"
          >
            Go to Manage Profile
          </Link>
        </div>
      </PageShell>
    );
  }

  // ── Derived values for the progress cards ──────────────────────────────────
  const learningNeeds = cycleProfile?.learningNeeds || [];
  const totalNeeds    = learningNeeds.length;
  const doneNeeds     = learningNeeds.filter((n) => n.status === 'Closed').length;
  const needsPct      = totalNeeds > 0 ? Math.round((doneNeeds / totalNeeds) * 100) : 0;
  const activitiesCount = (cycleProfile?.activities || []).length;

  const basePct = metrics && metrics.baseMin.required > 0
    ? Math.round((metrics.baseMin.logged / metrics.baseMin.required) * 100)
    : 0;

  const peerPct = metrics && metrics.activeCpd.required > 0
    ? Math.round((metrics.activeCpd.logged / metrics.activeCpd.required) * 100)
    : 0;

  // Helper: decimal hours → "Xh Ym" display (US-502/503/504/505 all require minute precision)
  const fmtH = (h) => formatHours(h, { fromDecimalHours: true });

  const hasAnyRegistrar = myPrograms.length > 0;

  return (
    <PageShell>
      {/* Page header */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">CPD Summary</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {member.firstName}.</p>
        </div>
        {isCycleOpen && (
          <button type="button" onClick={() => setLogOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark shrink-0">
            Log CPD activity
          </button>
        )}
      </div>

      {/* ── Navigation cards — 2×2 grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <NavCard to="/member/cpd/profile"       icon={User}          title="Manage Profile"  description="Update your personal details and preferences" />
        <NavCard to="/member/cpd/learning-plan" icon={ClipboardList} title="Learning Plan"   description="Manage learning needs and submit reviews" />
        <NavCard to="/member/cpd/activities"    icon={TrendingUp}    title="Activities"      description="Record, view, and edit your CPD activities" />
        <NavCard to="/member/cpd/report"        icon={BarChart2}     title="Reports"         description="Generate progress and compliance reports" />
      </div>

      {/* US-405: CPD Exemption alert — exact spec wording required */}
      {hasExemption && (
        <div className="mb-5 border border-amber-200 bg-amber-50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">CPD exemption/reduced requirements</p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              You have indicated that your individual CPD requirements have been reduced by the
              PsyBA/AHPRA for this cycle. This system can only track progress to standard
              requirements, so you will therefore need to personally monitor your progress towards
              meeting these reduced CPD hours as you log your CPD. Change settings in your{' '}
              <Link to="/member/cpd/profile" className="underline font-medium hover:text-amber-900">
                Profile
              </Link>.
            </p>
          </div>
        </div>
      )}

      {/* ── CPD Cycle Progress — US-502 / US-503 / US-504 / US-501 ────────────── */}
      {metrics && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <RefreshCw size={16} strokeWidth={1.75} className="text-aps-blue" />
            <h2 className="text-base font-bold text-gray-900">
              CPD Cycle Progress — {selectedCycle?.name}
            </h2>
          </div>

          <div className="space-y-5 divide-y divide-blue-200">
            {/* CPD (Total) — US-502 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800">CPD</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                  hasExemption ? 'bg-gray-100 text-gray-600 border-gray-200'
                  : metrics.baseMin.met ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {hasExemption ? 'Exempt' : metrics.baseMin.met ? 'Met' : 'Not met'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ProgressBar pct={basePct} exempt={hasExemption} />
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  {fmtH(metrics.baseMin.logged)} / {fmtH(metrics.baseMin.required)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                {hasExemption ? 'vs Standard Required Hours' : 'Hours logged vs required'}
              </p>
            </div>

            {/* Peer Consultation — US-503 */}
            <div className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800">Peer Consultation</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                  hasExemption ? 'bg-gray-100 text-gray-600 border-gray-200'
                  : metrics.activeCpd.met ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {hasExemption ? 'Exempt' : metrics.activeCpd.met ? 'Met' : 'Not met'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ProgressBar pct={peerPct} exempt={hasExemption} />
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  {fmtH(metrics.activeCpd.logged)} / {fmtH(metrics.activeCpd.required)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                {hasExemption ? 'vs Standard Required Hours' : 'Hours logged vs required'}
              </p>
            </div>

            {/* Active CPD — US-504 (total active hours; no compliance minimum per spec) */}
            <div className="pt-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Active CPD</p>
                <span className="text-sm font-bold text-gray-900">
                  {fmtH(metrics.activeHours.logged)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">Total active CPD hours logged this cycle</p>
            </div>

            {/* Learning Plan — US-501 */}
            <div className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800">Learning Plan</p>
                {(() => {
                  const s = metrics.learningPlanStatus;
                  const badge =
                    s === 'Reviewed'
                      ? { label: 'Met',         cls: 'bg-green-50 text-green-700 border-green-200' }
                      : s === 'Developed'
                      ? { label: 'In progress', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
                      : s === 'Offline'
                      ? { label: 'Offline',     cls: 'bg-gray-100 text-gray-600 border-gray-200' }
                      : { label: 'Not met',     cls: 'bg-red-50 text-red-700 border-red-200' };
                  return (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-[11px] text-gray-500">
                {metrics.learningPlanStatus === 'Not Started' && 'No learning needs recorded yet.'}
                {metrics.learningPlanStatus === 'Developed'   && `${totalNeeds} need${totalNeeds !== 1 ? 's' : ''} recorded — review pending.`}
                {metrics.learningPlanStatus === 'Reviewed'    && 'Your plan has been reviewed this cycle.'}
                {metrics.learningPlanStatus === 'Offline'     && 'Documenting your plan offline.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Area of Practice (PsyBA Endorsements) — US-505 ───────────── */}
      {metrics && metrics.perAoPE.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-5">
          <h2 className="text-base font-bold text-gray-900 mb-5">Active Area of Practice</h2>
          <div className="space-y-5">
            {metrics.perAoPE.map((row) => {
              const pct = row.required > 0
                ? Math.round((row.logged / row.required) * 100)
                : 0;
              return (
                <div key={row.aoPE}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-900">{row.aoPE}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                      hasExemption
                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : row.met
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {hasExemption ? 'Exempt' : row.met ? 'Met' : 'Not met'}
                    </span>
                  </div>
                  <div className="h-3 bg-blue-200 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        hasExemption ? 'bg-gray-400' : 'bg-[#185FA5]'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{fmtH(row.logged)} logged</span>
                    <span>
                      {fmtH(row.required)} ({hasExemption ? 'Standard Required Hours' : 'Minimum hours required'})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other CPD contributes to CPD total — no separate dashboard metric per spec */}

      {/* ── Linked registrar programs — show max 2 ───────────────────────────── */}
      {hasAnyRegistrar && (
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              My Registrar Programs
              <span className="text-sm font-normal text-gray-400 ml-2">({myPrograms.length})</span>
            </h2>
            {myPrograms.length > 2 && (
              <Link to="/member/registrar" className="text-xs font-medium text-aps-blue hover:underline">
                View all {myPrograms.length} →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myPrograms.slice(0, 2).map((p) => {
              const template = findLinkedTemplate(p, aoPEPrograms || []);
              const pct = template ? compliancePercent(p, template, cycleProfile?.activities || []) : 0;
              const barColour = pct >= 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-gray-300';
              return (
                <Link key={p.id} to={`/member/registrar/${p.id}`}
                  className="block bg-gray-50 border border-gray-100 rounded-lg p-4 hover:border-aps-blue/40 hover:bg-white transition">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.areaOfPractice}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Commenced {formatDate(p.commencementDate)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-gray-600 mb-1.5">
                    <span>Compliance</span>
                    <span className="font-medium text-gray-900">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${barColour}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
          {myPrograms.length > 2 && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <Link to="/member/registrar" className="text-sm font-medium text-aps-blue hover:underline">
                View all {myPrograms.length} registrar programs →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Log CPD activity modal */}
      {selectedCycle && isCycleOpen && (
        <LogCpdActivityModal
          open={logOpen}
          cycle={selectedCycle}
          allocationOptions={(memberProfile?.aoPEs || []).map((a) => ({ value: a, label: a }))}
          onSave={handleLogActivity}
          onCancel={() => setLogOpen(false)}
        />
      )}
    </PageShell>
  );
}
