import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, List, LayoutGrid, MonitorCheck, FolderOpen, ClipboardCheck, CalendarDays } from 'lucide-react';
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

// ─── Small helper chips ────────────────────────────────────────────────────
function StatusChip({ status }) {
  const cls =
    status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200'
    : status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${cls}`}>
      {status || 'Not Started'}
    </span>
  );
}

function PriorityChip({ priority }) {
  const p = priority || 'Medium';
  const cls =
    p === 'High' ? 'bg-red-50 text-red-700 border-red-200'
    : p === 'Low' ? 'bg-gray-50 text-gray-600 border-gray-200'
    : 'bg-sky-50 text-sky-700 border-sky-200';
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${cls}`}>
      {p} priority
    </span>
  );
}

// ─── Learning need card (list + grid variants) ─────────────────────────────
function NeedCard({ need, layout, onOpen, onEdit, onDelete }) {
  const stop = (e) => e.stopPropagation();

  // Resolve field aliases — old records use title/description, new ones use need/activitiesProposed
  const needTitle        = need.need || need.title || '—';
  const activitiesText   = need.activitiesProposed || need.description || '';
  const proposedDate     = need.proposedDate || '—';
  const anticipatedText  = need.anticipatedOutcome || '';

  const actions = (
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
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{needTitle}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              <StatusChip status={need.status} />
              <PriorityChip priority={need.priority} />
            </div>
          </div>
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
          <StatusChip status={need.status} />
          <PriorityChip priority={need.priority} />
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

// ─── US-707: Plan-level review form (inline) ───────────────────────────────
function ReviewForm({ initial, cycleStart, cycleEnd, onSave, onCancel }) {
  const [form, setForm] = useState({
    reviewDate:       initial?.reviewDate       || '',
    outcomesAchieved: initial?.outcomesAchieved || '',
  });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.reviewDate) {
      errs.reviewDate = 'Review date is required';
    } else if (cycleStart && cycleEnd) {
      if (form.reviewDate < cycleStart || form.reviewDate > cycleEnd) {
        errs.reviewDate = `Date must be within the CPD cycle period (${cycleStart} to ${cycleEnd})`;
      }
    }
    if (!form.outcomesAchieved.trim()) errs.outcomesAchieved = 'Outcomes achieved is required';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ reviewDate: form.reviewDate, outcomesAchieved: form.outcomesAchieved.trim() });
  }

  const inputCls = (f) =>
    `w-full h-14 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[f] ? 'border-red-400' : 'border-gray-300'}`;
  const textareaCls = (f) =>
    `w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue resize-none ${errors[f] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-4 mt-4">
      {/* Review date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Review date <span className="text-red-500">*</span>
        </label>
        {cycleStart && cycleEnd && (
          <p className="text-xs text-gray-500 mb-1.5">
            Must be within the CPD cycle period: {cycleStart} – {cycleEnd}
          </p>
        )}
        <input
          type="date"
          value={form.reviewDate}
          min={cycleStart || undefined}
          max={cycleEnd || undefined}
          onChange={(e) => update('reviewDate', e.target.value)}
          className={inputCls('reviewDate')}
        />
        {errors.reviewDate && (
          <p className="mt-1 text-sm text-red-600">{errors.reviewDate}</p>
        )}
      </div>

      {/* Outcomes achieved */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Outcomes achieved <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          maxLength={250}
          value={form.outcomesAchieved}
          onChange={(e) => update('outcomesAchieved', e.target.value)}
          className={textareaCls('outcomesAchieved')}
          placeholder="Describe what you achieved against your planned learning activities this cycle…"
        />
        <div className="flex justify-between mt-1">
          {errors.outcomesAchieved
            ? <p className="text-sm text-red-600">{errors.outcomesAchieved}</p>
            : <span />}
          <span className="text-[11px] text-gray-400 ml-auto">
            {form.outcomesAchieved.length}/250
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
        >
          Save review
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function MyLearningPlan({ cpdProfiles, setCpdProfiles }) {
  const { member } = useAuth();
  const navigate   = useNavigate();
  const { selectedCycle } = useSelectedCycle();

  const profile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  // ── US-701: Redirect gates ───────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    // Gate A: selected CPD cycle is Pending — no open program yet
    if (selectedCycle?.status === 'Pending') {
      navigate('/member/cpd/profile', { replace: true });
      return;
    }
    // Gate B: board registration type is exempt from the PD tool
    if (EXEMPT_REGISTRATIONS.includes(profile.boardRegistration)) {
      navigate('/member/cpd/profile', { replace: true });
    }
  }, [profile, selectedCycle, navigate]);

  // ── US-701/702: Documentation method ────────────────────────────────────
  const [docMethod, setDocMethod] = useState(
    () => profile?.learningPlanMethod || 'PD Tool'
  );

  // ── US-707: Review panel state (multiple reviews) ───────────────────────
  const [reviewFormOpen,   setReviewFormOpen]   = useState(false);
  const [editingReview,    setEditingReview]    = useState(null);   // review obj | null
  const [confirmDelReview, setConfirmDelReview] = useState(null);   // review obj | null

  // ── Learning needs list state ────────────────────────────────────────────
  // ── Tab state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('needs'); // 'needs' | 'review'

  const [layout,       setLayout]       = useState('list');
  const [formOpen,     setFormOpen]     = useState(false);
  const [editingNeed,  setEditingNeed]  = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => { setPage(1); }, [layout, docMethod]);
  // Reset to needs tab when method changes
  useEffect(() => { setActiveTab('needs'); }, [docMethod]);

  // ── Guard: no profile ────────────────────────────────────────────────────
  if (!profile) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">No CPD profile found.</p>
          <Link to="/member/cpd" className="text-aps-blue hover:underline text-sm">
            Back to CPD Summary
          </Link>
        </div>
      </PageShell>
    );
  }

  // ── Persist helper ───────────────────────────────────────────────────────
  function persistProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) => (p.memberNumber === profile.memberNumber ? { ...p, ...patch } : p))
    );
  }

  // ── US-702: method change auto-saves ────────────────────────────────────
  function handleMethodChange(method) {
    setDocMethod(method);
    persistProfile({ learningPlanMethod: method });
  }

  // ── Learning needs CRUD ──────────────────────────────────────────────────
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

  // ── US-707: reviews CRUD ────────────────────────────────────────────────
  function handleSaveReview(data) {
    const existing = profile.learningPlanReviews || [];
    const isEdit   = existing.some((r) => r.id === data.id);
    persistProfile({
      learningPlanReviews: isEdit
        ? existing.map((r) => (r.id === data.id ? data : r))
        : [...existing, { ...data, id: `pr-${Date.now()}` }],
    });
    setReviewFormOpen(false);
    setEditingReview(null);
  }

  function handleDeleteReview() {
    if (!confirmDelReview) return;
    persistProfile({
      learningPlanReviews: (profile.learningPlanReviews || []).filter(
        (r) => r.id !== confirmDelReview.id
      ),
    });
    setConfirmDelReview(null);
  }

  const isPDTool  = docMethod === 'PD Tool';
  const isOpen    = selectedCycle?.status === 'Open';
  const needs     = profile.learningNeeds || [];
  // Reviews sorted newest-first by date
  const reviews   = [...(profile.learningPlanReviews || [])].sort(
    (a, b) => (b.reviewDate || '').localeCompare(a.reviewDate || '')
  );
  // Cycle date bounds for the review date validator

  // Cycle date bounds for the review date validator
  const cycleStart = selectedCycle?.startDate || '';
  const cycleEnd   = selectedCycle?.endDate   || '';

  return (
    <PageShell>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Manage Learning Plan</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Record your planned learning activities and goals for this CPD cycle.
        </p>
      </div>

      {/* ── Section 1: US-701/702 — Documentation method ──────────────── */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-0.5">
          Learning Plan Documentation Method
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          How are you documenting your learning plan this cycle? Your selection is saved automatically.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option A — Offline */}
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
            <div className="min-w-0">
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

          {/* Option B — PD Tool */}
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
            <div className="min-w-0">
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

      {/* ── Offline state ──────────────────────────────────────────────── */}
      {!isPDTool && (
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
              <FolderOpen size={20} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                You've declared your learning plan is documented outside this system.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                APS has recorded that you manage your learning plan offline — for example in a
                Word document, spreadsheet, or physical record. You'll need to produce that
                evidence if asked during an audit.
              </p>
              <p className="text-xs text-gray-500">
                To manage your learning plan in this system instead, select{' '}
                <button
                  type="button"
                  onClick={() => handleMethodChange('PD Tool')}
                  className="font-medium text-aps-blue hover:underline"
                >
                  PD Tool
                </button>{' '}
                above.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── PD Tool sections ───────────────────────────────────────────── */}
      {isPDTool && (
        <>
          {/* ── Tab bar ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-5 border-b border-gray-200">
            <div className="flex items-center gap-0">
              <button
                type="button"
                onClick={() => setActiveTab('needs')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === 'needs'
                    ? 'border-aps-blue text-aps-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <List size={15} strokeWidth={1.5} />
                Learning needs
                {needs.length > 0 && (
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                    activeTab === 'needs' ? 'bg-aps-blue/10 text-aps-blue' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {needs.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === 'review'
                    ? 'border-aps-blue text-aps-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ClipboardCheck size={15} strokeWidth={1.5} />
                Review
                {reviews.length > 0 && (
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                    activeTab === 'review' ? 'bg-aps-blue/10 text-aps-blue' : 'bg-green-100 text-green-600'
                  }`}>
                    {reviews.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab-specific actions in the top-right */}
            {activeTab === 'needs' && isOpen && (
              <div className="flex items-center gap-3 pb-px">
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

            {activeTab === 'review' && isOpen && !reviewFormOpen && (
              <button
                type="button"
                onClick={() => { setEditingReview(null); setReviewFormOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark pb-px"
              >
                Add review
              </button>
            )}
          </div>

          {/* ── Tab: Learning needs ────────────────────────────────────── */}
          {activeTab === 'needs' && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Learning needs</h2>
              <span className="text-xs text-gray-500">{needs.length} recorded</span>
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

          {/* ── Tab: Review ────────────────────────────────────────────── */}
          {activeTab === 'review' && (
            <section>
              <p className="text-sm text-gray-500 mb-5">
                Log each time you review your learning plan. You can add multiple reviews throughout the cycle.
              </p>

              {/* Inline form — add or edit */}
              {reviewFormOpen && (
                <div className="bg-white border border-aps-blue/30 rounded-lg p-5 mb-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                    {editingReview ? 'Edit review' : 'Add review'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">Both fields are required.</p>
                  <ReviewForm
                    initial={editingReview}
                    cycleStart={cycleStart}
                    cycleEnd={cycleEnd}
                    onSave={handleSaveReview}
                    onCancel={() => { setReviewFormOpen(false); setEditingReview(null); }}
                  />
                </div>
              )}

              {/* Empty state */}
              {reviews.length === 0 && !reviewFormOpen && (
                <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <CalendarDays size={28} strokeWidth={1} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">No reviews added yet.</p>
                  <p className="text-xs text-gray-400 mb-4">
                    Add your first review to record your reflections and outcomes for this cycle.
                  </p>
                  {isOpen ? (
                    <button
                      type="button"
                      onClick={() => { setEditingReview(null); setReviewFormOpen(true); }}
                      className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
                    >
                      Add review
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      Reviews can only be added while the CPD cycle is open.
                    </p>
                  )}
                </div>
              )}

              {/* Review list — newest first */}
              {reviews.length > 0 && (
                <div className="flex flex-col gap-3">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} strokeWidth={1.5} className="text-aps-blue shrink-0" />
                          <span className="text-sm font-semibold text-gray-900">{r.reviewDate}</span>
                        </div>
                        {isOpen && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReview(r);
                                setReviewFormOpen(true);
                                // scroll form into view if needed
                              }}
                              className="p-1.5 rounded text-aps-blue hover:bg-aps-blue-light"
                              title="Edit"
                            >
                              <Pencil size={14} strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelReview(r)}
                              className="p-1.5 rounded text-red-500 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mt-2">
                        {r.outcomesAchieved}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
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

      <ConfirmDialog
        open={Boolean(confirmDelReview)}
        title="Delete review"
        message={
          confirmDelReview
            ? `Delete the review dated ${confirmDelReview.reviewDate}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteReview}
        onCancel={() => setConfirmDelReview(null)}
      />
    </PageShell>
  );
}
