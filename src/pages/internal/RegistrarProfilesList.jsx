import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import DataTable from '../../components/DataTable';

export default function RegistrarProfilesList({ profiles }) {
  const navigate = useNavigate();

  const filters = [
    { key: 'memberName', label: 'Member Name' },
    { key: 'memberNumber', label: 'Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'program', label: 'Registrar Program' },
    { key: 'commencementDate', label: 'Commencement Date' },
    { key: 'qualification', label: 'Qualification' },
  ];

  const columns = [
    { key: 'memberName', label: 'Member Name' },
    { key: 'memberNumber', label: 'Number' },
    { key: 'grade', label: 'Grade' },
    { key: 'program', label: 'Registrar Program' },
    { key: 'commencementDate', label: 'Commencement Date' },
    { key: 'qualification', label: 'Qualification' },
  ];

  return (
    <PageShell>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Member Registrar Profiles</h1>
      <DataTable
        columns={columns}
        data={profiles}
        filters={filters}
        exportFilename="registrar-profiles.csv"
        onRowClick={(row) => navigate(`/internal/registrar/profiles/${row.id}`)}
        emptyMessage="No member registrar profiles found."
      />
    </PageShell>
  );
}
