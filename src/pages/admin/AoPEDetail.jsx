import { useParams, useNavigate, Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';

function Field({ label, value, suffix }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">
        {value}{suffix && <span className="text-gray-400 font-normal"> {suffix}</span>}
      </dd>
    </div>
  );
}

export default function AoPEDetail({ aoPEPrograms }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const program = aoPEPrograms.find((p) => p.id === id);

  if (!program) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Program not found.</p>
          <Link to="/admin/registrar/aope" className="text-aps-blue hover:underline text-sm">
            Back to AoPE Configuration
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link to="/admin/registrar/aope" className="text-aps-blue hover:underline">
              AoPE Compliance Configuration
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{program.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{program.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{program.areaOfPractice}</p>
        </div>
        <button
          onClick={() => navigate(`/admin/registrar/aope/${program.id}/edit`)}
          className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
        >
          Edit Program
        </button>
      </div>

      {/* Program Details */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Program Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <Field label="Program Name" value={program.name} />
          <Field label="Area of Practice Endorsement" value={program.areaOfPractice} />
          <Field label="Total Required Hours" value={program.totalRequiredHours.toLocaleString()} suffix="hours" />
        </dl>
      </section>

      {/* Supervision Requirements */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Supervision Requirements</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <Field label="Required Supervision Hours" value={program.requiredSupervisionHours.toLocaleString()} suffix="hours" />
          <Field label="Min Primary Supervision Hours" value={program.minPrimaryHours.toLocaleString()} suffix="hours" />
          <Field label="Max Secondary Supervision Hours" value={program.maxSecondaryHours.toLocaleString()} suffix="hours" />
          <Field label="Max Secondary Non-AoPE Hours" value={program.maxSecondaryNonAoPEHours.toLocaleString()} suffix="hours" />
          <Field label="Max Group Supervision Hours" value={program.maxGroupHours.toLocaleString()} suffix="hours" />
          <Field label="Required Direct Client Contact Hours" value={program.directClientContactHours.toLocaleString()} suffix="hours" />
        </dl>
      </section>

      {/* Practice Requirements */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Practice Requirements</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <Field label="Required Practice Hours" value={program.requiredPracticeHours.toLocaleString()} suffix="hours" />
          <Field label="Required CPD Hours" value={program.requiredCPDHours.toLocaleString()} suffix="hours" />
        </dl>
      </section>
    </PageShell>
  );
}
