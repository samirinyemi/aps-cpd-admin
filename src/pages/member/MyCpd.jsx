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

function fmtH(decimalHours) {
  return formatHours(decimalHours, { fromDecimalHours: true });
}

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
      className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-aps-blue/50 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-aps-blue-light flex items-center justify-center shrink-0">
          <Icon size={16} strokeWidth={1.75} className="text-aps-blue" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <ChevronRight size={16} strokeWidth={2} className="text-gray-400 shrink-0 group-hover:text-aps-blue transition-colors" />
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

  // ── Derived values for the progress cards ──────────────────────────────────
  const learningNeeds = cycleProfile?.learningNeeds || [];
  const totalNeeds    = learningNeeds.length;
  const doneNeeds     = learningNeeds.filter((n) => n.status === 'Completed' || n.status === 'Closed').length;
  const needsPct      = totalNeeds > 0 ? Math.round((doneNeeds / totalNeeds) * 100) : 0;
  const activitiesCount = (cycleProfile?.activities || []).length;

  const basePct = metrics && metrics.baseMin.required > 0
    ? Math.round((metrics.baseMin.logged / metrics.baseMin.required) * 100)
    : 0;

  const hasAnyRegistrar = myPrograms.length > 0;

  return (
    <PageShell>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
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

      {/* US-807: CPD Exemption alert */}
      {hasExemption && (
        <div className="mb-5 border border-amber-200 bg-amber-50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-medium text-amber-900">CPD Exemption is active for this cycle</p>
            <p className="text-xs text-amber-800 mt-0.5">
              Your CPD requirements are waived. Metrics below show progress against standard hours.
            </p>
          </div>
        </div>
      )}

      {/* ── CPD Cycle Progress card ─────────────────────────────────────────── */}
      {metrics && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <RefreshCw size={16} strokeWidth={1.75} className="text-aps-blue" />
            <h2 className="text-base font-bold text-gray-900">
              CPD Cycle Progress: {selectedCycle?.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:divide-x sm:divide-blue-200">
            {/* Total Hours — US-502 */}
            <div className="sm:pr-5">
              <p className="text-sm text-gray-600 mb-3">Total Hours</p>
              <div className="flex items-center gap-3">
                <ProgressBar pct={basePct} exempt={hasExemption} />
                <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  {fmtH(metrics.baseMin.logged)} / {fmtH(metrics.baseMin.required)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                {hasExemption ? 'Standard required hours' : 'Hours logged vs required'}
              </p>
            </div>

            {/* Learning Needs — US-501 */}
            <div className="sm:px-5">
              <p className="text-sm text-gray-600 mb-3">Learning Plan</p>
              {totalNeeds > 0 ? (
                <>
                  <div className="flex items-center gap-3">
                    <ProgressBar pct={needsPct} exempt={false} />
                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {doneNeeds}/{totalNeeds}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    needs met
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-gray-400">Not started</p>
              )}
            </div>

            {/* Activities Logged — US-504 */}
            <div className="sm:pl-5">
              <p className="text-sm text-gray-600 mb-2">Activities Logged</p>
              <p className="text-3xl font-bold text-gray-900">{activitiesCount}</p>
              <p className="text-[11px] text-gray-500 mt-1.5">
                Active hours: {fmtH(metrics.activeHours.logged)}
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">{pct}%</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                        hasExemption ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : row.met ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {hasExemption ? 'Exempt' : row.met ? 'Met' : 'Not met'}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-blue-200 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${hasExemption ? 'bg-gray-400' : 'bg-[#185FA5]'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{fmtH(row.logged)} logged</span>
                    <span>{fmtH(row.required)} required</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CPD Activities — US-503/802/803 ──────────────────────────────────── */}
      {metrics && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-5">
          <h2 className="text-base font-bold text-gray-900 mb-5">CPD Activities</h2>
          <div className="space-y-5">
            {[
              { label: 'Peer Consultation', logged: metrics.peerConsultation.logged, required: metrics.peerConsultation.required, met: metrics.peerConsultation.met },
              { label: 'Active CPD',        logged: metrics.activeCpd.logged,        required: metrics.activeCpd.required,        met: metrics.activeCpd.met },
              { label: 'Other CPD',         logged: metrics.otherCpd.logged,         required: metrics.otherCpd.required,         met: metrics.otherCpd.met },
            ].map(({ label, logged, required, met }) => {
              const pct = required > 0 ? Math.round((logged / required) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-900">{label}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">{pct}%</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                        hasExemption
                          ? 'bg-gray-100 text-gray-600 border-gray-200'
                          : met
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {hasExemption ? 'Exempt' : met ? 'Met' : 'Not met'}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-blue-200 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${hasExemption ? 'bg-gray-400' : 'bg-[#185FA5]'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{fmtH(logged)} logged</span>
                    <span>{fmtH(required)} required</span>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* ── Navigation cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <NavCard
          to="/member/cpd/profile"
          icon={User}
          title="Manage Profile"
          description="Update your personal details and preferences"
        />
        <NavCard
          to="/member/cpd/learning-plan"
          icon={ClipboardList}
          title="Learning Plan"
          description="Manage learning needs and submit reviews"
        />
        <NavCard
          to="/member/cpd/activities"
          icon={TrendingUp}
          title="Activities"
          description="Record, view, and edit your CPD activities"
        />
        <NavCard
          to="/member/cpd/report"
          icon={BarChart2}
          title="Reports"
          description="Generate progress and compliance reports"
        />
      </div>

      {/* ── Linked registrar programs ─────────────────────────────────────────── */}
      {hasAnyRegistrar && (
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              My Registrar Programs
              <span className="text-sm font-normal text-gray-400 ml-2">({myPrograms.length})</span>
            </h2>
            <Link to="/member/registrar" className="text-xs font-medium text-aps-blue hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myPrograms.map((p) => {
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
