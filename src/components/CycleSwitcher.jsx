import { useSelectedCycle } from '../context/CycleContext';

const STATUS_DOT = {
  Open:    'bg-status-open',
  Closed:  'bg-status-closed',
  Pending: 'bg-gray-400',
};

export default function CycleSwitcher({ className = '' }) {
  const { availableCycles, selectedCycleId, selectCycle } = useSelectedCycle();

  if (!availableCycles || availableCycles.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="shrink-0 text-xs font-medium text-gray-500 mr-1">Cycle</span>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {availableCycles.map((c) => {
          const isActive = c.id === selectedCycleId;
          return (
            <button
              key={c.id}
              onClick={() => selectCycle(c.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? 'bg-aps-blue text-white border-aps-blue shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-aps-blue/40 hover:text-aps-blue hover:bg-aps-blue-light/40'
              }`}
            >
              {/* Status dot for unselected; hidden when active (bg already shows it) */}
              {!isActive && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[c.status] || 'bg-gray-400'}`} />
              )}
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
