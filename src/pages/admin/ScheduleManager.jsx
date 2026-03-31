import { useState } from 'react';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

const processTypeOptions = [
  'CPD Compliance Check',
  'Learning Plan Reminder',
  'Cycle Rollover',
];

const cycleOptions = [
  '2024–2025 CPD Cycle',
  '2025–2026 CPD Cycle',
  '2026–2027 CPD Cycle',
  '2027–2028 CPD Cycle',
];

function ScheduleFormModal({ open, schedule, onSave, onCancel }) {
  const isEdit = Boolean(schedule?.id);
  const [form, setForm] = useState({
    processType: schedule?.processType || '',
    targetCycle: schedule?.targetCycle || '',
    executionDateTime: schedule?.executionDateTime || '',
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isComplete = form.processType && form.targetCycle && form.executionDateTime;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEdit ? 'Edit Schedule' : 'Add Schedule'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Process Type</label>
            <select
              value={form.processType}
              onChange={(e) => update('processType', e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            >
              <option value="">Select process type...</option>
              {processTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Cycle</label>
            <select
              value={form.targetCycle}
              onChange={(e) => update('targetCycle', e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            >
              <option value="">Select cycle...</option>
              {cycleOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Execution Date/Time</label>
            <input
              type="datetime-local"
              value={form.executionDateTime}
              onChange={(e) => update('executionDateTime', e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...form, id: schedule?.id })}
            disabled={!isComplete}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save changes' : 'Add schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString('en-AU', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ScheduleManager({ schedules, setSchedules, executionHistory }) {
  const [dialog, setDialog] = useState({ open: false });
  const [formModal, setFormModal] = useState({ open: false, schedule: null });
  const [expandedRow, setExpandedRow] = useState(null);

  function handleToggleStatus(action, schedule) {
    setDialog({
      open: true,
      title: `${action} Schedule`,
      message: `Are you sure you want to ${action.toLowerCase()} the "${schedule.processType}" schedule?`,
      onConfirm: () => {
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === schedule.id
              ? { ...s, status: action === 'Activate' ? 'Active' : 'Inactive' }
              : s
          )
        );
        setDialog({ open: false });
      },
    });
  }

  function handleSaveSchedule(data) {
    if (data.id) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
      );
    } else {
      setSchedules((prev) => [
        ...prev,
        { ...data, id: String(Date.now()), status: 'Inactive' },
      ]);
    }
    setFormModal({ open: false, schedule: null });
  }

  const scheduleColumns = [
    { key: 'processType', label: 'Process Type' },
    { key: 'targetCycle', label: 'Target Cycle' },
    {
      key: 'executionDateTime',
      label: 'Execution Date/Time',
      render: (row) => formatDateTime(row.executionDateTime),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {row.status === 'Inactive' && (
            <button
              onClick={() => handleToggleStatus('Activate', row)}
              className="text-xs px-2.5 py-1 text-status-open border border-status-open rounded hover:bg-status-open-bg"
            >
              Activate
            </button>
          )}
          {row.status === 'Active' && (
            <button
              onClick={() => handleToggleStatus('Deactivate', row)}
              className="text-xs px-2.5 py-1 text-status-closed border border-status-closed rounded hover:bg-status-closed-bg"
            >
              Deactivate
            </button>
          )}
          <button
            onClick={() => setFormModal({ open: true, schedule: row })}
            className="text-xs px-2.5 py-1 text-aps-blue border border-aps-blue rounded hover:bg-aps-blue-light"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const historyColumns = [
    { key: 'process', label: 'Process' },
    { key: 'cycle', label: 'Cycle' },
    {
      key: 'executedAt',
      label: 'Executed At',
      render: (row) => formatDateTime(row.executedAt),
    },
    { key: 'triggeredBy', label: 'Triggered By' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'errorDetails',
      label: 'Error Details',
      sortable: false,
      render: (row) => {
        if (!row.errorDetails) return <span className="text-gray-400">—</span>;
        const isExpanded = expandedRow === row.id;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExpandedRow(isExpanded ? null : row.id)}
              className="text-xs text-aps-blue hover:underline"
            >
              {isExpanded ? 'Hide details' : 'View details'}
            </button>
            {isExpanded && (
              <p className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-3 max-w-xs">
                {row.errorDetails}
              </p>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageShell>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Schedule Process Manager</h1>

      {/* Section 1: Scheduled Processes */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Scheduled Processes</h2>
          <button
            onClick={() => setFormModal({ open: true, schedule: null })}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Add schedule
          </button>
        </div>
        <DataTable
          columns={scheduleColumns}
          data={schedules}
          emptyMessage="No scheduled processes have been configured."
        />
      </section>

      {/* Section 2: Execution History */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Execution History</h2>
        <DataTable
          columns={historyColumns}
          data={executionHistory}
          emptyMessage="No execution history available."
        />
      </section>

      {/* Schedule form modal */}
      <ScheduleFormModal
        open={formModal.open}
        schedule={formModal.schedule}
        onSave={handleSaveSchedule}
        onCancel={() => setFormModal({ open: false, schedule: null })}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog({ open: false })}
      />
    </PageShell>
  );
}
