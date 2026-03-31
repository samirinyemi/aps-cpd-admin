import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export default function CpdProfilesList({ profiles }) {
  const navigate = useNavigate();

  const filters = [
    { key: 'memberName', label: 'Member Name' },
    { key: 'memberNumber', label: 'Member Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'cpdCycle', label: 'CPD Cycle' },
    { key: 'boardRegistration', label: 'Board Registration' },
    { key: 'cpdExemption', label: 'CPD Exemption', accessor: (row) => row.cpdExemption ? 'Yes' : 'No' },
    { key: 'learningPlanMethod', label: 'Learning Plan Method' },
    { key: 'requirementsMet', label: 'Requirements Met', accessor: (row) => row.requirementsMet ? 'Yes' : 'No' },
  ];

  const columns = [
    { key: 'memberName', label: 'Member Name' },
    { key: 'memberNumber', label: 'Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'cpdCycle', label: 'CPD Cycle' },
    { key: 'boardRegistration', label: 'Board Registration' },
    { key: 'regDate', label: 'Reg Date' },
    {
      key: 'cpdExemption',
      label: 'CPD Exemption',
      render: (row) => <StatusBadge status={row.cpdExemption ? 'Yes' : 'No'} />,
    },
    { key: 'learningPlanMethod', label: 'Learning Plan Method' },
    {
      key: 'requirementsMet',
      label: 'Requirements Met',
      render: (row) => <StatusBadge status={row.requirementsMet ? 'Yes' : 'No'} />,
    },
  ];

  return (
    <PageShell>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Member CPD Profiles</h1>
      <DataTable
        columns={columns}
        data={profiles}
        filters={filters}
        exportFilename="cpd-profiles.csv"
        onRowClick={(row) => navigate(`/internal/cpd/profiles/${row.id}`)}
        emptyMessage="No member CPD profiles found."
      />
    </PageShell>
  );
}
