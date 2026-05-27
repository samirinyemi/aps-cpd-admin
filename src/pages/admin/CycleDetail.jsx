import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users } from 'lucide-react';
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

export default function CycleDetail({ cycles, setCycles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const cycle = cycles.find((c) => c.id === id);

  const [dialog, setDialog] = useState({ open: false });

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

  // Most recent action first
  const history = [...(cycle.statusHistory || [])].reverse();

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
            onClick={() => navigate(`/admin/cpd/cycles/${cycle.id}/members`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Users size={15} strokeWidth={1.75} />
            View Members
          </button>
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

      {/* Cycle Details */}
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

      {/* History */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          History
          <span className="text-sm font-normal text-gray-400 ml-2">({history.length})</span>
        </h2>
        {history.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-400">No actions recorded yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Actions like Opening, Closing, or Reopening this cycle will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {history.map((entry, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 px-4 py-3 border border-gray-100 rounded-lg bg-gray-50/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 w-2 h-2 rounded-full ${
                    entry.action === 'Opened' || entry.action === 'Reopened'
                      ? 'bg-status-open'
                      : 'bg-status-closed'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{entry.triggeredBy}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 shrink-0">{formatDateTime(entry.date)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

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
