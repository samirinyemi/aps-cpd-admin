import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSelectedCycle } from '../../context/CycleContext';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';

function Field({ label, value, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900">{children ?? value}</dd>
    </div>
  );
}


export default function CpdProfileDetail({ profiles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { selectedCycle } = useSelectedCycle();

  // Step 1: find primary member profile by id
  const memberProfile = profiles.find((p) => p.id === id);

  // Step 2: find cycle sub-profile — prefer selectedCycle, fall back to first available
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

  const learningNeedsColumns = [
    { key: 'title', label: 'Learning Need' },
    {
      key: 'proposedDate',
      label: 'Proposed Date',
      render: (row) => (
        <span className="block max-w-xs truncate text-gray-700" title={row.proposedDate}>
          {row.proposedDate || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const activityColumns = [
    { key: 'activityType', label: 'Activity Type' },
    { key: 'peerHrs', label: 'Peer Hrs' },
    { key: 'actionHrs', label: 'Action Hrs' },
    { key: 'cpdHrs', label: 'CPD Hrs' },
    { key: 'completedDate', label: 'Completed Date' },
    { key: 'loggedDate', label: 'Logged Date' },
  ];

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
        <h2 className="text-base font-semibold text-gray-900 mb-2">Learning Plan</h2>
        {cycleProfile ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Documentation Method: <span className="font-medium text-gray-900">{cycleProfile.learningPlanMethod}</span>
            </p>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Needs</h3>
            <DataTable
              columns={learningNeedsColumns}
              data={cycleProfile.learningNeeds || []}
              emptyMessage="No learning needs recorded."
            />
          </>
        ) : (
          <p className="text-sm text-gray-400">No learning plan data for the selected cycle.</p>
        )}
      </section>

      {/* Section C — CPD Activities (Journal Entry Notes always hidden) */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">CPD Activities</h2>
        <DataTable
          columns={activityColumns}
          data={cycleProfile?.activities || []}
          emptyMessage="No CPD activities logged."
        />
      </section>
    </PageShell>
  );
}
