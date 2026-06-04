import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, List, LayoutGrid, MonitorCheck, FolderOpen, ChevronRight } from 'lucide-react';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LearningNeedFormModal from '../../components/LearningNeedFormModal';
import { useAuth } from '../../context/AuthContext';
import { useSelectedCycle } from '../../context/CycleContext';

// HLBR §3.4.6 Manage Learning Plan — US-701 to US-707.
//
// US-701: On load, redirect if:
//   a) Selected CPD Cycle = Pending (no open program to log against), OR
//   b) Board Registration = Provisional or Non-Practicing (exempt from tool).
//   Otherwise show three sections:
//     1. Learning plan documentation method selector
//     2. List of learning needs  (only when method = PD Tool)
//     3. Review of learning plan (only when method = PD Tool) ← US-707
//
// US-702: Toggle documentation method auto-saves — no review submission needed.
// US-703: List learning needs with 4 spec fields.
// US-704/705: Add / edit learning needs (4 mandatory fields).
// US-706: Delete learning needs with confirmation.
// US-707: Submit / edit one plan-level review per cycle
//         (Review date within cycle period + Outcomes achieved ≤ 250 chars).

const EXEMPT_REGISTRATIONS = ['Provisional', 'Non-Practicing'];

// ─── Learning need card (list + grid variants) ─────────────────────────────
function NeedCard({ need, layout, onOpen, onEdit, onDelete, readOnly }) {
  const stop = (e) => e.stopPropagation();

  // Resolve field aliases — old records use title/description, new ones use need/activitiesProposed
  const needTitle        = need.need || need.title || '—';
  const activitiesText   = need.activitiesProposed || need.description || '';
  const proposedDate     = need.proposedDate || '—';
  const anticipatedText  = need.anticipatedOutcome || '';

  const actions = readOnly ? null : (
    <div className="flex items-center gap-1 shrink-0" onClick={stop}>
      <button
        type="button"
        onClick={(e) => { stop(e); onEdit(); }}
        className="p-1.5 rounded text-aps-blue hover:bg-aps-blue-light"
        title="Edit"
      >
        <Pencil size={14} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={(e) => { stop(e); onDelete(); }}
        className="p-1.5 rounded text-red-500 hover:bg-red-50"
        title="Delete"
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </div>
  );

  if (layout === 'grid') {
    return (
      <div
        onClick={onOpen}
        className="cursor-pointer bg-white border border-gray-200 rounded-lg p-5 hover:border-aps-blue/50 hover:shadow-sm transition"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-sm font-semibold text-gray-900 leading-snug min-w-0">{needTitle}</p>
          {actions}
        </div>

        {activitiesText && (
          <p className="text-xs text-gray-600 line-clamp-2 mt-2 mb-1">{activitiesText}</p>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-400 mb-0.5">Proposed dates</p>
            <p className="text-gray-700 font-medium">{proposedDate}</p>
          </div>
          {anticipatedText && (
            <div>
              <p className="text-gray-400 mb-0.5">Anticipated outcomes</p>
              <p className="text-gray-700 line-clamp-2">{anticipatedText}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List layout
  return (
    <div
      onClick={onOpen}
      className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-aps-blue/50 hover:shadow-sm transition flex items-start gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{needTitle}</p>
        </div>

        <div className="flex flex-wrap items-start gap-x-5 gap-y-1 text-xs text-gray-600 mt-1">
          <span>
            <span className="text-gray-400">Proposed dates: </span>
            <span className="font-medium text-gray-800">{proposedDate}</span>
          </span>
          {activitiesText && (
            <span className="line-clamp-1">
              <span className="text-gray-400">Activities: </span>
              {activitiesText}
            </span>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function MyLearningPlan({ cpdProfiles, setCpdProfiles }) {
  const { member } = useAuth();
  const navigate   = useNavigate();
  const { selectedCycle } = useSelectedCycle();

  // Step 1: find primary member profile (by memberNumber only)
  const memberProfile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  // Step 2: find cycle sub-profile (by cycleId)
  const cycleProfile = useMemo(
    () => memberProfile?.cycleProfiles?.find((cp) => cp.cycleId === selectedCycle?.id) || null,
    [memberProfile, selectedCycle]
  );

  // ── US-701: Redirect gates ───────────────────────────────────────────────
  useEffect(() => {
    if (!cycleProfile) return;
    // Gate B: board registration type is exempt from the PD tool
    if (EXEMPT_REGISTRATIONS.includes(memberProfile?.boardRegistration)) {
      navigate('/member/cpd/profile', { replace: true });
    }
  }, [cycleProfile, memberProfile, navigate]);

  // ── US-701/702: Documentation method ────────────────────────────────────
  // Derived directly from cycleProfile so it always reflects the selected cycle,
  // even when the user switches cycles without unmounting this component.
  const docMethod = cycleProfile?.learningPlanMethod || 'PD Tool';

  // ── Learning needs list state ────────────────────────────────────────────
  const [layout,        setLayout]       = useState('list');
  const [formOpen,      setFormOpen]     = useState(false);
  const [editingNeed,   setEditingNeed]  = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => { setPage(1); }, [layout, docMethod]);

  // ── Guard: no profile ────────────────────────────────────────────────────
  if (!memberProfile || !cycleProfile) {
    return (
      <PageShell>
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-3">No CPD profile found for the selected cycle.</p>
          <Link to="/member/cpd" className="text-aps-blue hover:underline text-sm">
            Go to My CPD
          </Link>
        </div>
      </PageShell>
    );
  }

  // ── Persist helper ───────────────────────────────────────────────────────
  function persistCycleProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.id === memberProfile.id
          ? {
              ...p,
              cycleProfiles: (p.cycleProfiles || []).map((cp) =>
                cp.id === cycleProfile.id ? { ...cp, ...patch } : cp
              ),
            }
          : p
      )
    );
  }

  // ── Learning needs CRUD ──────────────────────────────────────────────────
  function handleSaveNeed(payload) {
    const existing = cycleProfile.learningNeeds || [];
    const isEdit = existing.some((n) => n.id === payload.id);
    persistCycleProfile({
      learningNeeds: isEdit
        ? existing.map((n) => (n.id === payload.id ? payload : n))
        : [...existing, payload],
    });
    setFormOpen(false);
    setEditingNeed(null);
  }

  function handleDelete() {
    if (!confirmDelete) return;
    persistCycleProfile({
      learningNeeds: (cycleProfile.learningNeeds || []).filter((n) => n.id !== confirmDelete.id),
    });
    setConfirmDelete(null);
  }

  const isPDTool   = docMethod === 'PD Tool';
  const isOpen     = selectedCycle?.status === 'Open';
  const needs      = cycleProfile.learningNeeds || [];
  const hasReview  = (cycleProfile.learningPlanReviews || []).length > 0;

  return (
    <PageShell>
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Learning Plan</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Record your planned learning activities and goals for this CPD cycle.
        </p>
      </div>

      {/* ── Plan Details summary card ──────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Documentation method */}
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1.5">Documentation</p>
              <div className="flex items-center gap-1.5">
                {isPDTool
                  ? <MonitorCheck size={14} strokeWidth={1.5} className="text-aps-blue" />
                  : <FolderOpen   size={14} strokeWidth={1.5} className="text-gray-500" />
                }
                <span className="text-sm font-semibold text-gray-900">{docMethod}</span>
              </div>
            </div>

            {/* Review status */}
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1.5">Review</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                hasReview
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {hasReview ? 'Submitted' : 'Not submitted'}
              </span>
            </div>
          </div>

          <Link
            to="/member/cpd/learning-plan/details"
            className="flex items-center gap-1 text-sm font-medium text-aps-blue hover:underline shrink-0"
          >
            View plan details
            <ChevronRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* ── Learning needs ─────────────────────────────────────────────── */}
      {isPDTool && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Learning needs</h2>
              <p className="text-xs text-gray-500 mt-0.5">{needs.length} recorded</p>
            </div>
            {isOpen && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setLayout('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                      layout === 'list' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <List size={13} /> List
                  </button>
                  <button
                    onClick={() => setLayout('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
                      layout === 'grid' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutGrid size={13} /> Grid
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setEditingNeed(null); setFormOpen(true); }}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
                >
                  Add learning need
                </button>
              </div>
            )}
          </div>

          {needs.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center">
              <p className="text-sm text-gray-500 mb-2">No learning needs recorded yet.</p>
              <p className="text-xs text-gray-400 mb-4">
                Capture the outcomes you want to achieve this cycle.
              </p>
              {isOpen && (
                <button
                  type="button"
                  onClick={() => { setEditingNeed(null); setFormOpen(true); }}
                  className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
                >
                  Add your first learning need
                </button>
              )}
            </div>
          ) : (() => {
            const totalPages  = Math.max(1, Math.ceil(needs.length / PAGE_SIZE));
            const currentPage = Math.min(page, totalPages);
            const start       = (currentPage - 1) * PAGE_SIZE;
            const pageItems   = needs.slice(start, start + PAGE_SIZE);
            const windowStart = start + 1;
            const windowEnd   = start + pageItems.length;

            return (
              <>
                {layout === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pageItems.map((n) => (
                      <NeedCard
                        key={n.id}
                        need={n}
                        layout="grid"
                        readOnly={!isOpen}
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
                        readOnly={!isOpen}
                        onOpen={() => navigate(`/member/cpd/learning-plan/${n.id}`)}
                        onEdit={() => { setEditingNeed(n); setFormOpen(true); }}
                        onDelete={() => setConfirmDelete(n)}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between gap-3 flex-wrap text-xs text-gray-600">
                  <span>
                    Showing{' '}
                    <span className="font-medium text-gray-900">{windowStart}</span>–
                    <span className="font-medium text-gray-900">{windowEnd}</span>
                    {' '}of{' '}
                    <span className="font-medium text-gray-900">{needs.length}</span>
                  </span>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setPage(1)} disabled={currentPage === 1}
                        className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">‹‹</button>
                      <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">‹ Prev</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button key={n} type="button" onClick={() => setPage(n)}
                          className={`min-w-[32px] px-2 py-1 rounded border text-sm ${n === currentPage ? 'border-aps-blue bg-aps-blue text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                          {n}
                        </button>
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
        </section>
      )}

      {/* Offline — no learning needs in this system */}
      {!isPDTool && (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
          <FolderOpen size={28} strokeWidth={1} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 mb-1">Learning needs are not managed here.</p>
          <p className="text-xs text-gray-400">
            Your documentation method is set to Offline. Switch to PD Tool in{' '}
            <Link to="/member/cpd/learning-plan/details" className="text-aps-blue hover:underline">
              Plan Details
            </Link>{' '}
            to manage learning needs in this system.
          </p>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
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
            ? `Delete "${confirmDelete.need || confirmDelete.title}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageShell>
  );
}
