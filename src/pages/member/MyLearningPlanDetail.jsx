import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LearningNeedFormModal from '../../components/LearningNeedFormModal';
import ReviewFormModal from '../../components/ReviewFormModal';
import { useAuth } from '../../context/AuthContext';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusChip({ status }) {
  const cls =
    status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200'
    : status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cls}`}>{status || 'Not Started'}</span>;
}

function PriorityChip({ priority }) {
  const p = priority || 'Medium';
  const cls =
    p === 'High' ? 'bg-red-50 text-red-700 border-red-200'
    : p === 'Low' ? 'bg-gray-50 text-gray-600 border-gray-200'
    : 'bg-sky-50 text-sky-700 border-sky-200';
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${cls}`}>{p} priority</span>;
}

export default function MyLearningPlanDetail({ cpdProfiles, setCpdProfiles }) {
  const { member } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const profile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );
  const need = useMemo(
    () => (profile?.learningNeeds || []).find((n) => n.id === id) || null,
    [profile, id]
  );

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [confirmDeleteReview, setConfirmDeleteReview] = useState(null);

  // If the need is deleted externally (or never existed), bounce back to the list.
  useEffect(() => {
    if (profile && !need) navigate('/member/cpd/learning-plan', { replace: true });
  }, [profile, need, navigate]);

  if (!profile || !need) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">Learning need not found.</p>
          <Link to="/member/cpd/learning-plan" className="text-aps-blue hover:underline text-sm">Back to Manage Learning Plan</Link>
        </div>
      </PageShell>
    );
  }

  function persistProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) => (p.memberNumber === profile.memberNumber ? { ...p, ...patch } : p))
    );
  }

  function handleSavePlan(payload) {
    persistProfile({
      learningNeeds: (profile.learningNeeds || []).map((n) => (n.id === payload.id ? { ...n, ...payload, reviews: n.reviews || [] } : n)),
    });
    setEditOpen(false);
  }

  function handleDeletePlan() {
    persistProfile({
      learningNeeds: (profile.learningNeeds || []).filter((n) => n.id !== need.id),
    });
    setConfirmDeletePlan(false);
    navigate('/member/cpd/learning-plan');
  }

  function handleSaveReview(payload) {
    const reviews = need.reviews || [];
    const isEdit = reviews.some((r) => r.id === payload.id);
    const nextReviews = isEdit
      ? reviews.map((r) => (r.id === payload.id ? payload : r))
      : [...reviews, payload];
    persistProfile({
      learningNeeds: (profile.learningNeeds || []).map((n) => (n.id === need.id ? { ...n, reviews: nextReviews } : n)),
    });
    setReviewModalOpen(false);
    setEditingReview(null);
  }

  function handleDeleteReview() {
    if (!confirmDeleteReview) return;
    persistProfile({
      learningNeeds: (profile.learningNeeds || []).map((n) =>
        n.id === need.id
          ? { ...n, reviews: (n.reviews || []).filter((r) => r.id !== confirmDeleteReview.id) }
          : n
      ),
    });
    setConfirmDeleteReview(null);
  }

  const reviews = [...(need.reviews || [])].sort((a, b) => (b.reviewedAt || '').localeCompare(a.reviewedAt || ''));

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/member/cpd/learning-plan" className="hover:text-aps-blue">Manage Learning Plan</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{need.title || need.need}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-semibold text-gray-900">{need.title || need.need}</h1>
            <StatusChip status={need.status} />
            <PriorityChip priority={need.priority} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit plan
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeletePlan(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
          >
            Delete plan
          </button>
        </div>
      </div>

      {/* Details */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Plan details</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-xs text-gray-500">Description</dt>
            <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{need.description || <span className="text-gray-400">—</span>}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Proposed date</dt>
            <dd className="text-sm text-gray-900 mt-1">{need.proposedDate || <span className="text-gray-400">—</span>}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Anticipated outcome</dt>
            <dd className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{need.anticipatedOutcome || <span className="text-gray-400">—</span>}</dd>
          </div>
        </dl>
      </section>

      {/* Reviews */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Reviews
            <span className="text-sm font-normal text-gray-400 ml-2">({reviews.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => { setEditingReview(null); setReviewModalOpen(true); }}
            className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark"
          >
            Add review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">No reviews yet.</p>
            <p className="text-xs text-gray-400 mt-1">Log reviews as you make progress on this learning.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{formatDate(r.reviewedAt)}</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.notes}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setEditingReview(r); setReviewModalOpen(true); }}
                      className="text-xs px-2 py-1 text-aps-blue hover:bg-aps-blue-light rounded"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteReview(r)}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <LearningNeedFormModal
        open={editOpen}
        existingNeed={need}
        onSave={handleSavePlan}
        onCancel={() => setEditOpen(false)}
      />
      <ReviewFormModal
        open={reviewModalOpen}
        existingReview={editingReview}
        onSave={handleSaveReview}
        onCancel={() => { setReviewModalOpen(false); setEditingReview(null); }}
      />
      <ConfirmDialog
        open={confirmDeletePlan}
        title="Delete learning plan"
        message={`Delete "${need.title || need.need}" and its ${reviews.length} review${reviews.length === 1 ? '' : 's'}? This cannot be undone.`}
        confirmLabel="Delete plan"
        onConfirm={handleDeletePlan}
        onCancel={() => setConfirmDeletePlan(false)}
      />
      <ConfirmDialog
        open={Boolean(confirmDeleteReview)}
        title="Delete review"
        message={confirmDeleteReview ? `Delete the review from ${formatDate(confirmDeleteReview.reviewedAt)}? This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDeleteReview}
        onCancel={() => setConfirmDeleteReview(null)}
      />
    </PageShell>
  );
}
