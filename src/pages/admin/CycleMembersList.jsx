import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Table2, List, LayoutGrid } from 'lucide-react';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

// US-209: View all member profiles related to a CPD Cycle (IT Admin only)

const PAGE_SIZE = 10;
const REG_STATUSES = ['General', 'Not Registered', 'Provisional', 'Non-Practising'];

// ─── Table columns ────────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
  { key: 'memberName', label: 'Member Name' },
  { key: 'memberNumber', label: 'Member Number' },
  {
    key: 'cpdExemption',
    label: 'CPD Exemption',
    render: (r) =>
      r.cpdExemption == null ? (
        <span className="text-gray-400">—</span>
      ) : (
        <StatusBadge status={r.cpdExemption ? 'Yes' : 'No'} />
      ),
  },
  {
    key: 'requirementsMet',
    label: 'Requirements Met',
    render: (r) =>
      r.requirementsMet == null ? (
        <span className="text-gray-400">—</span>
      ) : (
        <StatusBadge status={r.requirementsMet ? 'Yes' : 'No'} />
      ),
  },
];

// ─── Card component ───────────────────────────────────────────────────────────

function MemberCard({ member, layout, onView }) {
  const exemptionBadge =
    member.cpdExemption == null ? null : (
      <StatusBadge status={member.cpdExemption ? 'Yes' : 'No'} />
    );

  const reqMetBadge =
    member.requirementsMet == null ? null : (
      <StatusBadge status={member.requirementsMet ? 'Yes' : 'No'} />
    );

  if (layout === 'grid') {
    return (
      <div
        onClick={onView}
        className="cursor-pointer bg-white border border-gray-200 rounded-lg p-5 hover:border-aps-blue/50 hover:shadow-sm transition-all flex flex-col gap-3"
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">{member.memberName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{member.memberNumber}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-100 text-xs text-gray-500">
          {exemptionBadge && (
            <span className="flex items-center gap-1">Exemption: {exemptionBadge}</span>
          )}
          {reqMetBadge && (
            <span className="flex items-center gap-1">Requirements: {reqMetBadge}</span>
          )}
        </div>
      </div>
    );
  }

  // List layout
  return (
    <div
      onClick={onView}
      className="cursor-pointer bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-aps-blue/50 hover:shadow-sm transition-all flex items-center justify-between gap-4"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{member.memberName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{member.memberNumber}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
        {exemptionBadge && (
          <span className="flex items-center gap-1">Exemption: {exemptionBadge}</span>
        )}
        {reqMetBadge && (
          <span className="flex items-center gap-1">Requirements: {reqMetBadge}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CycleMembersList({ cycles, cpdProfiles }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [view, setView] = useState('table'); // 'table' | 'list' | 'grid'
  const [search, setSearch] = useState('');
  const [regFilter, setRegFilter] = useState('');
  const [exemptionFilter, setExemptionFilter] = useState('');
  const [cardPage, setCardPage] = useState(0);

  const cycle = cycles.find((c) => c.id === id);

  // Build member rows — one per member who has a cycleProfile for this cycle
  const members = useMemo(() => {
    return (cpdProfiles || [])
      .filter((p) => (p.cycleProfiles || []).some((cp) => cp.cycleId === id))
      .map((p) => {
        const cp = (p.cycleProfiles || []).find((cp) => cp.cycleId === id);
        return {
          id: p.id,
          memberName: p.memberName,
          memberNumber: p.memberNumber,
          boardRegistration: p.boardRegistration || '',
          aoPEs: p.aoPEs || [],
          cpdExemption: cp?.cpdExemption ?? null,
          requirementsMet: cp?.requirementsMet ?? null,
        };
      });
  }, [cpdProfiles, id]);

  // Apply filters
  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.memberName.toLowerCase().includes(q) &&
          !m.memberNumber.toLowerCase().includes(q)
        ) return false;
      }
      if (regFilter && m.boardRegistration !== regFilter) return false;
      if (exemptionFilter === 'yes' && m.cpdExemption !== true) return false;
      if (exemptionFilter === 'no' && m.cpdExemption !== false) return false;
      return true;
    });
  }, [members, search, regFilter, exemptionFilter]);

  const hasFilters = !!(search || regFilter || exemptionFilter);

  function clearFilters() {
    setSearch(''); setRegFilter(''); setExemptionFilter(''); setCardPage(0);
  }

  function handleFilterChange(setter) {
    return (e) => { setter(e.target.value); setCardPage(0); };
  }

  // CSV export — always available, always uses filtered rows
  function handleExport() {
    const header = TABLE_COLUMNS.map((c) => c.label).join(',');
    const csvRows = filtered.map((m) =>
      TABLE_COLUMNS.map((c) => {
        let val;
        if (c.key === 'cpdExemption') {
          val = m.cpdExemption == null ? '—' : m.cpdExemption ? 'Yes' : 'No';
        } else if (c.key === 'requirementsMet') {
          val = m.requirementsMet == null ? '—' : m.requirementsMet ? 'Yes' : 'No';
        } else if (c.key === 'aoPEs') {
          val = m.aoPEs.length === 0 ? '—' : m.aoPEs.join('; ');
        } else {
          val = m[c.key] ?? '—';
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [header, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `cycle-members-${id}.csv`; a.click();
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
          Showing {start}–{end} of {filtered.length} member{filtered.length !== 1 ? 's' : ''}
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
          <li>
            <Link to={`/admin/cpd/cycles/${id}`} className="text-aps-blue hover:underline">
              {cycle.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Members</li>
        </ol>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} strokeWidth={1.75} className="text-aps-blue" />
            <h1 className="text-xl font-semibold text-gray-900">
              Members — {cycle.name}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {hasFilters
              ? `${filtered.length} of ${members.length} members`
              : `${members.length} member${members.length !== 1 ? 's' : ''} enrolled in this cycle`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={cycle.status} />
          <Link
            to={`/admin/cpd/cycles/${id}`}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Cycle Details
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name or member number…"
          value={search}
          onChange={handleFilterChange(setSearch)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        />
        <select
          value={regFilter}
          onChange={handleFilterChange(setRegFilter)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue bg-white"
        >
          <option value="">All Reg. Statuses</option>
          {REG_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={exemptionFilter}
          onChange={handleFilterChange(setExemptionFilter)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue bg-white"
        >
          <option value="">All CPD Exemptions</option>
          <option value="yes">Exemption: Yes</option>
          <option value="no">Exemption: No</option>
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
      {members.length === 0 ? (
        <EmptyState message={`No member profiles are associated with the ${cycle.name} cycle.`} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No members match your current filters." />
      ) : view === 'table' ? (
        <DataTable
          columns={TABLE_COLUMNS}
          data={filtered}
          onRowClick={(m) => navigate(`/internal/cpd/profiles/${m.id}`)}
          emptyMessage="No members match your current filters."
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cardPageData.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                layout="grid"
                onView={() => navigate(`/internal/cpd/profiles/${m.id}`)}
              />
            ))}
          </div>
          <CardPagination />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {cardPageData.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                layout="list"
                onView={() => navigate(`/internal/cpd/profiles/${m.id}`)}
              />
            ))}
          </div>
          <CardPagination />
        </>
      )}
    </PageShell>
  );
}
