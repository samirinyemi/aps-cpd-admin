import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSelectedCycle } from '../../context/CycleContext';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

function Field({ label, value, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900">{children ?? value ?? <span className="text-gray-400">—</span>}</dd>
    </div>
  );
}

// ── Learning Need card ────────────────────────────────────────────────────────
function LearningNeedCard({ need }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{need.title}</p>
        <StatusBadge status={need.status} />
      </div>
      {need.proposedDate && (
        <p className="text-xs text-gray-500">
          Proposed: <span className="font-medium text-gray-700">{need.proposedDate}</span>
        </p>
      )}
    </div>
  );
}

// ── CPD Activity card ─────────────────────────────────────────────────────────
function ActivityCard({ activity }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
      {/* Activity type */}
      <p className="text-sm font-semibold text-gray-900">{activity.activityType}</p>

      {/* Hours row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs text-center">
        <div>
          <p className="text-gray-400 mb-0.5">Peer Hrs</p>
          <p className="font-semibold text-gray-900">{activity.peerHrs ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-0.5">Action Hrs</p>
          <p className="font-semibold text-gray-900">{activity.actionHrs ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-0.5">CPD Hrs</p>
          <p className="font-semibold text-gray-900">{activity.cpdHrs ?? '—'}</p>
        </div>
      </div>

      {/* Dates row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-1 border-t border-gray-100">
        {activity.completedDate && (
          <span>Completed: <span className="font-medium text-gray-700">{activity.completedDate}</span></span>
        )}
        {activity.loggedDate && (
          <span>Logged: <span className="font-medium text-gray-700">{activity.loggedDate}</span></span>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CpdProfileDetail({ profiles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { selectedCycle } = useSelectedCycle();

  const memberProfile = profiles.find((p) => p.id === id);

  const cycleProfile = useMemo(() => {
    if (!memberProfile) return null;
    return (
      memberProfile.cycleProfiles?.find((cp) => cp.cycleId === selectedCycle?.id) ||
      memberProfile.cycleProfiles?.[0] ||
      null
    );
  }, [memberProfile, selectedCycle]);

  if (!memberProfile) {
    return (
      <PageShell>
        <p className="text-sm text-gray-500">Profile not found.</p>
      </PageShell>
    );
  }

  const isAdmin = role === 'IT Administrator';
  const learningNeeds = cycleProfile?.learningNeeds || [];
  const activities = cycleProfile?.activities || [];

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/internal/cpd/profiles')} className="hover:text-aps-blue">
          Member CPD Profiles
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{memberProfile.memberName}</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{memberProfile.memberName}</h1>
        {isAdmin && (
          <button className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
            Edit
          </button>
        )}
      </div>

      {/* Section A — Profile */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Name" value={memberProfile.memberName} />
          <Field label="Number" value={memberProfile.memberNumber} />
          <Field label="Grade" value={memberProfile.grade} />
          <Field label="CPD Cycle" value={cycleProfile?.cpdCycle || '—'} />
          <Field label="Board Registration" value={memberProfile.boardRegistration} />
          <Field label="Reg Date" value={memberProfile.regDate} />
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-0.5">CPD Exemption</dt>
            <dd>
              {cycleProfile
                ? <StatusBadge status={cycleProfile.cpdExemption ? 'Yes' : 'No'} />
                : <span className="text-sm text-gray-400">—</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-0.5">Terms of Use</dt>
            <dd>
              {cycleProfile
                ? <StatusBadge status={cycleProfile.termsOfUse ? 'Yes' : 'No'} />
                : <span className="text-sm text-gray-400">—</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-0.5">Requirements Met</dt>
            <dd>
              {cycleProfile
                ? <StatusBadge status={cycleProfile.requirementsMet ? 'Yes' : 'No'} />
                : <span className="text-sm text-gray-400">—</span>}
            </dd>
          </div>
        </dl>
      </section>

      {/* No cycle profile notice */}
      {!cycleProfile && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">No CPD data recorded for the selected cycle.</p>
        </section>
      )}

      {/* Section B — Learning Plan */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} strokeWidth={1.75} className="text-aps-blue" />
          <h2 className="text-base font-semibold text-gray-900">Learning Plan</h2>
        </div>

        {cycleProfile ? (
          <>
            <p className="text-sm text-gray-600 mb-5">
              Documentation Method:{' '}
              <span className="font-medium text-gray-900">{cycleProfile.learningPlanMethod}</span>
            </p>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Learning Needs
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({learningNeeds.length})
                </span>
              </h3>
            </div>

            {learningNeeds.length === 0 ? (
              <EmptyState message="No learning needs recorded." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {learningNeeds.map((need) => (
                  <LearningNeedCard key={need.id} need={need} />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400">No learning plan data for the selected cycle.</p>
        )}
      </section>

      {/* Section C — CPD Activities (Journal Entry Notes always hidden) */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={16} strokeWidth={1.75} className="text-aps-blue" />
          <h2 className="text-base font-semibold text-gray-900">
            CPD Activities
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({activities.length})
            </span>
          </h2>
        </div>

        {activities.length === 0 ? (
          <EmptyState message="No CPD activities logged." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
