import { useMemo } from 'react';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';

export default function CpdActivitiesList({ profiles }) {
  // Flatten all activities from all profiles, attaching member info
  const allActivities = useMemo(() => {
    return profiles.flatMap((p) =>
      p.activities.map((a) => ({
        ...a,
        memberName: p.memberName,
        memberNumber: p.memberNumber,
        grade: p.grade,
      }))
    );
  }, [profiles]);

  const filters = [
    { key: 'memberName', label: 'Member Name' },
    { key: 'memberNumber', label: 'Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'activityType', label: 'Activity Type' },
    { key: 'peerHrs', label: 'Peer Hours' },
    { key: 'actionHrs', label: 'Action Hours' },
    { key: 'cpdHrs', label: 'CPD Hours' },
    { key: 'completedDate', label: 'Completed Date' },
    { key: 'loggedDate', label: 'Logged Date' },
  ];

  // Journal Entry Notes always hidden
  const columns = [
    { key: 'memberName', label: 'Member Name' },
    { key: 'memberNumber', label: 'Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'activityType', label: 'Activity Type' },
    { key: 'peerHrs', label: 'Peer Hrs' },
    { key: 'actionHrs', label: 'Action Hrs' },
    { key: 'cpdHrs', label: 'CPD Hrs' },
    { key: 'completedDate', label: 'Completed Date' },
    { key: 'loggedDate', label: 'Logged Date' },
  ];

  return (
    <PageShell>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">All CPD Activities</h1>
      <DataTable
        columns={columns}
        data={allActivities}
        filters={filters}
        exportFilename="cpd-activities.csv"
        emptyMessage="No CPD activities found."
      />
    </PageShell>
  );
}
