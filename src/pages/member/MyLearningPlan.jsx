import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, List, LayoutGrid } from 'lucide-react';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LearningNeedFormModal from '../../components/LearningNeedFormModal';
import { useAuth } from '../../context/AuthContext';

// HLBR §3.4.6 Manage Learning Plan — US-701 to US-706.
// Card-based list with list/grid toggle, per-row edit + delete, add modal,
// and click-through to the learning need detail page.

function StatusChip({ status }) {
  const cls =
    status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200'
    : status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${cls}`}>{status || 'Not Started'}</span>;
}

const EditIcon = () => <Pencil size={14} strokeWidth={1.5} />;
const TrashIcon = () => <Trash2 size={14} strokeWidth={1.5} />;

function NeedCard({ need, layout, onOpen, onEdit, onDelete }) {
  const stop = (e) => e.stopPropagation();
  const actions = (
    <div className="flex items-center gap-1" onClick={stop}>
      <button type="button" onClick={(e) => { stop(e); onEdit(); }} className="p-1.5 rounded text-aps-blue hover:bg-aps-blue-light" title="Edit"><EditIcon /></button>
      <button type="button" onClick={(e) => { stop(e); onDelete(); }} className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Delete"><TrashIcon /></button>
    </div>
  );

  if (layout === 'grid') {
    return (
      <div onClick={onOpen} className="cursor-pointer bg-white border border-gray-200 rounded-lg p-5 hover:border-aps-blue/50 hover:shadow-sm transition">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{need.title || need.need}</p>
            <p className="text-xs text-gray-500 mt-1">{need.proposedDate || '—'}</p>
          </div>
          <StatusChip status={need.status} />
        </div>
        {need.description && (
          <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 border border-gray-100 rounded p-2 mb-3">{need.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{(need.reviews || []).length} review{(need.reviews || []).length === 1 ? '' : 's'}</span>
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onOpen} className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-aps-blue/50 hover:shadow-sm transition flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{need.title || need.need}</p>
          <StatusChip status={need.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span><span className="text-gray-500">Proposed:</span> <span className="font-medium text-gray-900">{need.proposedDate || '—'}</span></span>
          <span><span className="text-gray-500">Reviews:</span> <span className="font-medium text-gray-900">{(need.reviews || []).length}</span></span>
        </div>
        {need.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{need.description}</p>}
      </div>
      {actions}
    </div>
  );
}

export default function MyLearningPlan({ cpdProfiles, setCpdProfiles }) {
  const { member } = useAuth();
  const navigate = useNavigate();
  const profile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  const [layout, setLayout] = useState('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState(null); // null when adding
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  useEffect(() => { setPage(1); }, [layout]);

  if (!profile) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">No CPD profile found.</p>
          <Link to="/member/cpd" className="text-aps-blue hover:underline text-sm">Back to CPD Summary</Link>
        </div>
      </PageShell>
    );
  }

  function persistProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) => (p.memberNumber === profile.memberNumber ? { ...p, ...patch } : p))
    );
  }

  function handleSaveNeed(payload) {
    const existing = profile.learningNeeds || [];
    const isEdit = existing.some((n) => n.id === payload.id);
    persistProfile({
      learningNeeds: isEdit
        ? existing.map((n) => (n.id === payload.id ? payload : n))
        : [...existing, payload],
    });
    setFormOpen(false);
    setEditingNeed(null);
  }

  function handleDelete() {
    if (!confirmDelete) return;
    persistProfile({
      learningNeeds: (profile.learningNeeds || []).filter((n) => n.id !== confirmDelete.id),
    });
    setConfirmDelete(null);
  }

  const needs = profile.learningNeeds || [];

  return (
    <PageShell>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manage Learning Plan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Record your planned learning activities and goals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button onClick={() => setLayout('list')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${layout === 'list' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                <List size={14} />
                List
              </button>
              <button onClick={() => setLayout('grid')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${layout === 'grid' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                <LayoutGrid size={14} />
                Grid
              </button>
            </div>
          <button
            type="button"
            onClick={() => { setEditingNeed(null); setFormOpen(true); }}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Add learning need
          </button>
        </div>
      </div>

      {needs.length === 0 ? (
        <section className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center">
          <p className="text-sm text-gray-500 mb-2">No learning needs recorded yet.</p>
          <p className="text-xs text-gray-400 mb-4">Capture the outcomes you want to achieve this cycle.</p>
          <button
            type="button"
            onClick={() => { setEditingNeed(null); setFormOpen(true); }}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Add your first learning need
          </button>
        </section>
      ) : (() => {
        // Paginated rendering — 10 per page per client spec.
        const totalPages = Math.max(1, Math.ceil(needs.length / PAGE_SIZE));
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageItems = needs.slice(start, start + PAGE_SIZE);
        const windowStart = start + 1;
        const windowEnd = start + pageItems.length;
        return (
          <>
            {layout === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pageItems.map((n) => (
                  <NeedCard
                    key={n.id}
                    need={n}
                    layout="grid"
                    onOpen={() => navigate(`/member/cpd/learning-plan/${n.id}`)}
                    onEdit={() => { setEditingNeed(n); setFormOpen(true); }}
                    onDelete={() => setConfirmDelete(n)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pageItems.map((n) => (
                  <NeedCard
                    key={n.id}
                    need={n}
                    layout="list"
                    onOpen={() => navigate(`/member/cpd/learning-plan/${n.id}`)}
                    onEdit={() => { setEditingNeed(n); setFormOpen(true); }}
                    onDelete={() => setConfirmDelete(n)}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3 flex-wrap text-xs text-gray-600">
              <span>
                Showing <span className="font-medium text-gray-900">{windowStart}</span>–<span className="font-medium text-gray-900">{windowEnd}</span>
                {' '}of <span className="font-medium text-gray-900">{needs.length}</span>
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1}
                    className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">‹‹</button>
                  <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">‹ Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} type="button" onClick={() => setPage(n)}
                      className={`min-w-[32px] px-2 py-1 rounded border text-sm ${n === currentPage ? 'border-aps-blue bg-aps-blue text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{n}</button>
                  ))}
                  <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next ›</button>
                  <button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">››</button>
                </div>
              )}
            </div>
          </>
        );
      })()}

      <LearningNeedFormModal
        open={formOpen}
        existingNeed={editingNeed}
        onSave={handleSaveNeed}
        onCancel={() => { setFormOpen(false); setEditingNeed(null); }}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete learning need"
        message={confirmDelete ? `Delete "${confirmDelete.title || confirmDelete.need}"? This removes its reviews too and cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageShell>
  );
}
