import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderOpen, MonitorCheck, CalendarDays, Pencil, ChevronRight,
} from 'lucide-react';
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';
import { useSelectedCycle } from '../../context/CycleContext';

// HLBR §3.4.6 — Learning Plan Details page
// US-702: Documentation method
// US-707: Single plan-level review per cycle (create once, then edit)
//
// View mode  → shows saved method + review (read-only). "Edit" button enters edit mode.
// Edit mode  → method selector + review fields active together. Single "Save" commits both.

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function MyLearningPlanDetails({ cpdProfiles, setCpdProfiles }) {
  const { member } = useAuth();
  const navigate   = useNavigate();
  const { selectedCycle } = useSelectedCycle();

  const memberProfile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  const cycleProfile = useMemo(
    () => memberProfile?.cycleProfiles?.find((cp) => cp.cycleId === selectedCycle?.id) || null,
    [memberProfile, selectedCycle]
  );

  // ── Saved values ─────────────────────────────────────────────────────────
  const savedMethod = cycleProfile?.learningPlanMethod || 'PD Tool';
  const isOpen      = selectedCycle?.status === 'Open';
  const cycleStart  = selectedCycle?.startDate || '';
  const cycleEnd    = selectedCycle?.endDate   || '';

  // Single review — most recent wins if legacy data has multiple
  const savedReview = useMemo(() => {
    const all = cycleProfile?.learningPlanReviews || [];
    if (!all.length) return null;
    return [...all].sort((a, b) => (b.reviewDate || '').localeCompare(a.reviewDate || ''))[0];
  }, [cycleProfile]);

  // ── Edit mode state ───────────────────────────────────────────────────────
  const [editing,          setEditing]          = useState(false);
  const [selectedMethod,   setSelectedMethod]   = useState(savedMethod);
  const [reviewDate,       setReviewDate]       = useState('');
  const [outcomesAchieved, setOutcomesAchieved] = useState('');
  const [errors,           setErrors]           = useState({});

  const selectedIsPDTool = selectedMethod === 'PD Tool';
  const savedIsPDTool    = savedMethod    === 'PD Tool';

  function enterEditMode() {
    setSelectedMethod(savedMethod);
    setReviewDate(savedReview?.reviewDate || '');
    setOutcomesAchieved(savedReview?.outcomesAchieved || '');
    setErrors({});
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setErrors({});
  }

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!memberProfile || !cycleProfile) {
    return (
      <PageShell>
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-3">No CPD profile found for the selected cycle.</p>
          <Link to="/member/cpd" className="text-aps-blue hover:underline text-sm">Go to My CPD</Link>
        </div>
      </PageShell>
    );
  }

  // ── Persist helper ────────────────────────────────────────────────────────
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

  // ── Save everything at once ───────────────────────────────────────────────
  function handleSave() {
    const errs = {};

    // Validate review fields only when PD Tool is selected and at least one field is touched
    if (selectedIsPDTool) {
      const hasDate     = reviewDate.trim() !== '';
      const hasOutcomes = outcomesAchieved.trim() !== '';
      const eitherFilled = hasDate || hasOutcomes;

      if (eitherFilled) {
        if (!hasDate) {
          errs.reviewDate = 'Review date is required';
        } else if (cycleStart && cycleEnd) {
          if (reviewDate < cycleStart || reviewDate > cycleEnd) {
            errs.reviewDate = `Date must be within the CPD cycle period (${cycleStart} to ${cycleEnd})`;
          }
        }
        if (!hasOutcomes) {
          errs.outcomesAchieved = 'Outcomes achieved is required';
        }
      }
    }

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const patch = { learningPlanMethod: selectedMethod };

    // Build review update
    if (selectedIsPDTool) {
      const hasDate     = reviewDate.trim() !== '';
      const hasOutcomes = outcomesAchieved.trim() !== '';

      if (hasDate && hasOutcomes) {
        if (savedReview) {
          // Update existing
          patch.learningPlanReviews = (cycleProfile.learningPlanReviews || []).map((r) =>
            r.id === savedReview.id
              ? { ...r, reviewDate: reviewDate.trim(), outcomesAchieved: outcomesAchieved.trim() }
              : r
          );
        } else {
          // Create new
          patch.learningPlanReviews = [{
            id:               `pr-${Date.now()}`,
            reviewDate:       reviewDate.trim(),
            outcomesAchieved: outcomesAchieved.trim(),
          }];
        }
      }
      // Both empty → leave existing review untouched (no patch key)
    }

    persistCycleProfile(patch);
    navigate('/member/cpd/learning-plan');
  }

  // ── Input helpers ─────────────────────────────────────────────────────────
  const inputCls = (field) =>
    `w-full h-14 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;
  const textareaCls = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue resize-none ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/member/cpd/learning-plan" className="hover:text-aps-blue">
          Learning Plan
        </Link>
        <ChevronRight size={14} strokeWidth={1.75} className="text-gray-400" />
        <span className="text-gray-900 font-medium">Plan Details</span>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Learning Plan Details</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Documentation method and end-of-cycle review.
          </p>
        </div>
        {isOpen && !editing && (
          <button
            type="button"
            onClick={enterEditMode}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light shrink-0"
          >
            <Pencil size={13} strokeWidth={1.5} />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        /* ════════════════ EDIT MODE ════════════════ */
        <div className="space-y-5">

          {/* ── Documentation Method ────────────────────────────────────── */}
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Documentation Method</h2>
            <p className="text-xs text-gray-500 mb-4">
              How are you documenting your learning plan this cycle?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Offline */}
              <button
                type="button"
                onClick={() => setSelectedMethod('Offline')}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedMethod === 'Offline'
                    ? 'border-aps-blue bg-aps-blue-light/40'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FolderOpen
                  size={20}
                  strokeWidth={1.5}
                  className={`shrink-0 mt-0.5 ${selectedMethod === 'Offline' ? 'text-aps-blue' : 'text-gray-400'}`}
                />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${selectedMethod === 'Offline' ? 'text-aps-blue' : 'text-gray-800'}`}>
                    Offline
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    I have documented my learning plan elsewhere and will not use the system.
                  </p>
                </div>
                {selectedMethod === 'Offline' && (
                  <span className="ml-auto shrink-0 text-[10px] font-semibold text-aps-blue bg-aps-blue/10 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </button>

              {/* PD Tool */}
              <button
                type="button"
                onClick={() => setSelectedMethod('PD Tool')}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedIsPDTool
                    ? 'border-aps-blue bg-aps-blue-light/40'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <MonitorCheck
                  size={20}
                  strokeWidth={1.5}
                  className={`shrink-0 mt-0.5 ${selectedIsPDTool ? 'text-aps-blue' : 'text-gray-400'}`}
                />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${selectedIsPDTool ? 'text-aps-blue' : 'text-gray-800'}`}>
                    PD Tool
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    I will use the online system to document my learning plan.
                  </p>
                </div>
                {selectedIsPDTool && (
                  <span className="ml-auto shrink-0 text-[10px] font-semibold text-aps-blue bg-aps-blue/10 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* ── Review (PD Tool only) ────────────────────────────────────── */}
          {selectedIsPDTool && (
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Review</h2>
              <p className="text-xs text-gray-500 mb-4">
                {savedReview
                  ? 'Update your end-of-cycle review.'
                  : 'Optionally record your outcomes for this cycle. Leave blank to skip.'}
              </p>

              <div className="space-y-4">
                {/* Review date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Review date
                  </label>
                  {cycleStart && cycleEnd && (
                    <p className="text-xs text-gray-500 mb-1.5">
                      Must be within the cycle period: {cycleStart} – {cycleEnd}
                    </p>
                  )}
                  <input
                    type="date"
                    value={reviewDate}
                    min={cycleStart || undefined}
                    max={cycleEnd || undefined}
                    onChange={(e) => {
                      setReviewDate(e.target.value);
                      setErrors((p) => ({ ...p, reviewDate: undefined }));
                    }}
                    className={inputCls('reviewDate')}
                  />
                  {errors.reviewDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.reviewDate}</p>
                  )}
                </div>

                {/* Outcomes achieved */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Outcomes achieved
                  </label>
                  <textarea
                    rows={4}
                    maxLength={250}
                    value={outcomesAchieved}
                    onChange={(e) => {
                      setOutcomesAchieved(e.target.value);
                      setErrors((p) => ({ ...p, outcomesAchieved: undefined }));
                    }}
                    className={textareaCls('outcomesAchieved')}
                    placeholder="Describe what you achieved against your planned learning activities this cycle…"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.outcomesAchieved
                      ? <p className="text-sm text-red-600">{errors.outcomesAchieved}</p>
                      : <span />}
                    <span className="text-[11px] text-gray-400 ml-auto">
                      {outcomesAchieved.length}/250
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Save / Cancel ────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

      ) : (
        /* ════════════════ VIEW MODE ════════════════ */
        <div className="space-y-5">

          {/* ── Documentation Method ────────────────────────────────────── */}
          <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Documentation Method</h2>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                savedIsPDTool ? 'bg-aps-blue-light' : 'bg-gray-100'
              }`}>
                {savedIsPDTool
                  ? <MonitorCheck size={18} strokeWidth={1.5} className="text-aps-blue" />
                  : <FolderOpen   size={18} strokeWidth={1.5} className="text-gray-500" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{savedMethod}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {savedIsPDTool
                    ? 'Documenting your learning plan using the online system.'
                    : 'Learning plan is documented outside this system.'}
                </p>
              </div>
            </div>
          </section>

          {/* ── Review ──────────────────────────────────────────────────── */}
          {savedIsPDTool && (
            <section className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Review</h2>

              {savedReview ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays size={14} strokeWidth={1.5} className="text-aps-blue shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(savedReview.reviewDate)}
                    </span>
                    <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700 border border-green-200">
                      Submitted
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {savedReview.outcomesAchieved}
                  </p>
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <CalendarDays size={28} strokeWidth={1} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">No review submitted yet.</p>
                  <p className="text-xs text-gray-400">
                    {isOpen
                      ? 'Click Edit to add your end-of-cycle review.'
                      : 'No review was submitted for this cycle.'}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Offline — no review section */}
          {!savedIsPDTool && (
            <section className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                Your learning plan is documented outside this system. You'll need to produce that
                evidence if asked during an audit.
              </p>
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}
