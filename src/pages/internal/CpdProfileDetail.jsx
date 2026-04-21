import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  const profile = profiles.find((p) => p.id === id);

  if (!profile) {
    return (
      <PageShell>
        <p className="text-sm text-gray-500">Profile not found.</p>
      </PageShell>
    );
  }

  const isAdmin = role === 'IT Administrator';

  const learningNeedsColumns = [
    { key: 'need', label: 'Learning Need' },
    { key: 'priority', label: 'Priority' },
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
        <span className="text-gray-900">{profile.memberName}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{profile.memberName}</h1>
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
          <Field label="Name" value={profile.memberName} />
          <Field label="Number" value={profile.memberNumber} />
          <Field label="Grade" value={profile.grade} />
          <Field label="CPD Cycle" value={profile.cpdCycle} />
          <Field label="Board Registration" value={profile.boardRegistration} />
          <Field label="Reg Date" value={profile.regDate} />
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-0.5">CPD Exemption</dt>
            <dd><StatusBadge status={profile.cpdExemption ? 'Yes' : 'No'} /></dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-0.5">Terms of Use</dt>
            <dd><StatusBadge status={profile.termsOfUse ? 'Yes' : 'No'} /></dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 mb-0.5">Requirements Met</dt>
            <dd><StatusBadge status={profile.requirementsMet ? 'Yes' : 'No'} /></dd>
          </div>
        </dl>
      </section>

      {/* Section B — Learning Plan */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Learning Plan</h2>
        <p className="text-sm text-gray-600 mb-4">
          Documentation Method: <span className="font-medium text-gray-900">{profile.learningPlanMethod}</span>
        </p>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Needs</h3>
        <DataTable
          columns={learningNeedsColumns}
          data={profile.learningNeeds}
          emptyMessage="No learning needs recorded."
        />
      </section>

      {/* Section C — CPD Activities (Journal Entry Notes always hidden) */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">CPD Activities</h2>
        <DataTable
          columns={activityColumns}
          data={profile.activities}
          emptyMessage="No CPD activities logged."
        />
      </section>
    </PageShell>
  );
}
