import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import LogCpdActivityModal from '../../components/LogCpdActivityModal';
import { useAuth } from '../../context/AuthContext';
import { compliancePercent, findLinkedTemplate } from '../../lib/compliance';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value || <span className="text-gray-400">—</span>}</dd>
    </div>
  );
}

const CYCLE_REQUIRED_HOURS = 30;

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

  // HLBR US-803: the CPD Cycle selector lists the member's cycles for the
  // last 7 years, sorted by start date descending, plus the currently Open
  // cycle. We derive available cycles from (a) cycles the member has
  // activities in and (b) every Open cycle.
  const availableCycles = useMemo(() => {
    const all = cycles || [];
    const usedCycleIds = new Set((profile?.activities || []).map((a) => a.cycleId).filter(Boolean));
    const filtered = all.filter((c) => c.status === 'Open' || usedCycleIds.has(c.id));
    return [...filtered].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }, [cycles, profile]);

  // Default: the most current Open cycle (HLBR US-803).
  const defaultCycle = useMemo(
    () => availableCycles.find((c) => c.status === 'Open') || availableCycles[0] || null,
    [availableCycles]
  );

  const [selectedCycleId, setSelectedCycleId] = useState('');
  useEffect(() => {
    if (!selectedCycleId && defaultCycle) setSelectedCycleId(defaultCycle.id);
  }, [selectedCycleId, defaultCycle]);

  const selectedCycle = availableCycles.find((c) => c.id === selectedCycleId) || defaultCycle;

  const activitiesForCycle = useMemo(() => {
    if (!profile || !selectedCycle) return [];
    return (profile.activities || []).filter((a) => a.cycleId === selectedCycle.id);
  }, [profile, selectedCycle]);

  const loggedCpdHours = useMemo(
    () => activitiesForCycle.reduce((sum, a) => sum + Number(a.cpdHrs || 0), 0),
    [activitiesForCycle]
  );

  const cyclePct = Math.min(100, Math.round((loggedCpdHours / CYCLE_REQUIRED_HOURS) * 100));
  const cycleColour = cyclePct >= 100 ? 'bg-green-500' : cyclePct > 0 ? 'bg-amber-400' : 'bg-gray-300';

  // HLBR US-806: only the Open cycle is editable. All other statuses → view-only.
  const isCycleOpen = selectedCycle?.status === 'Open';

  // HLBR US-807: show an alert banner if CPD Exemption = Yes for the selected cycle.
  const hasExemption = Boolean(profile?.cpdExemption);

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
          <Link to="/login" className="text-aps-blue hover:underline text-sm mt-3 inline-block">
            Return to login
          </Link>
        </div>
      </PageShell>
    );
  }

  const hasAnyRegistrar = myPrograms.length > 0;

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My CPD Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back, {member.firstName}.
        </p>
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
              Your CPD requirements are waived for the selected cycle. You may still log activities for your records.
            </p>
          </div>
        </section>
      )}

      {/* HLBR US-803 / US-805: CPD Cycle selector */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs text-gray-500 mb-1.5">CPD Cycle</label>
            {availableCycles.length <= 1 ? (
              <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                {selectedCycle?.name || '—'}
                {selectedCycle && <StatusBadge status={selectedCycle.status} />}
              </p>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  className="h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
                >
                  {availableCycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.status !== 'Open' ? ` (${c.status})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCycle && <StatusBadge status={selectedCycle.status} />}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1.5">
              {isCycleOpen
                ? 'Logging and editing apply to this cycle.'
                : 'This cycle is no longer Open. You can view data but cannot log new activities against it.'}
            </p>
          </div>
        </div>
      </section>

      {/* Personal details */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Name" value={`${member.title ? member.title + ' ' : ''}${member.firstName} ${member.lastName}`} />
          <Field label="Member Number" value={member.memberNumber} />
          <Field label="Grade" value={member.grade} />
          <Field label="Board Registration" value={profile?.boardRegistration} />
        </dl>
      </section>

      {/* Cycle progress */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900">{selectedCycle?.name || 'CPD'} Progress</h2>
          <p className="text-2xl font-semibold text-gray-900">{cyclePct}%</p>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          {loggedCpdHours}h logged of {CYCLE_REQUIRED_HOURS}h required this cycle
        </p>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${cycleColour} transition-all`} style={{ width: `${cyclePct}%` }} />
        </div>
      </section>

      {/* CPD Activities */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            My CPD Activities
            <span className="text-sm font-normal text-gray-400 ml-2">({activitiesForCycle.length})</span>
          </h2>
          {isCycleOpen && (
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark"
            >
              Log CPD activity
            </button>
          )}
        </div>
        {activitiesForCycle.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">
              No CPD activities logged for this cycle{isCycleOpen ? " yet." : "."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">Activity Type</th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">Completed</th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">Peer Hrs</th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">Action Hrs</th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">CPD Hrs</th>
                </tr>
              </thead>
              <tbody>
                {[...activitiesForCycle]
                  .sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || ''))
                  .map((a) => (
                    <tr key={a.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4 text-gray-900 font-medium">{a.activityType}</td>
                      <td className="py-3 px-4 text-gray-700">{formatDate(a.completedDate)}</td>
                      <td className="py-3 px-4 text-gray-700">{a.peerHrs}h</td>
                      <td className="py-3 px-4 text-gray-700">{a.actionHrs}h</td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{a.cpdHrs}h</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* My Registrar Programs — only shown when the member has at least one */}
      {hasAnyRegistrar && (
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              My Registrar Programs
              <span className="text-sm font-normal text-gray-400 ml-2">({myPrograms.length})</span>
            </h2>
            <Link
              to="/member/registrar"
              className="text-xs font-medium text-aps-blue hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myPrograms.map((p) => {
              const template = findLinkedTemplate(p, aoPEPrograms || []);
              const pct = template ? compliancePercent(p, template, profile?.activities || []) : 0;
              const barColour = pct >= 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-gray-300';
              return (
                <Link
                  key={p.id}
                  to={`/member/registrar/${p.id}`}
                  className="block bg-gray-50/60 border border-gray-100 rounded-lg p-4 hover:border-aps-blue/40 hover:bg-white transition"
                >
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

      {/* Learning plan */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Learning Plan
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({profile?.learningNeeds?.length || 0})
          </span>
        </h2>
        {!profile || !profile.learningNeeds || profile.learningNeeds.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">No learning needs recorded yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {profile.learningNeeds.map((ln) => (
              <li key={ln.id} className="flex items-start justify-between gap-3 border border-gray-100 rounded-md p-3 bg-gray-50/40">
                <div className="min-w-0">
                  <p className="text-sm text-gray-900">{ln.need}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Priority: {ln.priority}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border shrink-0 ${
                  ln.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200'
                  : ln.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  {ln.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Log CPD activity modal — only offered when on an Open cycle */}
      {selectedCycle && isCycleOpen && (
        <LogCpdActivityModal
          open={logOpen}
          cycle={selectedCycle}
          allocationOptions={
            myPrograms
              .filter((p) => p.status === 'Open')
              .map((p) => ({ value: p.areaOfPractice, label: p.areaOfPractice }))
          }
          onSave={handleLogActivity}
          onCancel={() => setLogOpen(false)}
        />
      )}
    </PageShell>
  );
}
