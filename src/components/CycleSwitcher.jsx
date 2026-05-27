import { useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useSelectedCycle } from '../context/CycleContext';

const STATUS_DOT = {
  Open:    'bg-status-open',
  Closed:  'bg-status-closed',
  Pending: 'bg-gray-400',
};

const STATUS_PILL = {
  Open:    'bg-status-open-bg text-status-open border-status-open/30',
  Closed:  'bg-status-closed-bg text-status-closed border-status-closed/30',
  Pending: 'bg-gray-100 text-gray-500 border-gray-200',
};

function formatDateRange(startDate, endDate) {
  function fmt(d) {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export default function CycleSwitcher({ className = '', variant = 'default' }) {
  const { availableCycles, selectedCycle, selectedCycleId, selectCycle } = useSelectedCycle();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(null); // id being considered inside modal

  if (!availableCycles || availableCycles.length === 0) return null;

  function openModal() {
    setPending(selectedCycleId); // pre-select current
    setOpen(true);
  }

  function handleSwitch() {
    if (pending && pending !== selectedCycleId) selectCycle(pending);
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
    setPending(null);
  }

  const pendingCycle = availableCycles.find((c) => c.id === pending);
  const unchanged = pending === selectedCycleId;

  const isNav = variant === 'nav';

  return (
    <>
      {/* Trigger button */}
      <div className={`inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={openModal}
          className={
            isNav
              ? 'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-white/15 border border-white/30 rounded-md hover:bg-white/25 hover:border-white/50 transition-colors'
              : 'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:border-aps-blue/50 hover:text-aps-blue hover:bg-aps-blue-light/30 transition-colors'
          }
        >
          {selectedCycle && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[selectedCycle.status] || 'bg-gray-400'}`} />
          )}
          <span>{selectedCycle?.name ?? 'Select cycle'}</span>
          <ChevronDown size={14} strokeWidth={1.75} className={isNav ? 'text-white/60 shrink-0' : 'text-gray-400 shrink-0'} />
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-0.5">
                <RefreshCw size={16} strokeWidth={1.75} className="text-aps-blue shrink-0" />
                <h3 className="text-base font-semibold text-gray-900">Switch CPD Cycle</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Select a cycle to filter the view. The selection is shared across all pages.
              </p>
            </div>

            {/* Cycle list */}
            <ul className="px-4 py-3 space-y-2 max-h-72 overflow-y-auto">
              {availableCycles.map((c) => {
                const isSelected = c.id === pending;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setPending(c.id)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-aps-blue bg-aps-blue-light/40'
                          : 'border-gray-100 bg-gray-50/50 hover:border-aps-blue/30 hover:bg-aps-blue-light/20'
                      }`}
                    >
                      {/* Radio indicator */}
                      <span className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-aps-blue' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-aps-blue" />}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDateRange(c.startDate, c.endDate)}</p>
                      </div>

                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_PILL[c.status] || STATUS_PILL.Pending}`}>
                        {c.status}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400 min-w-0 truncate">
                {pendingCycle && !unchanged
                  ? `Switching to ${pendingCycle.name}`
                  : unchanged
                    ? 'Currently viewing this cycle'
                    : ''}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSwitch}
                  disabled={unchanged}
                  className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Switch CPD cycle
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
