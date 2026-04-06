import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';

export default function LogCPD({ programs }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const openPrograms = programs.filter((p) => p.status === 'Open');
  const [selectedId, setSelectedId] = useState(searchParams.get('programId') || '');

  const program = openPrograms.find((p) => p.id === selectedId);

  useEffect(() => {
    const qid = searchParams.get('programId');
    if (qid && openPrograms.find((p) => p.id === qid)) setSelectedId(qid);
  }, [searchParams]);

  return (
    <PageShell>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Log CPD Hours</h1>
      <p className="text-sm text-gray-500 mb-6">Record CPD activities against a registrar program.</p>

      {/* Program Picker */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Select Registrar Program <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        >
          <option value="">Choose a program...</option>
          {openPrograms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.member.title} {p.member.firstName} {p.member.lastName} — {p.areaOfPractice}
            </option>
          ))}
        </select>
      </section>

      {program && (
        <section className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-aps-blue/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">CPD Logging</h2>
          <p className="text-sm text-gray-500 mb-1 max-w-md mx-auto">
            CPD hours for registrar programs are logged through the CPD logging process.
            Activities logged against your AoPE ({program.areaOfPractice}) will automatically count towards your registrar program requirements.
          </p>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Navigate to CPD Activities to log your CPD hours.
          </p>
          <button
            onClick={() => navigate('/internal/cpd/profiles')}
            className="px-5 py-2.5 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Go to CPD Activities
          </button>
        </section>
      )}
    </PageShell>
  );
}
