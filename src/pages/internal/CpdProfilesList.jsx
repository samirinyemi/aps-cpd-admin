import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table2, List, LayoutGrid, ShieldCheck, ShieldOff } from 'lucide-react';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useSelectedCycle } from '../../context/CycleContext';

const PAGE_SIZE = 10;

// ─── Card component ──────────────────────────────────────────────────────────

function ProfileCard({ row, layout, onView }) {
  const exemptBadge =
    row.cpdExemption == null ? null : (
      <StatusBadge status={row.cpdExemption ? 'Yes' : 'No'} />
    );

  const reqBadge =
    row.requirementsMet == null ? null : row.requirementsMet ? (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-status-open">
        <ShieldCheck size={12} strokeWidth={2} /> Met
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-status-closed">
        <ShieldOff size={12} strokeWidth={2} /> Not met
      </span>
    );

  if (layout === 'grid') {
    return (
      <div
        onClick={onView}
        className="cursor-pointer bg-white border border-gray-200 rounded-lg p-5 hover:border-aps-blue/50 hover:shadow-sm transition-all flex flex-col"
      >
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-900">{row.memberName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{row.memberNumber}</p>
        </div>
        <dl className="text-xs space-y-1.5 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">Grade</dt>
            <dd className="font-medium text-gray-900 text-right">{row.grade || '—'}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">CPD Cycle</dt>
            <dd className="font-medium text-gray-900 text-right truncate max-w-[140px]">{row.cpdCycle || '—'}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">Board Reg.</dt>
            <dd className="font-medium text-gray-900 text-right">{row.boardRegistration || '—'}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">Reg. Date</dt>
            <dd className="font-medium text-gray-900 text-right">{row.regDate || '—'}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">Learning Plan</dt>
            <dd className="font-medium text-gray-900 text-right">{row.learningPlanMethod || '—'}</dd>
          </div>
        </dl>
        {(exemptBadge || reqBadge) && (
          <div className="flex items-center gap-3 pt-3 mt-3 border-t border-gray-100 flex-wrap">
            {exemptBadge && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                Exemption: {exemptBadge}
              </span>
            )}
            {reqBadge && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                Requirements: {reqBadge}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // List layout
  return (
    <div
      onClick={onView}
      className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-aps-blue/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold text-gray-900">{row.memberName}</p>
            <span className="text-xs text-gray-400">·</span>
            <p className="text-xs text-gray-500">{row.memberNumber}</p>
            {row.grade && (
              <>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs font-medium text-gray-700">{row.grade}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            {row.cpdCycle && (
              <span><span className="text-gray-500">Cycle: </span><span className="font-medium text-gray-900">{row.cpdCycle}</span></span>
            )}
            {row.boardRegistration && (
              <span><span className="text-gray-500">Board Reg.: </span><span className="font-medium text-gray-900">{row.boardRegistration}</span></span>
            )}
            {row.regDate && (
              <span><span className="text-gray-500">Reg. Date: </span><span className="font-medium text-gray-900">{row.regDate}</span></span>
            )}
            {row.learningPlanMethod && (
              <span><span className="text-gray-500">Learning Plan: </span><span className="font-medium text-gray-900">{row.learningPlanMethod}</span></span>
            )}
            {exemptBadge && (
              <span className="flex items-center gap-1"><span className="text-gray-500">Exemption:</span> {exemptBadge}</span>
            )}
            {reqBadge && (
              <span className="flex items-center gap-1"><span className="text-gray-500">Requirements:</span> {reqBadge}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
  { key: 'memberName', label: 'Member Name' },
  { key: 'memberNumber', label: 'Number' },
  { key: 'grade', label: 'Grade' },
  { key: 'cpdCycle', label: 'CPD Cycle', render: (r) => <span>{r.cpdCycle ?? '—'}</span> },
  { key: 'boardRegistration', label: 'Board Reg.' },
  { key: 'regDate', label: 'Reg Date' },
  {
    key: 'cpdExemption',
    label: 'CPD Exemption',
    render: (r) => r.cpdExemption == null
      ? <span className="text-gray-400">—</span>
      : <StatusBadge status={r.cpdExemption ? 'Yes' : 'No'} />,
  },
  { key: 'learningPlanMethod', label: 'Learning Plan', render: (r) => <span>{r.learningPlanMethod ?? '—'}</span> },
  {
    key: 'requirementsMet',
    label: 'Req. Met',
    render: (r) => r.requirementsMet == null
      ? <span className="text-gray-400">—</span>
      : <StatusBadge status={r.requirementsMet ? 'Yes' : 'No'} />,
  },
];

export default function CpdProfilesList({ profiles }) {
  const navigate = useNavigate();
  const { selectedCycle } = useSelectedCycle();

  const [view, setView] = useState('table'); // 'table' | 'list' | 'grid'
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [regFilter, setRegFilter] = useState('');
  const [exemptionFilter, setExemptionFilter] = useState('');
  const [reqMetFilter, setReqMetFilter] = useState('');
  const [cardPage, setCardPage] = useState(0);

  // Flatten primary + cycle sub-profile into a display row
  const rows = useMemo(() => {
    return (profiles || []).map((p) => {
      const cp = (p.cycleProfiles || []).find((c) => c.cycleId === selectedCycle?.id) || null;
      return {
        id: p.id,
        memberName: p.memberName,
        memberNumber: p.memberNumber,
        grade: p.grade,
        boardRegistration: p.boardRegistration,
        regDate: p.regDate,
        cpdCycle: cp?.cpdCycle ?? null,
        cpdExemption: cp != null ? cp.cpdExemption : null,
        learningPlanMethod: cp?.learningPlanMethod ?? null,
        requirementsMet: cp != null ? cp.requirementsMet : null,
      };
    });
  }, [profiles, selectedCycle]);

  // Dropdown option lists derived from data
  const grades = useMemo(
    () => Array.from(new Set(rows.map((r) => r.grade).filter(Boolean))).sort(),
    [rows]
  );
  const regStatuses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.boardRegistration).filter(Boolean))).sort(),
    [rows]
  );

  // Shared filtered rows (used by all three views)
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.memberName.toLowerCase().includes(q) && !r.memberNumber.toLowerCase().includes(q)) return false;
      }
      if (gradeFilter && r.grade !== gradeFilter) return false;
      if (regFilter && r.boardRegistration !== regFilter) return false;
      if (exemptionFilter === 'yes' && r.cpdExemption !== true) return false;
      if (exemptionFilter === 'no' && r.cpdExemption !== false) return false;
      if (reqMetFilter === 'yes' && r.requirementsMet !== true) return false;
      if (reqMetFilter === 'no' && r.requirementsMet !== false) return false;
      return true;
    });
  }, [rows, search, gradeFilter, regFilter, exemptionFilter, reqMetFilter]);

  const hasFilters = !!(search || gradeFilter || regFilter || exemptionFilter || reqMetFilter);

  function clearFilters() {
    setSearch(''); setGradeFilter(''); setRegFilter('');
    setExemptionFilter(''); setReqMetFilter(''); setCardPage(0);
  }

  function handleFilterChange(setter) {
    return (e) => { setter(e.target.value); setCardPage(0); };
  }

  // CSV export — always available, always uses filtered rows
  function handleExport() {
    const header = TABLE_COLUMNS.map((c) => c.label).join(',');
    const csvRows = filtered.map((r) =>
      TABLE_COLUMNS.map((c) => {
        const val = c.key === 'cpdExemption'
          ? (r.cpdExemption == null ? '—' : r.cpdExemption ? 'Yes' : 'No')
          : c.key === 'requirementsMet'
          ? (r.requirementsMet == null ? '—' : r.requirementsMet ? 'Yes' : 'No')
          : (r[c.key] ?? '—');
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [header, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'cpd-profiles.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  // Card pagination
  const totalCardPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cardPageData = filtered.slice(cardPage * PAGE_SIZE, (cardPage + 1) * PAGE_SIZE);

  function CardPagination() {
    const start = filtered.length === 0 ? 0 : cardPage * PAGE_SIZE + 1;
    const end = Math.min((cardPage + 1) * PAGE_SIZE, filtered.length);
    return (
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>
          Showing {start}–{end} of {filtered.length} profile{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Page {cardPage + 1} of {totalCardPages}
          </span>
          <button
            disabled={cardPage === 0}
            onClick={() => setCardPage((p) => p - 1)}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            disabled={cardPage >= totalCardPages - 1}
            onClick={() => setCardPage((p) => p + 1)}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Member CPD Profiles</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {hasFilters ? `${filtered.length} of ${rows.length} profiles` : `${rows.length} profile${rows.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name or member number…"
          value={search}
          onChange={handleFilterChange(setSearch)}
          className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        />
        <select
          value={gradeFilter}
          onChange={handleFilterChange(setGradeFilter)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue bg-white"
        >
          <option value="">All Grades</option>
          {grades.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={regFilter}
          onChange={handleFilterChange(setRegFilter)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue bg-white"
        >
          <option value="">All Reg. Statuses</option>
          {regStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={exemptionFilter}
          onChange={handleFilterChange(setExemptionFilter)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue bg-white"
        >
          <option value="">CPD Exemption</option>
          <option value="yes">Exemption: Yes</option>
          <option value="no">Exemption: No</option>
        </select>
        <select
          value={reqMetFilter}
          onChange={handleFilterChange(setReqMetFilter)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue bg-white"
        >
          <option value="">Requirements Met</option>
          <option value="yes">Met</option>
          <option value="no">Not Met</option>
        </select>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Toolbar: Export CSV (left) + View toggle (right) */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
        >
          Export CSV
        </button>

        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
          <button
            onClick={() => setView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
              view === 'table' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            title="Table view"
          >
            <Table2 size={14} strokeWidth={1.5} /> Table
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
              view === 'list' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            title="List view"
          >
            <List size={14} strokeWidth={1.5} /> List
          </button>
          <button
            onClick={() => setView('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
              view === 'grid' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
            title="Grid view"
          >
            <LayoutGrid size={14} strokeWidth={1.5} /> Grid
          </button>
        </div>
      </div>

      {/* Content */}
      {rows.length === 0 ? (
        <EmptyState message="No member CPD profiles found." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No profiles match your current filters." />
      ) : view === 'table' ? (
        /* Table — receives pre-filtered data, no internal filter bar or export */
        <DataTable
          columns={TABLE_COLUMNS}
          data={filtered}
          onRowClick={(row) => navigate(`/internal/cpd/profiles/${row.id}`)}
          emptyMessage="No profiles match your current filters."
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cardPageData.map((row) => (
              <ProfileCard
                key={row.id}
                row={row}
                layout="grid"
                onView={() => navigate(`/internal/cpd/profiles/${row.id}`)}
              />
            ))}
          </div>
          <CardPagination />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {cardPageData.map((row) => (
              <ProfileCard
                key={row.id}
                row={row}
                layout="list"
                onView={() => navigate(`/internal/cpd/profiles/${row.id}`)}
              />
            ))}
          </div>
          <CardPagination />
        </>
      )}
    </PageShell>
  );
}
