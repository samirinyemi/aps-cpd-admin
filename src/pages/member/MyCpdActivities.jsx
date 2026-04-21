import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import SelectField from '../../components/SelectField';
import LogCpdActivityModal from '../../components/LogCpdActivityModal';
import { useAuth } from '../../context/AuthContext';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatHours(decimal) {
  if (!decimal) return '0h';
  const whole = Math.floor(decimal);
  const mins = Math.round((decimal - whole) * 60);
  if (whole && mins) return `${whole}h ${mins}m`;
  if (whole) return `${whole}h`;
  return `${mins}m`;
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 3.5a2.12 2.12 0 013 3L7 17l-4 1 1-4L14.5 3.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h12M8 6V4h4v2m1 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V6" />
    </svg>
  );
}

function ActivityCard({ activity, layout, onOpen, onEdit, onDelete }) {
  const kind = activity.activityKind || activity.activityType || 'CPD';
  const stop = (e) => e.stopPropagation();
  const actions = (
    <div className="flex items-center gap-1" onClick={stop}>
      <button type="button" onClick={(e) => { stop(e); onEdit(); }} className="p-1.5 rounded text-aps-blue hover:bg-aps-blue-light" title="Edit"><EditIcon /></button>
      <button type="button" onClick={(e) => { stop(e); onDelete(); }} className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Delete"><TrashIcon /></button>
    </div>
  );

  if (layout === 'grid') {
    return (
      <div onClick={onOpen} className="cursor-pointer bg-white border border-gray-200 rounded-lg p-5 hover:border-aps-blue/50 hover:shadow-sm transition">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{kind}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(activity.completedDate)}</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-aps-blue/10 text-aps-blue">{formatHours(activity.cpdHrs)}</span>
        </div>
        <dl className="text-xs text-gray-600 space-y-1.5 mb-3">
          <div className="flex justify-between gap-2"><dt className="text-gray-500">AoPE</dt><dd className="font-medium text-gray-900 truncate">{activity.allocation || '—'}</dd></div>
          {(activity.peerHrs > 0 || activity.actionHrs > 0) && (
            <div className="flex justify-between gap-2">
              <dt className="text-gray-500">Peer / Active</dt>
              <dd className="font-medium text-gray-900">{formatHours(activity.peerHrs)} · {formatHours(activity.actionHrs)}</dd>
            </div>
          )}
        </dl>
        <div className="flex justify-end">{actions}</div>
      </div>
    );
  }

  return (
    <div onClick={onOpen} className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-aps-blue/50 hover:shadow-sm transition flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{kind}</p>
          <span className="text-xs text-gray-400">·</span>
          <p className="text-xs text-gray-500">{formatDate(activity.completedDate)}</p>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-aps-blue/10 text-aps-blue ml-auto">{formatHours(activity.cpdHrs)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span><span className="text-gray-500">AoPE:</span> <span className="font-medium text-gray-900">{activity.allocation || '—'}</span></span>
          {(activity.peerHrs > 0 || activity.actionHrs > 0) && (
            <span><span className="text-gray-500">Peer / Active:</span> <span className="font-medium text-gray-900">{formatHours(activity.peerHrs)} / {formatHours(activity.actionHrs)}</span></span>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}

const RANGES = [
  { value: 'day', label: 'Last day', ms: 24 * 60 * 60 * 1000 },
  { value: 'week', label: 'Last week', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: 'month', label: 'Last month', ms: 30 * 24 * 60 * 60 * 1000 },
  { value: 'year', label: 'Last year', ms: 365 * 24 * 60 * 60 * 1000 },
  { value: 'all', label: 'All time', ms: null },
];

export default function MyCpdActivities({ cpdProfiles, setCpdProfiles, cycles = [] }) {
  const { member } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Log-activity modal: can be opened either by the "Log CPD activity" button
  // on this page, or by deep-link / sidebar shortcut via ?log=1 query param.
  const [logOpen, setLogOpen] = useState(false);
  useEffect(() => {
    if (searchParams.get('log') === '1') {
      setLogOpen(true);
      // strip the param so a refresh doesn't keep re-opening it
      const next = new URLSearchParams(searchParams);
      next.delete('log');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const profile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  const availableCycles = useMemo(() => {
    const all = cycles || [];
    const SEVEN_YEARS_MS = 7 * 365 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - SEVEN_YEARS_MS);
    return all
      .filter((c) => new Date(c.startDate || 0) >= cutoff && c.status !== 'Pending')
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }, [cycles]);

  const defaultCycle = availableCycles.find((c) => c.status === 'Open') || availableCycles[0] || null;
  const [selectedCycleId, setSelectedCycleId] = useState(defaultCycle?.id || '');
  const selectedCycle = availableCycles.find((c) => c.id === selectedCycleId) || defaultCycle;
  const isCycleOpen = selectedCycle?.status === 'Open';

  const [kindFilter, setKindFilter] = useState('');
  const [aoPEFilter, setAoPEFilter] = useState('');
  const [layout, setLayout] = useState('list');
  const [range, setRange] = useState('month');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Stats scope: all of the member's activities across all cycles, constrained
  // by the selected time-range (uses completedDate).
  const rangeCutoff = useMemo(() => {
    const r = RANGES.find((x) => x.value === range);
    if (!r || !r.ms) return null;
    return new Date(Date.now() - r.ms);
  }, [range]);

  const statsActivities = useMemo(() => {
    if (!profile) return [];
    return (profile.activities || []).filter((a) => {
      if (!rangeCutoff) return true;
      if (!a.completedDate) return false;
      return new Date(a.completedDate + 'T00:00:00') >= rangeCutoff;
    });
  }, [profile, rangeCutoff]);

  const totalActivities = statsActivities.length;
  const totalHours = statsActivities.reduce((acc, a) => acc + Number(a.cpdHrs || 0), 0);
  const activeHours = statsActivities.reduce((acc, a) => acc + Number(a.actionHrs || 0), 0);

  const activities = useMemo(() => {
    if (!profile || !selectedCycle) return [];
    return (profile.activities || []).filter((a) => {
      if (a.cycleId !== selectedCycle.id) return false;
      if (kindFilter && (a.activityKind || a.activityType) !== kindFilter) return false;
      if (aoPEFilter && a.allocation !== aoPEFilter) return false;
      return true;
    });
  }, [profile, selectedCycle, kindFilter, aoPEFilter]);

  function handleLogSave(activity) {
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.memberNumber === profile.memberNumber
          ? { ...p, activities: [...(p.activities || []), activity] }
          : p
      )
    );
    setLogOpen(false);
  }

  function handleDelete() {
    if (!confirmDelete) return;
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.memberNumber === profile.memberNumber
          ? { ...p, activities: (p.activities || []).filter((a) => a.id !== confirmDelete.id) }
          : p
      )
    );
    setConfirmDelete(null);
  }

  if (!profile) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">No CPD profile found.</p>
          <Link to="/member/cpd" className="text-aps-blue hover:underline text-sm">Back to CPD Summary</Link>
        </div>
      </PageShell>
    );
  }

  const kinds = Array.from(new Set((profile.activities || []).map((a) => a.activityKind || a.activityType).filter(Boolean)));

  return (
    <PageShell>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5">History of all CPD activities you've logged, plus statistics across the selected time range.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button onClick={() => setLayout('list')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${layout === 'list' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" /></svg>
              List
            </button>
            <button onClick={() => setLayout('grid')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${layout === 'grid' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" /></svg>
              Grid
            </button>
          </div>
          {isCycleOpen && (
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
            >
              Log CPD activity
            </button>
          )}
        </div>
      </div>

      {/* Stats panel */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="text-base font-semibold text-gray-900">Statistics</h2>
          <div className="w-40">
            <SelectField value={range} onChange={(e) => setRange(e.target.value)}>
              {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </SelectField>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-500">Total activities</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{totalActivities}</p>
          </div>
          <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-500">Total hours (CPD)</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{formatHours(totalHours)}</p>
          </div>
          <div className="bg-gray-50/60 border border-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-500">Active hours</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{formatHours(activeHours)}</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">CPD Cycle</label>
            <SelectField value={selectedCycleId} onChange={(e) => setSelectedCycleId(e.target.value)}>
              {availableCycles.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.status !== 'Open' ? ` (${c.status})` : ''}</option>
              ))}
            </SelectField>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Activity Kind</label>
            <SelectField value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
              <option value="">All kinds</option>
              {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
            </SelectField>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Allocation (AoPE)</label>
            <SelectField value={aoPEFilter} onChange={(e) => setAoPEFilter(e.target.value)}>
              <option value="">All AoPEs</option>
              {(profile.aoPEs || []).map((a) => <option key={a} value={a}>{a}</option>)}
            </SelectField>
          </div>
        </div>
      </section>

      {/* Activity cards */}
      {activities.length === 0 ? (
        <section className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center">
          <p className="text-sm text-gray-500">No activities match the current filters.</p>
        </section>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...activities]
            .sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || ''))
            .map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                layout="grid"
                onOpen={() => navigate(`/member/cpd/activities/${a.id}`)}
                onEdit={() => navigate(`/member/cpd/activities/${a.id}?edit=1`)}
                onDelete={() => setConfirmDelete(a)}
              />
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...activities]
            .sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || ''))
            .map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                layout="list"
                onOpen={() => navigate(`/member/cpd/activities/${a.id}`)}
                onEdit={() => navigate(`/member/cpd/activities/${a.id}?edit=1`)}
                onDelete={() => setConfirmDelete(a)}
              />
            ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete CPD activity"
        message={confirmDelete ? `Delete this ${confirmDelete.activityKind || confirmDelete.activityType} activity? This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Log CPD activity modal — overlays this page so the user stays in context */}
      {isCycleOpen && selectedCycle && (
        <LogCpdActivityModal
          open={logOpen}
          cycle={selectedCycle}
          allocationOptions={(profile.aoPEs || []).map((a) => ({ value: a, label: a }))}
          onSave={handleLogSave}
          onCancel={() => setLogOpen(false)}
        />
      )}
    </PageShell>
  );
}
