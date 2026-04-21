import StatusBadge from './StatusBadge';
import SelectField from './SelectField';
import { useAuth } from '../context/AuthContext';
import { useSelectedCycle } from '../context/CycleContext';

// HLBR US-803: the selected CPD Cycle must be visible on every authenticated
// member page, with a selector that lists the member's cycles for the last
// 7 years sorted by start date descending. This sits below the GlobalNav and
// above the page content so switching affects the entire CPD surface at once.

export default function GlobalCycleBar() {
  const { role } = useAuth();
  const { availableCycles, selectedCycle, selectedCycleId, selectCycle } = useSelectedCycle();

  // Only show it for members; admins/internal users don't have a "selected" cycle.
  if (role !== 'Member') return null;
  if (!availableCycles || availableCycles.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 py-2.5 flex items-center gap-3 flex-wrap">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider shrink-0">
          CPD Cycle
        </label>
        <div className="w-64 min-w-[220px]">
          <SelectField
            value={selectedCycleId}
            onChange={(e) => selectCycle(e.target.value)}
          >
            {availableCycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.status !== 'Open' ? ` (${c.status})` : ''}
              </option>
            ))}
          </SelectField>
        </div>
        {selectedCycle && <StatusBadge status={selectedCycle.status} />}
        <p className="text-xs text-gray-500 ml-auto hidden sm:block">
          {selectedCycle?.status === 'Open'
            ? 'Logging and editing apply to this cycle.'
            : 'Viewing only — this cycle is not Open.'}
        </p>
      </div>
    </div>
  );
}
