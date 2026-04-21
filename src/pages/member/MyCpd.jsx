import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import LogCpdActivityModal from '../../components/LogCpdActivityModal';
import SelectField from '../../components/SelectField';
import { useAuth } from '../../context/AuthContext';
import { compliancePercent, findLinkedTemplate, computeCpdCycleMetrics } from '../../lib/compliance';

// HLBR §3.4.4 CPD Summary — US-500 through US-506, plus US-803/805/806/807.

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function MetricCard({ label, logged, required, met, exempt, suffix = 'h', description }) {
  const pct = required > 0 ? Math.min(100, Math.round((logged / required) * 100)) : 0;
  const barColour = exempt
    ? 'bg-gray-300'
    : met
      ? 'bg-green-500'
      : pct > 0 ? 'bg-amber-400' : 'bg-gray-300';
  const badgeClass = exempt
    ? 'bg-gray-100 text-gray-600 border-gray-200'
    : met
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  const badgeLabel = exempt ? 'Exempt' : met ? 'Met' : 'Not met';
  return (
    <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium border ${badgeClass}`}>{badgeLabel}</span>
      </div>
      <p className="text-xs text-gray-600 mb-2">
        <span className="font-medium text-gray-900">{logged}{suffix}</span>
        {required != null && <span> / {required}{suffix} {exempt ? 'standard required' : 'required'}</span>}
      </p>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColour}`} style={{ width: `${pct}%` }} />
      </div>
      {description && <p className="text-[11px] text-gray-500 mt-2">{description}</p>}
    </div>
  );
}

export default function MyCpd({ cpdProfiles, setCpdProfiles, programs, aoPEPrograms, cycles }) {
  const { member } = useAuth();

  const profile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  const myPrograms = useMemo(
    () => (programs || []).filter((p) => p.memberNumber === member?.memberNumber),
    [programs, member]
  );

  // HLBR US-803: cycle selector across last 7 years.
  const availableCycles = useMemo(() => {
    const all = cycles || [];
    const usedCycleIds = new Set((profile?.activities || []).map((a) => a.cycleId).filter(Boolean));
    const SEVEN_YEARS_MS = 7 * 365 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - SEVEN_YEARS_MS);
    const filtered = all.filter((c) => {
      const inWindow = new Date(c.startDate || 0) >= cutoff;
      return inWindow && (c.status !== 'Pending' || usedCycleIds.has(c.id));
    });
    return [...filtered].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }, [cycles, profile]);

  const defaultCycle = useMemo(
    () => availableCycles.find((c) => c.status === 'Open') || availableCycles[0] || null,
    [availableCycles]
  );
  const [selectedCycleId, setSelectedCycleId] = useState('');
  useEffect(() => {
    if (!selectedCycleId && defaultCycle) setSelectedCycleId(defaultCycle.id);
  }, [selectedCycleId, defaultCycle]);
  const selectedCycle = availableCycles.find((c) => c.id === selectedCycleId) || defaultCycle;

  // HLBR US-806: logging only when selected cycle is Open.
  const isCycleOpen = selectedCycle?.status === 'Open';
  const hasExemption = Boolean(profile?.cpdExemption);

  // US-500..506 metrics
  const metrics = useMemo(
    () => profile && selectedCycle ? computeCpdCycleMetrics(profile, selectedCycle) : null,
    [profile, selectedCycle]
  );

  // Log activity modal
  const [logOpen, setLogOpen] = useState(false);
  function handleLogActivity(activity) {
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.memberNumber === member.memberNumber
          ? { ...p, activities: [...(p.activities || []), activity] }
          : p
      )
    );
    setLogOpen(false);
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

  const hasAnyRegistrar = myPrograms.length > 0;

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">CPD Summary</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {member.firstName}.</p>
      </div>

      {/* HLBR US-807: CPD Exemption alert */}
      {hasExemption && (
        <section className="mb-6 border border-amber-200 bg-amber-50 rounded-lg p-4 flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <path d="M10 2L2 17h16L10 2z" />
            <path d="M10 8v4M10 15h.01" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-900">CPD Exemption is active for this cycle</p>
            <p className="text-xs text-amber-800 mt-0.5">
              Your CPD requirements are waived. Metric indicators show progress instead of compliance (HLBR US-506).
            </p>
          </div>
        </section>
      )}

      {/* HLBR US-803: Cycle selector (always visible) */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs text-gray-500 mb-1.5">CPD Cycle</label>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="min-w-[240px]">
                <SelectField
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  disabled={availableCycles.length === 0}
                >
                  {availableCycles.length === 0 && <option value="">No cycles available</option>}
                  {availableCycles.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.status !== 'Open' ? ` (${c.status})` : ''}</option>
                  ))}
                </SelectField>
              </div>
              {selectedCycle && <StatusBadge status={selectedCycle.status} />}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {isCycleOpen ? 'Logging and editing apply to this cycle.' : 'This cycle is not Open. You can view data but cannot log new activities against it.'}
            </p>
          </div>
          {isCycleOpen && (
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark self-end"
            >
              Log CPD activity
            </button>
          )}
        </div>
      </section>

      {/* Quick actions — sit above the metrics so members can jump to the action surface immediately */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/member/cpd/profile" className="block text-center px-3 py-3 border border-gray-200 rounded-md hover:border-aps-blue/50 hover:bg-aps-blue-light/40 transition">
            <p className="text-sm font-medium text-gray-900">Manage Profile</p>
            <p className="text-xs text-gray-500 mt-0.5">Manage your details</p>
          </Link>
          <Link to="/member/cpd/learning-plan" className="block text-center px-3 py-3 border border-gray-200 rounded-md hover:border-aps-blue/50 hover:bg-aps-blue-light/40 transition">
            <p className="text-sm font-medium text-gray-900">Manage Learning Plan</p>
            <p className="text-xs text-gray-500 mt-0.5">Record needs</p>
          </Link>
          <Link to="/member/cpd/activities" className="block text-center px-3 py-3 border border-gray-200 rounded-md hover:border-aps-blue/50 hover:bg-aps-blue-light/40 transition">
            <p className="text-sm font-medium text-gray-900">Activities</p>
            <p className="text-xs text-gray-500 mt-0.5">View, log, edit or delete</p>
          </Link>
          <Link to="/member/cpd/report" className="block text-center px-3 py-3 border border-gray-200 rounded-md hover:border-aps-blue/50 hover:bg-aps-blue-light/40 transition">
            <p className="text-sm font-medium text-gray-900">Report</p>
            <p className="text-xs text-gray-500 mt-0.5">Generate PDF</p>
          </Link>
        </div>
      </section>

      {/* Metric cards US-501..504 */}
      {metrics && (
        <>
          <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Compliance metrics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Learning Plan — US-501 */}
              <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <p className="text-sm font-medium text-gray-900">Learning Plan</p>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium border ${
                    metrics.learningPlanStatus === 'Reviewed' ? 'bg-green-50 text-green-700 border-green-200'
                    : metrics.learningPlanStatus === 'Developed' ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : metrics.learningPlanStatus === 'Offline' ? 'bg-gray-100 text-gray-600 border-gray-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {metrics.learningPlanStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.learningPlanStatus === 'Reviewed' && 'Your plan has been reviewed this cycle.'}
                  {metrics.learningPlanStatus === 'Developed' && 'You have learning needs recorded but have not yet reviewed your plan.'}
                  {metrics.learningPlanStatus === 'Not Started' && 'Add learning needs to develop your plan.'}
                  {metrics.learningPlanStatus === 'Offline' && 'You are documenting your plan offline.'}
                </p>
                <Link to="/member/cpd/learning-plan" className="inline-block mt-3 text-xs font-medium text-aps-blue hover:underline">Manage learning plan →</Link>
              </div>

              {/* Base Minimum CPD — US-502 */}
              <MetricCard
                label="Base Minimum CPD"
                logged={metrics.baseMin.logged}
                required={metrics.baseMin.required}
                met={metrics.baseMin.met}
                exempt={hasExemption}
              />

              {/* Peer Consultation — US-503 */}
              <MetricCard
                label="Peer Consultation"
                logged={metrics.peerConsultation.logged}
                required={metrics.peerConsultation.required}
                met={metrics.peerConsultation.met}
                exempt={hasExemption}
              />

              {/* Active Hours — US-504 */}
              <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <p className="text-sm font-medium text-gray-900">Active Hours</p>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-medium text-gray-900">{metrics.activeHours.logged}h</span> logged
                </p>
                <p className="text-[11px] text-gray-500">Total Active CPD time + active portions of Peer Consultation.</p>
              </div>
            </div>
          </section>

          {/* PsyBA Endorsements — US-505 */}
          {metrics.perAoPE.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">PsyBA Endorsements</h2>
              <p className="text-xs text-gray-500 mb-3">
                Per-AoPE compliance. Required hours per AoPE = {metrics.perAoPE[0]?.required}h
                {metrics.perAoPE.length === 1 ? ' (minimum floor for a single AoPE)' : ` (cycle minimum ${selectedCycle?.minRequiredHours}h ÷ ${metrics.perAoPE.length} AoPEs)`}.
              </p>
              <div className="space-y-2">
                {metrics.perAoPE.map((row) => (
                  <div key={row.aoPE} className="border border-gray-100 rounded-md p-3 bg-gray-50/50">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <p className="text-sm font-medium text-gray-900">{row.aoPE}</p>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium border ${
                        hasExemption ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : row.met ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {hasExemption ? 'Exempt' : row.met ? 'Met' : 'Not met'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1.5">
                      <span className="font-medium text-gray-900">{row.logged}h</span> / {row.required}h {hasExemption ? 'standard required' : 'required'}
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${hasExemption ? 'bg-gray-300' : row.met ? 'bg-green-500' : row.logged > 0 ? 'bg-amber-400' : 'bg-gray-300'}`} style={{ width: `${Math.min(100, Math.round((row.logged / Math.max(row.required, 1)) * 100))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Linked registrar programs (only shown when member has any) */}
      {hasAnyRegistrar && (
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
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
              const pct = template ? compliancePercent(p, template, profile?.activities || []) : 0;
              const barColour = pct >= 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-gray-300';
              return (
                <Link key={p.id} to={`/member/registrar/${p.id}`} className="block bg-gray-50/60 border border-gray-100 rounded-lg p-4 hover:border-aps-blue/40 hover:bg-white transition">
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
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColour}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Log CPD activity modal (US-801/802/803) */}
      {selectedCycle && isCycleOpen && (
        <LogCpdActivityModal
          open={logOpen}
          cycle={selectedCycle}
          allocationOptions={(profile?.aoPEs || []).map((a) => ({ value: a, label: a }))}
          onSave={handleLogActivity}
          onCancel={() => setLogOpen(false)}
        />
      )}
    </PageShell>
  );
}
