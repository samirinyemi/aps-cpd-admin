import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';

export default function ProgramList({ programs }) {
  const navigate = useNavigate();

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'aope', label: 'AoPE' },
    { key: 'totalRequiredHours', label: 'Total Required Hrs' },
    { key: 'supervisionHours', label: 'Supervision Hrs' },
    { key: 'practiceHours', label: 'Practice Hrs' },
    { key: 'cpdHours', label: 'CPD Hrs' },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/registrar/programs/${row.id}/edit`);
          }}
          className="text-xs px-2.5 py-1 text-aps-blue border border-aps-blue rounded hover:bg-aps-blue-light"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Registrar Programs</h1>
        <button
          onClick={() => navigate('/admin/registrar/programs/new')}
          className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
        >
          Create new program
        </button>
      </div>

      <DataTable
        columns={columns}
        data={programs}
        emptyMessage="No registrar programs have been created yet."
      />
    </PageShell>
  );
}
