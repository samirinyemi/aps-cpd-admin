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

function ScheduleModal({ open, label, currentValue, onSave, onCancel }) {
  const [value, setValue] = useState(currentValue || '');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time</label>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(value)}
            disabled={!value}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
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
  const [scheduleModal, setScheduleModal] = useState({ open: false, type: null });

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

  function handleCycleAction(action) {
    setDialog({
      open: true,
      title: `${action} Cycle`,
      message: `Are you sure you want to ${action.toLowerCase()} "${cycle.name}"?`,
      confirmLabel: action,
      onConfirm: () => {
        const newStatus = action === 'Open' ? 'Open' : 'Closed';
        setCycles((prev) =>
          prev.map((c) =>
            c.id === cycle.id
              ? {
                  ...c,
                  status: newStatus,
                  // Clear the schedule that was just executed
                  scheduledOpenDate: action === 'Open' ? null : c.scheduledOpenDate,
                  scheduledCloseDate: action === 'Close' ? null : c.scheduledCloseDate,
                  statusHistory: [
                    ...(c.statusHistory || []),
                    {
                      action: action === 'Open' ? 'Opened' : 'Closed',
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

  function handleSaveSchedule(dateTime) {
    const field = scheduleModal.type === 'open' ? 'scheduledOpenDate' : 'scheduledCloseDate';
    setCycles((prev) =>
      prev.map((c) =>
        c.id === cycle.id ? { ...c, [field]: dateTime } : c
      )
    );
    setScheduleModal({ open: false, type: null });
  }

  function handleClearSchedule(type) {
    const field = type === 'open' ? 'scheduledOpenDate' : 'scheduledCloseDate';
    const label = type === 'open' ? 'activation' : 'deactivation';
    setDialog({
      open: true,
      title: 'Remove Schedule',
      message: `Are you sure you want to remove the scheduled ${label} date for "${cycle.name}"?`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        setCycles((prev) =>
          prev.map((c) =>
            c.id === cycle.id ? { ...c, [field]: null } : c
          )
        );
        setDialog({ open: false });
      },
    });
  }

  const canScheduleOpen = cycle.status === 'Pending';
  const canScheduleClose = cycle.status === 'Pending' || cycle.status === 'Open';

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
          {cycle.status !== 'Closed' && (
            <button
              onClick={() => navigate(`/admin/cpd/cycles/${cycle.id}/edit`)}
              className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
            >
              Edit Cycle
            </button>
          )}
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
      {cycle.status !== 'Closed' && (
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Schedule</h2>
          <p className="text-sm text-gray-500 mb-5">
            Schedule when this cycle should automatically open or close.
          </p>

          <div className="space-y-4">
            {/* Scheduled Activation */}
            {canScheduleOpen && (
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduled Activation</p>
                  {cycle.scheduledOpenDate ? (
                    <p className="text-sm text-gray-600 mt-0.5">
                      This cycle will automatically open on <span className="font-medium text-gray-900">{formatDateTime(cycle.scheduledOpenDate)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-0.5">No activation date scheduled</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => setScheduleModal({ open: true, type: 'open' })}
                    className="px-3 py-1.5 text-xs font-medium text-aps-blue border border-aps-blue rounded hover:bg-aps-blue-light"
                  >
                    {cycle.scheduledOpenDate ? 'Change' : 'Set date'}
                  </button>
                  {cycle.scheduledOpenDate && (
                    <button
                      onClick={() => handleClearSchedule('open')}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Scheduled Deactivation */}
            {canScheduleClose && (
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduled Deactivation</p>
                  {cycle.scheduledCloseDate ? (
                    <p className="text-sm text-gray-600 mt-0.5">
                      This cycle will automatically close on <span className="font-medium text-gray-900">{formatDateTime(cycle.scheduledCloseDate)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-0.5">No deactivation date scheduled</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => setScheduleModal({ open: true, type: 'close' })}
                    className="px-3 py-1.5 text-xs font-medium text-aps-blue border border-aps-blue rounded hover:bg-aps-blue-light"
                  >
                    {cycle.scheduledCloseDate ? 'Change' : 'Set date'}
                  </button>
                  {cycle.scheduledCloseDate && (
                    <button
                      onClick={() => handleClearSchedule('close')}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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

      {/* Schedule modal */}
      <ScheduleModal
        open={scheduleModal.open}
        label={scheduleModal.type === 'open' ? 'Schedule Activation Date' : 'Schedule Deactivation Date'}
        currentValue={scheduleModal.type === 'open' ? cycle.scheduledOpenDate : cycle.scheduledCloseDate}
        onSave={handleSaveSchedule}
        onCancel={() => setScheduleModal({ open: false, type: null })}
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
