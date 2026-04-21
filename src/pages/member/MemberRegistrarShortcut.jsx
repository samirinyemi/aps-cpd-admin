import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import LogSessionModal from '../../components/LogSessionModal';
import LogHoursModal from '../../components/LogHoursModal';
import LogCpdActivityModal from '../../components/LogCpdActivityModal';
import { useAuth } from '../../context/AuthContext';
import SelectField from '../../components/SelectField';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(h, m) {
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
}

// Titles per action
const titles = {
  supervisors: { page: 'My Supervisors', subtitle: "Supervisors linked to your active registrar program." },
  places:       { page: 'My Places of Practice', subtitle: "Places of practice linked to your active registrar program." },
  'log-supervision': { page: 'Log Supervision Hours', subtitle: 'Record a supervision session against your active registrar program.' },
  'log-practice':    { page: 'Log Practice Hours',    subtitle: 'Record practice hours against your active registrar program.' },
  'log-cpd':         { page: 'Log CPD Hours',         subtitle: 'Record a CPD activity against your active registrar program.' },
};

export default function MemberRegistrarShortcut({ action, programs, setPrograms, cpdProfiles = [], setCpdProfiles, cycles = [] }) {
  const { member } = useAuth();
  const navigate = useNavigate();

  const myPrograms = useMemo(
    () => (programs || []).filter((p) => p.memberNumber === member?.memberNumber),
    [programs, member]
  );
  const openPrograms = myPrograms.filter((p) => p.status === 'Open');

  // HLBR US-1203 concept: the "selected Member Program Profile" is an explicit
  // choice when the member has more than one Open program. Default to the first
  // Open program; the member can switch via the selector below.
  const [activeId, setActiveId] = useState('');
  useEffect(() => {
    if (!activeId || !openPrograms.find((p) => p.id === activeId)) {
      setActiveId(openPrograms[0]?.id || '');
    }
  }, [openPrograms, activeId]);
  const active = openPrograms.find((p) => p.id === activeId) || null;

  // Modal auto-open for log shortcuts
  const [sessionOpen, setSessionOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [cpdOpen, setCpdOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (action === 'log-supervision') setSessionOpen(true);
    else if (action === 'log-practice') setHoursOpen(true);
    else if (action === 'log-cpd') setCpdOpen(true);
  }, [action, active]);

  const title = titles[action] || { page: 'Registrar', subtitle: '' };

  // ---- Empty states ----
  if (!member) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">Not logged in as a member.</p>
          <Link to="/login" className="text-aps-blue hover:underline text-sm">Return to login</Link>
        </div>
      </PageShell>
    );
  }

  if (!active) {
    return (
      <PageShell>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">{title.page}</h1>
        <p className="text-sm text-gray-500 mb-6">{title.subtitle}</p>
        <section className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center">
          <p className="text-sm text-gray-600 mb-1">
            {myPrograms.length === 0
              ? "You're not enrolled in any registrar program yet."
              : "You don't have any Open registrar programs."}
          </p>
          <p className="text-xs text-gray-500 mb-5">
            This surface is only available while a registrar program is Open (HLBR US-1501/1601/1701/1703/1706).
          </p>
          <button
            type="button"
            onClick={() => navigate('/member/registrar/new')}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Begin new registrar program
          </button>
        </section>
      </PageShell>
    );
  }

  // ---- Shared save handlers for modals ----
  function handleLogSession(programId, activity) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, activities: [...(p.activities || []), activity] } : p))
    );
    setSessionOpen(false);
    navigate(`/member/registrar/${programId}`);
  }

  function handleLogHours(programId, activity) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, activities: [...(p.activities || []), activity] } : p))
    );
    setHoursOpen(false);
    navigate(`/member/registrar/${programId}`);
  }

  // CPD logging is unified on the member's CPD profile, tagged with the current
  // Open cycle and allocated to this program's AoPE so it rolls up into the
  // registrar compliance dashboard (HLBR US-1706 + MACPD formula).
  function handleLogCpd(activity) {
    if (!setCpdProfiles || !member) return;
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.memberNumber === member.memberNumber
          ? { ...p, activities: [...(p.activities || []), activity] }
          : p
      )
    );
    setCpdOpen(false);
    navigate('/member/cpd');
  }

  // ---- Render ----
  return (
    <PageShell>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title.page}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {title.subtitle}
          </p>
        </div>
        <Link
          to={`/member/registrar/${active.id}`}
          className="text-xs font-medium text-aps-blue hover:underline self-start"
        >
          Open full program →
        </Link>
      </div>

      {/* Active program selector — HLBR US-1203 */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <label className="block text-xs text-gray-500 mb-1.5">Active registrar program</label>
        {openPrograms.length === 1 ? (
          <p className="text-sm font-medium text-gray-900">
            {active.areaOfPractice}
            <span className="text-xs text-gray-400 font-normal ml-2">(only Open program)</span>
          </p>
        ) : (
          <SelectField value={activeId} onChange={(e) => setActiveId(e.target.value)}>
            {openPrograms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.areaOfPractice}
              </option>
            ))}
          </SelectField>
        )}
        <p className="text-xs text-gray-500 mt-1.5">
          {openPrograms.length > 1
            ? "You have more than one Open program. Pick which one this action applies to."
            : 'All logging actions on this page apply to this program.'}
        </p>
      </section>

      {/* ---- Supervisors list ---- */}
      {action === 'supervisors' && (
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Supervisors
              <span className="text-sm font-normal text-gray-400 ml-2">({active.supervisors.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => setSessionOpen(true)}
              disabled={active.supervisors.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
              title={active.supervisors.length === 0 ? 'Add a supervisor first' : ''}
            >
              Log session
            </button>
          </div>
          {active.supervisors.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">No supervisors added yet.</p>
              <p className="text-xs text-gray-400">
                Add supervisors from the <Link to={`/member/registrar/${active.id}/edit`} className="text-aps-blue hover:underline">Edit Program</Link> form.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {active.supervisors.map((s) => (
                <div key={s.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {s.title} {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">AHPRA: {s.ahpraNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">AoPE: {s.supervisorAoPE}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.supervisionType === 'Primary' ? 'bg-aps-blue/10 text-aps-blue' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.supervisionType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- Places of Practice list ---- */}
      {action === 'places' && (
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Places of Practice
              <span className="text-sm font-normal text-gray-400 ml-2">({active.placesOfPractice.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => setHoursOpen(true)}
              disabled={active.placesOfPractice.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
              title={active.placesOfPractice.length === 0 ? 'Add a place of practice first' : ''}
            >
              Log hours
            </button>
          </div>
          {active.placesOfPractice.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">No places of practice added yet.</p>
              <p className="text-xs text-gray-400">
                Add places from the <Link to={`/member/registrar/${active.id}/edit`} className="text-aps-blue hover:underline">Edit Program</Link> form.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {active.placesOfPractice.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                  <p className="text-sm font-medium text-gray-900">{p.employerName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.positionTitle}</p>
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
      )}

      {/* ---- Log shortcuts: explanatory panels + recent activity list ---- */}
      {(action === 'log-supervision' || action === 'log-practice' || action === 'log-cpd') && (
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent {action === 'log-cpd' ? 'CPD' : action === 'log-practice' ? 'practice' : 'supervision'} activity</h2>
          {(active.activities || []).filter(
            (a) =>
              (action === 'log-supervision' && a.activityType === 'Supervision')
              || (action === 'log-practice' && a.activityType === 'Practice')
              || (action === 'log-cpd' && a.activityType === 'CPD')
          ).length === 0 ? (
            <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">No activity logged yet. Use the dialog to add one.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {(active.activities || [])
                .filter(
                  (a) =>
                    (action === 'log-supervision' && a.activityType === 'Supervision')
                    || (action === 'log-practice' && a.activityType === 'Practice')
                    || (action === 'log-cpd' && a.activityType === 'CPD')
                )
                .sort((a, b) => (b.completionDate || '').localeCompare(a.completionDate || ''))
                .slice(0, 8)
                .map((a) => (
                  <li key={a.id} className="border border-gray-100 rounded-md p-3 bg-gray-50/60 text-sm flex items-baseline justify-between gap-3">
                    <span className="text-gray-900">
                      {formatDate(a.completionDate)}
                      {a.supervisorName && <span className="text-gray-500"> · {a.supervisorName}</span>}
                      {a.employerName && <span className="text-gray-500"> · {a.employerName}</span>}
                      {a.description && <span className="text-gray-500"> · {a.description}</span>}
                    </span>
                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      {formatDuration(a.hours, a.minutes)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (action === 'log-supervision') setSessionOpen(true);
                if (action === 'log-practice') setHoursOpen(true);
                if (action === 'log-cpd') setCpdOpen(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
            >
              Log {action === 'log-cpd' ? 'CPD' : action === 'log-practice' ? 'practice hours' : 'supervision'}
            </button>
          </div>
        </section>
      )}

      {/* Modals — picker-mode for member: they choose their own supervisor / place */}
      <LogSessionModal
        open={sessionOpen}
        supervisor={null}
        supervisorOptions={active.supervisors || []}
        programs={programs}
        lockedProgramId={active.id}
        onSave={handleLogSession}
        onCancel={() => setSessionOpen(false)}
      />
      <LogHoursModal
        open={hoursOpen}
        location={null}
        locationOptions={active.placesOfPractice || []}
        programs={programs}
        lockedProgramId={active.id}
        onSave={handleLogHours}
        onCancel={() => setHoursOpen(false)}
      />
      <LogCpdActivityModal
        open={cpdOpen}
        cycle={cycles.find((c) => c.status === 'Open') || null}
        allocationOptions={openPrograms.map((p) => ({ value: p.areaOfPractice, label: p.areaOfPractice }))}
        defaultAllocation={active.areaOfPractice}
        onSave={handleLogCpd}
        onCancel={() => setCpdOpen(false)}
      />
    </PageShell>
  );
}
