import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString('en-AU', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function ScheduleStatusBadge({ status }) {
  const styles = {
    Pending: 'bg-gray-100 text-gray-700 border border-gray-200',
    Executed: 'bg-status-open-bg text-status-open border border-status-open/30',
    Cancelled: 'bg-status-closed-bg text-status-closed border border-status-closed/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}

function ActionBadge({ action }) {
  const styles =
    action === 'Open'
      ? 'bg-status-open-bg text-status-open border border-status-open/30'
      : 'bg-aps-blue-light text-aps-blue border border-aps-blue/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles}`}>
      {action === 'Open' ? 'Open Cycle' : 'Close Cycle'}
    </span>
  );
}

function AddScheduleModal({ open, onSave, onCancel }) {
  const [action, setAction] = useState('Open');
  const [dateTime, setDateTime] = useState('');

  if (!open) return null;

  function handleSave() {
    onSave({ action, dateTime });
    setAction('Open');
    setDateTime('');
  }

  function handleCancel() {
    setAction('Open');
    setDateTime('');
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Schedule</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction('Open')}
                className={`px-4 py-3 text-sm font-medium rounded-md border transition-colors ${
                  action === 'Open'
                    ? 'border-aps-blue bg-aps-blue-light text-aps-blue'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Open Cycle
              </button>
              <button
                type="button"
                onClick={() => setAction('Close')}
                className={`px-4 py-3 text-sm font-medium rounded-md border transition-colors ${
                  action === 'Close'
                    ? 'border-aps-blue bg-aps-blue-light text-aps-blue'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Close Cycle
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dateTime}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CycleDetail({ cycles, setCycles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const cycle = cycles.find((c) => c.id === id);

  const [dialog, setDialog] = useState({ open: false });
  const [addModalOpen, setAddModalOpen] = useState(false);

  if (!cycle) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Cycle not found.</p>
          <Link to="/admin/cpd/cycles" className="text-aps-blue hover:underline text-sm">
            Back to CPD Cycles
          </Link>
        </div>
      </PageShell>
    );
  }

  const schedules = cycle.schedules || [];

  function handleCycleAction(action) {
    setDialog({
      open: true,
      title: `${action} Cycle`,
      message: `Are you sure you want to ${action.toLowerCase()} "${cycle.name}"?`,
      confirmLabel: action,
      onConfirm: () => {
        const newStatus = action === 'Close' ? 'Closed' : 'Open';
        const historyAction =
          action === 'Open' ? 'Opened' : action === 'Close' ? 'Closed' : 'Reopened';
        setCycles((prev) =>
          prev.map((c) =>
            c.id === cycle.id
              ? {
                  ...c,
                  status: newStatus,
                  statusHistory: [
                    ...(c.statusHistory || []),
                    {
                      action: historyAction,
                      date: new Date().toISOString(),
                      triggeredBy: 'Admin (Manual)',
                    },
                  ],
                }
              : c
          )
        );
        setDialog({ open: false });
      },
    });
  }

  function handleAddSchedule(entry) {
    const newSchedule = {
      id: `sch-${cycle.id}-${Date.now()}`,
      action: entry.action,
      dateTime: entry.dateTime,
      status: 'Pending',
    };
    setCycles((prev) =>
      prev.map((c) =>
        c.id === cycle.id
          ? { ...c, schedules: [...(c.schedules || []), newSchedule] }
          : c
      )
    );
    setAddModalOpen(false);
  }

  function handleRemoveSchedule(schedule) {
    setDialog({
      open: true,
      title: 'Remove Schedule',
      message: `Are you sure you want to remove this scheduled ${schedule.action.toLowerCase()} event for "${cycle.name}"?`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        setCycles((prev) =>
          prev.map((c) =>
            c.id === cycle.id
              ? {
                  ...c,
                  schedules: (c.schedules || []).filter((s) => s.id !== schedule.id),
                }
              : c
          )
        );
        setDialog({ open: false });
      },
    });
  }

  // Sort schedules so Close actions appear before Open actions,
  // then by dateTime ascending within each action group.
  const actionOrder = { Close: 0, Open: 1 };
  const sortedSchedules = [...schedules].sort((a, b) => {
    const orderA = actionOrder[a.action] ?? 99;
    const orderB = actionOrder[b.action] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.dateTime.localeCompare(b.dateTime);
  });

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link to="/admin/cpd/cycles" className="text-aps-blue hover:underline">
              CPD Cycles
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{cycle.name}</li>
        </ol>
      </nav>

      {/* Cycle Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{cycle.name}</h1>
          <div className="mt-2">
            <StatusBadge status={cycle.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/cpd/cycles/${cycle.id}/edit`)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit Cycle
          </button>
          {cycle.status === 'Pending' && (
            <button
              onClick={() => handleCycleAction('Open')}
              className="px-4 py-2 text-sm font-medium text-white bg-status-open rounded-md hover:opacity-90"
            >
              Open Cycle
            </button>
          )}
          {cycle.status === 'Open' && (
            <button
              onClick={() => handleCycleAction('Close')}
              className="px-4 py-2 text-sm font-medium text-white bg-status-closed rounded-md hover:opacity-90"
            >
              Close Cycle
            </button>
          )}
          {cycle.status === 'Closed' && (
            <button
              onClick={() => handleCycleAction('Reopen')}
              className="px-4 py-2 text-sm font-medium text-white bg-status-open rounded-md hover:opacity-90"
            >
              Reopen Cycle
            </button>
          )}
        </div>
      </div>

      {/* Cycle Details Card */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Cycle Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{cycle.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Status</dt>
            <dd className="mt-0.5"><StatusBadge status={cycle.status} /></dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Start Date</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(cycle.startDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">End Date</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(cycle.endDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Min Required Hours</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{cycle.minRequiredHours}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Min Peer Hours</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{cycle.minPeerHours}</dd>
          </div>
        </dl>
      </section>

      {/* Schedule Section */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Scheduled Events</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Queue future open or close events for this cycle. Multiple schedules can be added.
            </p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-aps-blue border border-aps-blue rounded hover:bg-aps-blue-light shrink-0 ml-4"
          >
            Add schedule
          </button>
        </div>

        {sortedSchedules.length === 0 ? (
          <div className="mt-4 py-8 text-center border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-400">No schedules queued for this cycle.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date & Time</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {sortedSchedules.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3"><ActionBadge action={s.action} /></td>
                    <td className="px-4 py-3 text-gray-700">{formatDateTime(s.dateTime)}</td>
                    <td className="px-4 py-3"><ScheduleStatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {s.status === 'Pending' && (
                        <button
                          onClick={() => handleRemoveSchedule(s)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Status History */}
      {cycle.statusHistory && cycle.statusHistory.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Status History</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date & Time</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Triggered By</th>
                </tr>
              </thead>
              <tbody>
                {cycle.statusHistory.map((entry, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-700 font-medium">{entry.action}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDateTime(entry.date)}</td>
                    <td className="px-4 py-3 text-gray-500">{entry.triggeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Add schedule modal */}
      <AddScheduleModal
        open={addModalOpen}
        onSave={handleAddSchedule}
        onCancel={() => setAddModalOpen(false)}
      />

      {/* Confirm dialog */}
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
