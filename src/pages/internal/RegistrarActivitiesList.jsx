import { useMemo } from 'react';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';

export default function RegistrarActivitiesList({ profiles }) {
  const allActivities = useMemo(() => {
    return profiles.flatMap((p) =>
      p.activities.map((a) => ({
        ...a,
        memberName: p.memberName,
        memberNumber: p.memberNumber,
        grade: p.grade,
        program: p.program,
      }))
    );
  }, [profiles]);

  const filters = [
    { key: 'memberName', label: 'Member Name' },
    { key: 'memberNumber', label: 'Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'program', label: 'Program' },
    { key: 'activityType', label: 'Activity Type' },
    { key: 'supervisionType', label: 'Supervision Type' },
    { key: 'completionDate', label: 'Completion Date' },
  ];

  const columns = [
    { key: 'memberName', label: 'Member Name' },
    { key: 'memberNumber', label: 'Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'program', label: 'Program' },
    { key: 'activityType', label: 'Activity Type' },
    {
      key: 'supervisorPractice',
      label: 'Supervisor / Practice',
      accessor: (row) => {
        if (row.activityType === 'Supervision') return row.supervisorName || '';
        if (row.activityType === 'Practice') return row.employerName || '';
        return '';
      },
      render: (row) => {
        if (row.activityType === 'Supervision') return row.supervisorName;
        if (row.activityType === 'Practice') return row.employerName;
        return <span className="text-gray-400">—</span>;
      },
    },
    {
      key: 'supervisionType',
      label: 'Supervision Type',
      accessor: (row) => row.activityType === 'Supervision' ? (row.supervisionType || '') : '',
      render: (row) =>
        row.activityType === 'Supervision'
          ? row.supervisionType
          : <span className="text-gray-400">—</span>,
    },
    { key: 'completionDate', label: 'Completion Date' },
    { key: 'hours', label: 'Hours' },
  ];

  return (
    <PageShell>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">All Registrar Activities</h1>
      <DataTable
        columns={columns}
        data={allActivities}
        filters={filters}
        exportFilename="registrar-activities.csv"
        emptyMessage="No registrar activities found."
      />
    </PageShell>
  );
}
