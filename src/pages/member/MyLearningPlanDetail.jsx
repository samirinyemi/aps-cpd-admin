import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LearningNeedFormModal from '../../components/LearningNeedFormModal';
import { useAuth } from '../../context/AuthContext';
import { useSelectedCycle } from '../../context/CycleContext';


export default function MyLearningPlanDetail({ cpdProfiles, setCpdProfiles }) {
  const { member }   = useAuth();
  const { id }       = useParams();
  const navigate     = useNavigate();
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

  const need = useMemo(
    () => (cycleProfile?.learningNeeds || []).find((n) => n.id === id) || null,
    [cycleProfile, id]
  );

  const [editOpen,          setEditOpen]          = useState(false);
  const [confirmDeletePlan, setConfirmDeletePlan] = useState(false);

  // If the need no longer exists (deleted externally), bounce back.
  useEffect(() => {
    if (cycleProfile && !need) navigate('/member/cpd/learning-plan', { replace: true });
  }, [cycleProfile, need, navigate]);

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

  if (!need) {
    return (
      <PageShell>
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-3">Learning need not found.</p>
          <Link to="/member/cpd/learning-plan" className="text-aps-blue hover:underline text-sm">
            Back to Learning Plan
          </Link>
        </div>
      </PageShell>
    );
  }

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

  function handleSavePlan(payload) {
    persistCycleProfile({
      learningNeeds: (cycleProfile.learningNeeds || []).map((n) =>
        n.id === payload.id ? { ...n, ...payload } : n
      ),
    });
    setEditOpen(false);
  }

  function handleDeletePlan() {
    persistCycleProfile({
      learningNeeds: (cycleProfile.learningNeeds || []).filter((n) => n.id !== need.id),
    });
    setConfirmDeletePlan(false);
    navigate('/member/cpd/learning-plan');
  }

  // Resolve field aliases — old data uses title/description, new uses need/activitiesProposed
  const needTitle        = need.need  || need.title  || '—';
  const activitiesText   = need.activitiesProposed || need.description || '';
  const anticipatedText  = need.anticipatedOutcome || '';

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/member/cpd/learning-plan" className="hover:text-aps-blue">
          Manage Learning Plan
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{needTitle}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-semibold text-gray-900">{needTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeletePlan(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Details card */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <dl className="space-y-5">
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-1">
              Learning need identified
            </dt>
            <dd className="text-sm text-gray-900">{needTitle}</dd>
          </div>

          {activitiesText && (
            <div>
              <dt className="text-xs font-medium text-gray-500 mb-1">
                Types of activities proposed
              </dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap">{activitiesText}</dd>
            </div>
          )}

          <div>
            <dt className="text-xs font-medium text-gray-500 mb-1">
              Proposed dates for activities
            </dt>
            <dd className="text-sm text-gray-900">
              {need.proposedDate || <span className="text-gray-400">—</span>}
            </dd>
          </div>

          {anticipatedText && (
            <div>
              <dt className="text-xs font-medium text-gray-500 mb-1">
                Anticipated outcomes
              </dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap">{anticipatedText}</dd>
            </div>
          )}
        </dl>
      </section>

      <LearningNeedFormModal
        open={editOpen}
        existingNeed={need}
        onSave={handleSavePlan}
        onCancel={() => setEditOpen(false)}
      />

      <ConfirmDialog
        open={confirmDeletePlan}
        title="Delete learning need"
        message={`Delete "${needTitle}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeletePlan}
        onCancel={() => setConfirmDeletePlan(false)}
      />
    </PageShell>
  );
}
