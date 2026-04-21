import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Global state for the member's selected CPD Cycle per HLBR US-803:
// "I want to know the CPD Cycle wherever I am when using the PD tool."
//
// Every authenticated member page reads the selected cycle from this context,
// and all logging / filtering actions are scoped to the same selection so
// switching once reflects everywhere.
const CycleContext = createContext(null);

function readStored() {
  try { return localStorage.getItem('aps-selected-cycle') || ''; } catch { return ''; }
}

export function CycleProvider({ children, cycles = [] }) {
  const [rawSelectedId, setRawSelectedId] = useState(() => readStored());

  // Default selection = most current Open cycle, else most recent by start date.
  const defaultCycle = useMemo(() => {
    if (!cycles || cycles.length === 0) return null;
    const open = cycles.find((c) => c.status === 'Open');
    if (open) return open;
    return [...cycles].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))[0];
  }, [cycles]);

  // If stored id is stale (doesn't match any cycle), fall back to default.
  const selectedCycleId = useMemo(() => {
    if (rawSelectedId && cycles.find((c) => c.id === rawSelectedId)) return rawSelectedId;
    return defaultCycle?.id || '';
  }, [rawSelectedId, cycles, defaultCycle]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || null;

  // Keep storage in sync when effective selection changes (e.g. stale id fell back).
  useEffect(() => {
    try {
      if (selectedCycleId) localStorage.setItem('aps-selected-cycle', selectedCycleId);
    } catch {}
  }, [selectedCycleId]);

  function selectCycle(id) {
    setRawSelectedId(id);
    try { localStorage.setItem('aps-selected-cycle', id); } catch {}
  }

  // HLBR US-803: selector list covers the last 7 years of cycles,
  // sorted by CPD Start Date descending. Pending cycles are included so
  // members can see upcoming windows, but only the Open one is editable
  // (enforced on individual pages via selectedCycle.status).
  const availableCycles = useMemo(() => {
    const SEVEN_YEARS_MS = 7 * 365 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - SEVEN_YEARS_MS);
    return [...cycles]
      .filter((c) => new Date(c.startDate || 0) >= cutoff)
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  }, [cycles]);

  return (
    <CycleContext.Provider value={{ cycles, availableCycles, selectedCycle, selectedCycleId, selectCycle }}>
      {children}
    </CycleContext.Provider>
  );
}

export function useSelectedCycle() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useSelectedCycle must be used within a CycleProvider');
  return ctx;
}
