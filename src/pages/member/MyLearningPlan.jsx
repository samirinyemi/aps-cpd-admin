import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, List, LayoutGrid, MonitorCheck, FolderOpen } from 'lucide-react';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LearningNeedFormModal from '../../components/LearningNeedFormModal';
import { useAuth } from '../../context/AuthContext';

// HLBR §3.4.6 Manage Learning Plan — US-701 to US-706.
// US-701: Show documentation method selector on load; only show learning
//         needs if method = PD Tool. Redirect if board reg = Provisional/Non-Practicing.
// US-702: Toggle/auto-save the documentation method without submitting reviews.
// US-703: List learning needs (PD Tool only).
// US-704/705: Add / edit learning needs.
// US-706: Delete learning needs with confirmation.

// Board registration types that exempt a member from logging via the PD Tool.
// Per US-701: redirect if profile status = Pending OR board reg not General/Not Registered.
const EXEMPT_REGISTRATIONS = ['Provisional', 'Non-Practicing'];

function StatusChip({ status }) {
  const cls =
    status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200'
    : status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${cls}`}>{status || 'Not Started'}</span>;
}

function PriorityChip({ priority }) {
  const p = priority || 'Medium';
  const cls =
    p === 'High' ? 'bg-red-50 text-red-700 border-red-200'
    : p === 'Low' ? 'bg-gray-50 text-gray-600 border-gray-200'
    : 'bg-sky-50 text-sky-700 border-sky-200';
  return <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${cls}`}>{p} priority</span>;
}

const EditIcon  = () => <Pencil size={14} strokeWidth={1.5} />;
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
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusChip status={need.status} />
            <PriorityChip priority={need.priority} />
          </div>
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
          <PriorityChip priority={need.priority} />
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

  // US-701: Redirect if board registration exempts member from PD Tool logging.
  useEffect(() => {
    if (profile && EXEMPT_REGISTRATIONS.includes(profile.boardRegistration)) {
      navigate('/member/cpd/profile', { replace: true });
    }
  }, [profile, navigate]);

  // US-701/702: Local documentation method state — auto-saved on change.
  const [docMethod, setDocMethod] = useState(
    () => profile?.learningPlanMethod || 'PD Tool'
  );

  const [layout, setLayout] = useState('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  useEffect(() => { setPage(1); }, [layout, docMethod]);

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

  // US-702: Auto-save method change — no review submission required.
  function handleMethodChange(method) {
    setDocMethod(method);
    persistProfile({ learningPlanMethod: method });
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

  const isPDTool = docMethod === 'PD Tool';
  const needs = profile.learningNeeds || [];

  return (
    <PageShell>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manage Learning Plan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Record your planned learning activities and goals for this CPD cycle.
          </p>
        </div>
        {isPDTool && (
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setLayout('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${layout === 'list' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <List size={14} /> List
              </button>
              <button
                onClick={() => setLayout('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${layout === 'grid' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <LayoutGrid size={14} /> Grid
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
        )}
      </div>

      {/* ── US-701/702: Documentation method selector ───────────────────── */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          Learning Plan Documentation Method
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          How are you documenting your learning plan this cycle? Your selection is saved automatically.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option A: Offline */}
          <button
            type="button"
            onClick={() => handleMethodChange('Offline')}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${
              docMethod === 'Offline'
                ? 'border-aps-blue bg-aps-blue-light/40'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FolderOpen
              size={20}
              strokeWidth={1.5}
              className={`shrink-0 mt-0.5 ${docMethod === 'Offline' ? 'text-aps-blue' : 'text-gray-400'}`}
            />
            <div>
              <p className={`text-sm font-semibold ${docMethod === 'Offline' ? 'text-aps-blue' : 'text-gray-800'}`}>
                Offline
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                I have documented my learning plan elsewhere so I will not use the system.
              </p>
            </div>
            {docMethod === 'Offline' && (
              <span className="ml-auto shrink-0 text-[10px] font-semibold text-aps-blue bg-aps-blue/10 px-2 py-0.5 rounded-full">
                Selected
              </span>
            )}
          </button>

          {/* Option B: PD Tool */}
          <button
            type="button"
            onClick={() => handleMethodChange('PD Tool')}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${
              isPDTool
                ? 'border-aps-blue bg-aps-blue-light/40'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <MonitorCheck
              size={20}
              strokeWidth={1.5}
              className={`shrink-0 mt-0.5 ${isPDTool ? 'text-aps-blue' : 'text-gray-400'}`}
            />
            <div>
              <p className={`text-sm font-semibold ${isPDTool ? 'text-aps-blue' : 'text-gray-800'}`}>
                PD Tool
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                I will use the online system to document my learning plan.
              </p>
            </div>
            {isPDTool && (
              <span className="ml-auto shrink-0 text-[10px] font-semibold text-aps-blue bg-aps-blue/10 px-2 py-0.5 rounded-full">
                Selected
              </span>
            )}
          </button>
        </div>
      </section>

      {/* ── US-703: Learning needs (PD Tool only) ───────────────────────── */}
      {isPDTool ? (
        needs.length === 0 ? (
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
        })()
      ) : (
        /* US-701: Offline message — learning needs hidden */
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FolderOpen size={32} strokeWidth={1} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Your learning plan is documented outside this system.
          </p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You've indicated that your learning plan is kept elsewhere. If you'd like to manage
            it here instead, select <span className="font-medium">PD Tool</span> above.
          </p>
        </section>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <LearningNeedFormModal
        open={formOpen}
        existingNeed={editingNeed}
        onSave={handleSaveNeed}
        onCancel={() => { setFormOpen(false); setEditingNeed(null); }}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete learning need"
        message={
          confirmDelete
            ? `Delete "${confirmDelete.title || confirmDelete.need}"? This removes its reviews too and cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageShell>
  );
}
