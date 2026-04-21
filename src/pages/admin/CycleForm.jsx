import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
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

export default function CycleForm({ cycles, setCycles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const existing = isEdit ? cycles.find((c) => c.id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    startDate: existing?.startDate || '',
    endDate: existing?.endDate || '',
    minRequiredHours: existing?.minRequiredHours ?? '',
    minPeerHours: existing?.minPeerHours ?? '',
  });

  const [errors, setErrors] = useState({});
  const [dialog, setDialog] = useState({ open: false });
  const [addModalOpen, setAddModalOpen] = useState(false);

  const schedules = existing?.schedules || [];
  // Close actions appear before Open actions, then by dateTime ascending.
  const actionOrder = { Close: 0, Open: 1 };
  const sortedSchedules = [...schedules].sort((a, b) => {
    const orderA = actionOrder[a.action] ?? 99;
    const orderB = actionOrder[b.action] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.dateTime.localeCompare(b.dateTime);
  });

  function handleAddSchedule(entry) {
    const newSchedule = {
      id: `sch-${id}-${Date.now()}`,
      action: entry.action,
      dateTime: entry.dateTime,
      status: 'Pending',
    };
    setCycles((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, schedules: [...(c.schedules || []), newSchedule] } : c
      )
    );
    setAddModalOpen(false);
  }

  function handleRemoveSchedule(schedule) {
    setDialog({
      open: true,
      title: 'Remove Schedule',
      message: `Are you sure you want to remove this scheduled ${schedule.action.toLowerCase()} event for "${existing?.name}"?`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        setCycles((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, schedules: (c.schedules || []).filter((s) => s.id !== schedule.id) }
              : c
          )
        );
        setDialog({ open: false });
      },
    });
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, dates: undefined }));
  }

  const overlapError = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (start >= end) return null;

    const overlapping = cycles.find((c) => {
      if (isEdit && c.id === id) return false;
      const cStart = new Date(c.startDate);
      const cEnd = new Date(c.endDate);
      return start < cEnd && end > cStart;
    });

    return overlapping ? `Date range overlaps with "${overlapping.name}"` : null;
  }, [form.startDate, form.endDate, cycles, id, isEdit]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) {
      errs.dates = 'End date must be after start date';
    }
    if (form.minRequiredHours === '' || Number(form.minRequiredHours) < 0) errs.minRequiredHours = 'Required';
    if (form.minPeerHours === '' || Number(form.minPeerHours) < 0) errs.minPeerHours = 'Required';
    if (overlapError) errs.dates = overlapError;
    return errs;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const cycleData = {
      ...form,
      minRequiredHours: Number(form.minRequiredHours),
      minPeerHours: Number(form.minPeerHours),
    };

    if (isEdit) {
      setCycles((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...cycleData } : c))
      );
    } else {
      setCycles((prev) => [
        ...prev,
        {
          ...cycleData,
          id: String(Date.now()),
          status: 'Pending',
          schedules: [],
          statusHistory: [],
        },
      ]);
    }

    navigate(isEdit ? `/admin/cpd/cycles/${id}` : '/admin/cpd/cycles');
  }

  function handleStatusAction(action) {
    setDialog({
      open: true,
      title: `${action} Cycle`,
      message: `Are you sure you want to ${action.toLowerCase()} "${existing?.name}"? Any unsaved changes to the form will be lost.`,
      confirmLabel: action,
      onConfirm: () => {
        const newStatus = action === 'Close' ? 'Closed' : 'Open';
        const historyAction =
          action === 'Open' ? 'Opened' : action === 'Close' ? 'Closed' : 'Reopened';
        setCycles((prev) =>
          prev.map((c) =>
            c.id === id
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
        navigate(`/admin/cpd/cycles/${id}`);
      },
    });
  }

  const inputClass = (field) =>
    `w-full h-14 px-4 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/admin/cpd/cycles')} className="hover:text-aps-blue">
          CPD Cycles
        </button>
        {isEdit && existing && (
          <>
            <span className="mx-2">/</span>
            <button onClick={() => navigate(`/admin/cpd/cycles/${id}`)} className="hover:text-aps-blue">
              {existing.name}
            </button>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{isEdit ? 'Edit' : 'Create'}</span>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        {isEdit ? 'Edit CPD Cycle' : 'Create CPD Cycle'}
      </h1>

      <form onSubmit={handleSave}>
        {/* Section 1: Cycle Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900">Cycle Details</h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass('name')}
              placeholder="e.g. 2026–2027 CPD Cycle"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                className={inputClass('startDate')}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                className={inputClass('endDate')}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>
          </div>
          {(errors.dates || overlapError) && (
            <p className="text-sm text-red-600 -mt-4">{errors.dates || overlapError}</p>
          )}

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Required Hours</label>
              <input
                type="number"
                min="0"
                value={form.minRequiredHours}
                onChange={(e) => update('minRequiredHours', e.target.value)}
                className={inputClass('minRequiredHours')}
              />
              {errors.minRequiredHours && <p className="mt-1 text-sm text-red-600">{errors.minRequiredHours}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Peer Hours</label>
              <input
                type="number"
                min="0"
                value={form.minPeerHours}
                onChange={(e) => update('minPeerHours', e.target.value)}
                className={inputClass('minPeerHours')}
              />
              {errors.minPeerHours && <p className="mt-1 text-sm text-red-600">{errors.minPeerHours}</p>}
            </div>
          </div>

          {/* Status (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status <span className="text-gray-400 font-normal">— System managed</span>
            </label>
            <div className="h-14 px-4 flex items-center border border-gray-200 rounded-md bg-gray-50">
              <StatusBadge status={existing?.status || 'Pending'} />
            </div>
          </div>
        </div>

        {/* Section 2: Status Actions (edit mode only) */}
        {isEdit && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Status Actions</h2>
            <p className="text-sm text-gray-500 mb-4">
              Change the cycle status. This action takes effect immediately.
            </p>
            <div className="flex gap-3">
              {existing?.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => handleStatusAction('Open')}
                  className="px-4 py-2 text-sm font-medium text-white bg-status-open rounded-md hover:opacity-90"
                >
                  Open Cycle
                </button>
              )}
              {existing?.status === 'Open' && (
                <button
                  type="button"
                  onClick={() => handleStatusAction('Close')}
                  className="px-4 py-2 text-sm font-medium text-white bg-status-closed rounded-md hover:opacity-90"
                >
                  Close Cycle
                </button>
              )}
              {existing?.status === 'Closed' && (
                <button
                  type="button"
                  onClick={() => handleStatusAction('Reopen')}
                  className="px-4 py-2 text-sm font-medium text-white bg-status-open rounded-md hover:opacity-90"
                >
                  Reopen Cycle
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Scheduled Events (edit mode only) */}
        {isEdit && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Scheduled Events</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Queue future open or close events for this cycle. Multiple schedules can be added.
                </p>
              </div>
              <button
                type="button"
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
                              type="button"
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
          </div>
        )}

        {/* Save / Cancel */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/admin/cpd/cycles/${id}` : '/admin/cpd/cycles')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            {isEdit ? 'Save changes' : 'Create cycle'}
          </button>
        </div>
      </form>

      <AddScheduleModal
        open={addModalOpen}
        onSave={handleAddSchedule}
        onCancel={() => setAddModalOpen(false)}
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
