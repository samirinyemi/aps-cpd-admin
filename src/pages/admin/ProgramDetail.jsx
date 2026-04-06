import { useParams, useNavigate, Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getMemberName(p) {
  return `${p.member.title} ${p.member.firstName} ${p.member.lastName}`;
}

function Field({ label, value, children }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{children || value}</dd>
    </div>
  );
}

function formatDuration(h, m) {
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
}

export default function ProgramDetail({ programs }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const program = programs.find((p) => p.id === id);

  if (!program) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Program not found.</p>
          <Link to="/admin/registrar/programs" className="text-aps-blue hover:underline text-sm">
            Back to Registrar Programs
          </Link>
        </div>
      </PageShell>
    );
  }

  const isReadOnly = program.status === 'Closed';

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link to="/admin/registrar/programs" className="text-aps-blue hover:underline">
              Registrar Programs
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{getMemberName(program)}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{getMemberName(program)}</h1>
          <p className="text-sm text-gray-500 mt-1">{program.areaOfPractice}</p>
          <div className="mt-2">
            <StatusBadge status={program.status} />
          </div>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => navigate(`/admin/registrar/programs/${program.id}/edit`)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit Program
          </button>
        )}
      </div>

      {/* Member Information */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Member Information</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8">
          <Field label="Member Name" value={getMemberName(program)} />
          <Field label="Member Number" value={program.memberNumber} />
          <Field label="Member Grade" value={program.memberGrade} />
        </dl>
      </section>

      {/* Program Details */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Program Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <Field label="Area of Practice" value={program.areaOfPractice} />
          <Field label="Qualification" value={program.qualification} />
          <Field label="Date of Commencement" value={formatDate(program.commencementDate)} />
          <Field label="Status" >
            <StatusBadge status={program.status} />
          </Field>
          <Field label="Currently holds AoPE with PsyBA?">
            <StatusBadge status={program.holdsAoPE ? 'Yes' : 'No'} />
          </Field>
          <Field label="Qualification accredited for two areas?">
            <StatusBadge status={program.dualQualification ? 'Yes' : 'No'} />
          </Field>
        </dl>
      </section>

      {/* Supervisors */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Supervisors
          <span className="text-sm font-normal text-gray-400 ml-2">({program.supervisors.length})</span>
        </h2>
        {program.supervisors.length === 0 ? (
          <p className="text-sm text-gray-400">No supervisors assigned.</p>
        ) : (
          <div className="space-y-3">
            {program.supervisors.map((s) => (
              <div key={s.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {s.title} {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      AHPRA: {s.ahpraNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.supervisionType === 'Primary'
                        ? 'bg-aps-blue/10 text-aps-blue'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.supervisionType}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">AoPE: {s.supervisorAoPE}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Places of Practice */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Places of Practice
          <span className="text-sm font-normal text-gray-400 ml-2">({program.placesOfPractice.length})</span>
        </h2>
        {program.placesOfPractice.length === 0 ? (
          <p className="text-sm text-gray-400">No places of practice recorded.</p>
        ) : (
          <div className="space-y-3">
            {program.placesOfPractice.map((p) => (
              <div key={p.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.employerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.positionTitle}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                  <p>{p.addressLine1}{p.addressLine2 ? `, ${p.addressLine2}` : ''}</p>
                  <p>{p.suburb} {p.state} {p.postcode}</p>
                  {(p.phone || p.email) && (
                    <p className="mt-1">{p.phone}{p.phone && p.email ? ' · ' : ''}{p.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Activities */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Activities
            <span className="text-sm font-normal text-gray-400 ml-2">({(program.activities || []).length})</span>
          </h2>
          {!isReadOnly && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/registrar/log-supervision?programId=${program.id}`)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
              >
                Log Supervision
              </button>
              <button
                onClick={() => navigate(`/admin/registrar/log-practice?programId=${program.id}`)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
              >
                Log Practice
              </button>
              <button
                onClick={() => navigate(`/admin/registrar/log-cpd?programId=${program.id}`)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Log CPD Hours
              </button>
            </div>
          )}
        </div>
        {(program.activities || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No activities logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Supervisor / Place</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Supervision Type</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Duration</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Direct Contact</th>
                </tr>
              </thead>
              <tbody>
                {[...(program.activities || [])].sort((a, b) => b.completionDate.localeCompare(a.completionDate)).map((a) => (
                  <tr key={a.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">{formatDate(a.completionDate)}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.activityType === 'Supervision' ? 'bg-aps-blue/10 text-aps-blue'
                          : a.activityType === 'Practice' ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {a.activityType}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{a.supervisorName || a.employerName || '—'}</td>
                    <td className="py-3 pr-4">{a.supervisionType || '—'}</td>
                    <td className="py-3 pr-4">{formatDuration(a.hours, a.minutes)}</td>
                    <td className="py-3 pr-4">
                      {a.activityType === 'Practice' ? formatDuration(a.directContactHours, a.directContactMinutes) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
