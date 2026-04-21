import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import LogCpdModal from '../../components/LogCpdModal';
import ConfirmDialog from '../../components/ConfirmDialog';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDuration(h, m) {
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
}

function memberName(p) {
  return `${p.member.title ? p.member.title + ' ' : ''}${p.member.firstName} ${p.member.lastName}`.trim();
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 3.5a2.12 2.12 0 013 3L7 17l-4 1 1-4L14.5 3.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h12M8 6V4h4v2m1 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V6" />
    </svg>
  );
}

function ActivityCard({ row, layout, onOpen, onEdit, onDelete }) {
  const duration = formatDuration(row.hours, row.minutes);
  const stop = (e) => { e.stopPropagation(); };

  const actions = (
    <div className="flex items-center gap-1" onClick={stop}>
      <button
        type="button"
        onClick={(e) => { stop(e); onEdit(); }}
        className="p-1.5 rounded text-aps-blue hover:bg-aps-blue-light"
        title="Edit"
      >
        <EditIcon />
      </button>
      <button
        type="button"
        onClick={(e) => { stop(e); onDelete(); }}
        className="p-1.5 rounded text-red-500 hover:bg-red-50"
        title="Delete"
      >
        <TrashIcon />
      </button>
    </div>
  );

  if (layout === 'grid') {
    return (
      <div
        onClick={onOpen}
        className="cursor-pointer text-left bg-white border border-gray-200 rounded-lg p-5 hover:border-aps-blue/50 hover:shadow-sm transition"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{row.memberName}</p>
            <p className="text-xs text-gray-500 truncate">{row.memberNumber}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-aps-blue/10 text-aps-blue">CPD</span>
          </div>
        </div>
        <dl className="text-xs text-gray-600 space-y-1.5 mb-3">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">Program</dt>
            <dd className="font-medium text-gray-900 truncate">{row.areaOfPractice}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">Completed</dt>
            <dd className="font-medium text-gray-900">{formatDate(row.completionDate)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">Duration</dt>
            <dd className="font-medium text-gray-900">{duration}</dd>
          </div>
        </dl>
        {row.description && (
          <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 border border-gray-100 rounded p-2 mb-3">
            {row.description}
          </p>
        )}
        <div className="flex justify-end">{actions}</div>
      </div>
    );
  }

  // list layout
  return (
    <div
      onClick={onOpen}
      className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-aps-blue/50 hover:shadow-sm transition flex items-center gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{row.memberName}</p>
          <span className="text-xs text-gray-400">·</span>
          <p className="text-xs text-gray-500">{row.memberNumber}</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-aps-blue/10 text-aps-blue ml-2 shrink-0">
            CPD
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span><span className="text-gray-500">Program:</span> <span className="font-medium text-gray-900">{row.areaOfPractice}</span></span>
          <span><span className="text-gray-500">Completed:</span> <span className="font-medium text-gray-900">{formatDate(row.completionDate)}</span></span>
          <span><span className="text-gray-500">Duration:</span> <span className="font-medium text-gray-900">{duration}</span></span>
        </div>
        {row.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">{row.description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}

export default function LogCPD({ programs, setPrograms }) {
  const navigate = useNavigate();
  const [logOpen, setLogOpen] = useState(false);
  const [editActivity, setEditActivity] = useState(null); // activity being edited (with programId)
  const [detailRow, setDetailRow] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { programId, activityId, memberName }
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [layout, setLayout] = useState('list');

  const rows = useMemo(() => {
    const out = [];
    (programs || []).forEach((p) => {
      (p.activities || [])
        .filter((a) => a.activityType === 'CPD')
        .forEach((a) => {
          out.push({
            ...a,
            programId: p.id,
            programStatus: p.status,
            memberName: memberName(p),
            memberNumber: p.memberNumber,
            areaOfPractice: p.areaOfPractice,
          });
        });
    });
    return out.sort((a, b) => (b.completionDate || '').localeCompare(a.completionDate || ''));
  }, [programs]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (programFilter && r.programId !== programFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${r.memberName} ${r.memberNumber} ${r.areaOfPractice} ${r.description || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, programFilter]);

  // Keep detailRow in sync if underlying activity changes (edit)
  const liveDetail = useMemo(() => {
    if (!detailRow) return null;
    return rows.find((r) => r.id === detailRow.id) || null;
  }, [detailRow, rows]);

  function handleSave(programId, activity, meta = {}) {
    const { isEdit, previousProgramId } = meta;
    setPrograms((prev) =>
      prev.map((p) => {
        // Remove from previous program if it changed
        if (isEdit && previousProgramId && previousProgramId !== programId && p.id === previousProgramId) {
          return { ...p, activities: (p.activities || []).filter((a) => a.id !== activity.id) };
        }
        if (p.id !== programId) return p;
        const existing = p.activities || [];
        if (isEdit && existing.some((a) => a.id === activity.id)) {
          return { ...p, activities: existing.map((a) => (a.id === activity.id ? activity : a)) };
        }
        return { ...p, activities: [...existing, activity] };
      })
    );
    setLogOpen(false);
    setEditActivity(null);
  }

  function openEdit(row) {
    setDetailRow(null);
    setEditActivity({ ...row }); // carries programId
  }

  function askDelete(row) {
    setDetailRow(null);
    setConfirmDelete({
      programId: row.programId,
      activityId: row.id,
      memberName: row.memberName,
    });
  }

  function confirmDeleteNow() {
    if (!confirmDelete) return;
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === confirmDelete.programId
          ? { ...p, activities: (p.activities || []).filter((a) => a.id !== confirmDelete.activityId) }
          : p
      )
    );
    setConfirmDelete(null);
  }

  const hasOpenPrograms = (programs || []).some((p) => p.status === 'Open');

  return (
    <PageShell>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Log CPD Hours</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {rows.length} CPD {rows.length === 1 ? 'activity' : 'activities'} logged against registrar programs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setLayout('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                layout === 'list' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
              </svg>
              List
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
                layout === 'grid' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
              </svg>
              Grid
            </button>
          </div>
          <button
            type="button"
            onClick={() => setLogOpen(true)}
            disabled={!hasOpenPrograms}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
            title={hasOpenPrograms ? '' : 'No Open registrar programs available'}
          >
            Log CPD Hours
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Member, number, AoPE, or description…"
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Registrar Program</label>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            >
              <option value="">All programs</option>
              {(programs || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {memberName(p)} — {p.areaOfPractice}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Cards */}
      {filtered.length === 0 ? (
        <section className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center">
          {rows.length === 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-1">No CPD activities logged yet.</p>
              <p className="text-xs text-gray-400">
                Click <span className="font-medium">Log CPD Hours</span> above to record your first activity.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No activities match your filters.</p>
          )}
        </section>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <ActivityCard
              key={r.id}
              row={r}
              layout="grid"
              onOpen={() => setDetailRow(r)}
              onEdit={() => openEdit(r)}
              onDelete={() => askDelete(r)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <ActivityCard
              key={r.id}
              row={r}
              layout="list"
              onOpen={() => setDetailRow(r)}
              onEdit={() => openEdit(r)}
              onDelete={() => askDelete(r)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <LogCpdModal
        open={logOpen}
        program={null}
        programs={programs}
        onSave={handleSave}
        onCancel={() => setLogOpen(false)}
      />

      {/* Edit modal */}
      <LogCpdModal
        open={Boolean(editActivity)}
        program={null}
        programs={programs}
        activity={editActivity}
        onSave={handleSave}
        onCancel={() => setEditActivity(null)}
      />

      {/* View modal */}
      {liveDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailRow(null)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">CPD Activity</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-aps-blue/10 text-aps-blue">CPD</span>
                </div>
                <p className="text-sm text-gray-500">Logged against a registrar program</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            <dl className="space-y-3.5 mb-6">
              <div>
                <dt className="text-xs text-gray-500">Member</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">
                  {liveDetail.memberName} <span className="text-gray-400 font-normal">· {liveDetail.memberNumber}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Registrar Program (AoPE)</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{liveDetail.areaOfPractice}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Completion Date</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(liveDetail.completionDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Duration</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatDuration(liveDetail.hours, liveDetail.minutes)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Activity Description</dt>
                <dd className="text-sm text-gray-900 mt-0.5 bg-gray-50 border border-gray-100 rounded-md p-3 whitespace-pre-wrap">
                  {liveDetail.description || <span className="text-gray-400">No description provided.</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Allocation</dt>
                <dd className="text-sm text-gray-900 mt-0.5">
                  Counts toward this program's CPD requirement under <span className="font-medium">{liveDetail.areaOfPractice}</span>.
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const id = liveDetail.programId;
                  setDetailRow(null);
                  navigate(`/admin/registrar/programs/${id}`);
                }}
                className="text-xs font-medium text-aps-blue hover:underline"
              >
                Open registrar program →
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => askDelete(liveDetail)}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(liveDetail)}
                  className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete CPD Activity"
        message={confirmDelete ? `Delete this CPD activity for ${confirmDelete.memberName}? This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageShell>
  );
}
