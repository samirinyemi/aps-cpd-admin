import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function CycleList({ cycles, setCycles }) {
  const navigate = useNavigate();
  const [dialog, setDialog] = useState({ open: false, action: null, cycle: null });

  function handleAction(action, cycle) {
    setDialog({
      open: true,
      action,
      cycle,
      title: `${action} Cycle`,
      message: `Are you sure you want to ${action.toLowerCase()} "${cycle.name}"?`,
    });
  }

  function confirmAction() {
    const { action, cycle } = dialog;
    setCycles((prev) =>
      prev.map((c) =>
        c.id === cycle.id
          ? { ...c, status: action === 'Open' ? 'Open' : 'Closed' }
          : c
      )
    );
    setDialog({ open: false });
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'minRequiredHours', label: 'Min Required Hrs' },
    { key: 'minPeerHours', label: 'Min Peer Hrs' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => {
        if (row.status === 'Closed') return null;
        return (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => navigate(`/admin/cpd/cycles/${row.id}/edit`)}
              className="text-xs px-2.5 py-1 text-aps-blue border border-aps-blue rounded hover:bg-aps-blue-light"
            >
              Edit
            </button>
            {row.status === 'Pending' && (
              <button
                onClick={() => handleAction('Open', row)}
                className="text-xs px-2.5 py-1 text-status-open border border-status-open rounded hover:bg-status-open-bg"
              >
                Open
              </button>
            )}
            {row.status === 'Open' && (
              <button
                onClick={() => handleAction('Close', row)}
                className="text-xs px-2.5 py-1 text-status-closed border border-status-closed rounded hover:bg-status-closed-bg"
              >
                Close
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">CPD Cycles</h1>
        <button
          onClick={() => navigate('/admin/cpd/cycles/new')}
          className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
        >
          Create new cycle
        </button>
      </div>

      <DataTable
        columns={columns}
        data={cycles}
        emptyMessage="No CPD cycles have been created yet."
      />

      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.action}
        onConfirm={confirmAction}
        onCancel={() => setDialog({ open: false })}
      />
    </PageShell>
  );
}
