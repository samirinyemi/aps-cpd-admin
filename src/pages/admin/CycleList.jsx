import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Calendar, List, LayoutGrid, Play, Square } from 'lucide-react';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { month: 'long', day: 'numeric', year: 'numeric' });
}

const CalendarIcon = () => <Calendar size={14} strokeWidth={1.5} />;

const EditIcon = () => <Pencil size={14} strokeWidth={1.5} />;

const PlayIcon = () => <Play size={16} strokeWidth={1.5} />;
const StopIcon = () => <Square size={16} strokeWidth={1.5} />;

function ActionButtons({ cycle, onNavigate, onAction }) {
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onNavigate(cycle, 'edit')}
        className="p-2 rounded-md text-aps-blue bg-aps-blue-light/60 hover:bg-aps-blue-light transition-colors"
        title="Edit cycle"
      >
        <EditIcon />
      </button>
      {cycle.status === 'Pending' && (
        <button
          onClick={() => onAction('Open', cycle)}
          className="p-2 rounded-md text-status-open bg-status-open-bg hover:opacity-80 transition-colors"
          title="Open cycle"
        >
          <PlayIcon />
        </button>
      )}
      {cycle.status === 'Open' && (
        <button
          onClick={() => onAction('Close', cycle)}
          className="p-2 rounded-md text-status-closed bg-status-closed-bg hover:opacity-80 transition-colors"
          title="Close cycle"
        >
          <StopIcon />
        </button>
      )}
      {cycle.status === 'Closed' && (
        <button
          onClick={() => onAction('Reopen', cycle)}
          className="p-2 rounded-md text-status-open bg-status-open-bg hover:opacity-80 transition-colors"
          title="Reopen cycle"
        >
          <PlayIcon />
        </button>
      )}
    </div>
  );
}

function CycleCard({ cycle, layout, onNavigate, onAction }) {
  const isGrid = layout === 'grid';

  if (isGrid) {
    return (
      <div
        onClick={() => onNavigate(cycle)}
        className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-aps-blue/40 hover:shadow-sm transition-all flex flex-col"
      >
        <h3 className="text-base font-semibold text-gray-900">{cycle.name}</h3>
        <p className="text-sm text-gray-500 mt-1.5 flex-1">
          {cycle.minRequiredHours} required hours &middot; {cycle.minPeerHours} peer hours
        </p>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-4">
          <CalendarIcon />
          {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <StatusBadge status={cycle.status} />
          <ActionButtons cycle={cycle} onNavigate={onNavigate} onAction={onAction} />
        </div>
      </div>
    );
  }

  // List layout
  return (
    <div
      onClick={() => onNavigate(cycle)}
      className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-aps-blue/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900">{cycle.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {cycle.minRequiredHours} required hours &middot; {cycle.minPeerHours} peer hours
          </p>
        </div>
        <ActionButtons cycle={cycle} onNavigate={onNavigate} onAction={onAction} />
      </div>

      <div className="flex items-center gap-3 mt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarIcon />
          {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
        </span>
        <StatusBadge status={cycle.status} />
      </div>
    </div>
  );
}

export default function CycleList({ cycles, setCycles }) {
  const navigate = useNavigate();
  const [layout, setLayout] = useState('list');
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
  }

  function handleNavigate(cycle, mode) {
    if (mode === 'edit') {
      navigate(`/admin/cpd/cycles/${cycle.id}/edit`);
    } else {
      navigate(`/admin/cpd/cycles/${cycle.id}`);
    }
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">CPD Cycles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cycles.length} learning plan{cycles.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Layout toggle */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setLayout('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                layout === 'list'
                  ? 'bg-aps-blue text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <List size={14} strokeWidth={1.5} />
              List
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
                layout === 'grid'
                  ? 'bg-aps-blue text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={14} strokeWidth={1.5} />
              Grid
            </button>
          </div>
          <button
            onClick={() => navigate('/admin/cpd/cycles/new')}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Create new cycle
          </button>
        </div>
      </div>

      {cycles.length === 0 ? (
        <EmptyState message="No CPD cycles have been created yet." />
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cycles.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              layout="grid"
              onNavigate={handleNavigate}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cycles.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              layout="list"
              onNavigate={handleNavigate}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

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
