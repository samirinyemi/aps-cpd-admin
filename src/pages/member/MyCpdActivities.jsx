import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

// HLBR View CPD Activity History — US-901 to US-903.

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

export default function MyCpdActivities({ cpdProfiles, setCpdProfiles, cycles = [] }) {
  const { member } = useAuth();

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
  const [confirmDelete, setConfirmDelete] = useState(null);

  const activities = useMemo(() => {
    if (!profile || !selectedCycle) return [];
    return (profile.activities || []).filter((a) => {
      if (a.cycleId !== selectedCycle.id) return false;
      if (kindFilter && (a.activityKind || a.activityType) !== kindFilter) return false;
      if (aoPEFilter && a.allocation !== aoPEFilter) return false;
      return true;
    });
  }, [profile, selectedCycle, kindFilter, aoPEFilter]);

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
          <h1 className="text-xl font-semibold text-gray-900">CPD Activity History</h1>
          <p className="text-sm text-gray-500 mt-0.5">All CPD activities logged against the selected cycle.</p>
        </div>
        {isCycleOpen && (
          <Link
            to="/member/cpd/log"
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Log CPD activity
          </Link>
        )}
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">CPD Cycle</label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            >
              {availableCycles.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.status !== 'Open' ? ` (${c.status})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Activity Kind</label>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            >
              <option value="">All kinds</option>
              {kinds.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Allocation (AoPE)</label>
            <select
              value={aoPEFilter}
              onChange={(e) => setAoPEFilter(e.target.value)}
              className="w-full h-10 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            >
              <option value="">All AoPEs</option>
              {(profile.aoPEs || []).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </section>

      {activities.length === 0 ? (
        <section className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center">
          <p className="text-sm text-gray-500">No activities match the current filters.</p>
        </section>
      ) : (
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">Kind</th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">Completed</th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">Allocation</th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">CPD hours</th>
                  <th className="text-left py-2.5 px-4 font-medium text-gray-600">Logged</th>
                  <th className="text-right py-2.5 px-4 font-medium text-gray-600">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {[...activities]
                  .sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || ''))
                  .map((a) => (
                    <tr key={a.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4 text-gray-900 font-medium">{a.activityKind || a.activityType}</td>
                      <td className="py-3 px-4 text-gray-700">{formatDate(a.completedDate)}</td>
                      <td className="py-3 px-4 text-gray-700">{a.allocation || <span className="text-gray-400">—</span>}</td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{formatHours(a.cpdHrs)}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(a.loggedDate)}</td>
                      <td className="py-3 px-4 text-right">
                        {isCycleOpen ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(a)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">Read-only</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete CPD activity"
        message={confirmDelete ? `Delete this ${confirmDelete.activityKind || confirmDelete.activityType} activity? This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageShell>
  );
}
