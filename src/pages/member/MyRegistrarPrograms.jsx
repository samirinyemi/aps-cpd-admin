import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { compliancePercent, findLinkedTemplate } from '../../lib/compliance';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyRegistrarPrograms({ programs, aoPEPrograms }) {
  const { member } = useAuth();
  const navigate = useNavigate();

  const myPrograms = useMemo(
    () => (programs || []).filter((p) => p.memberNumber === member?.memberNumber),
    [programs, member]
  );

  return (
    <PageShell>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Registrar Programs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {myPrograms.length === 0
              ? "You're not currently enrolled in any registrar program."
              : `${myPrograms.length} registrar program${myPrograms.length !== 1 ? 's' : ''} enrolled.`}
          </p>
        </div>
        <button
          onClick={() => navigate('/member/registrar/new')}
          className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
        >
          Begin new registrar program
        </button>
      </div>

      {myPrograms.length === 0 ? (
        <section className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Click <span className="font-medium">Begin new registrar program</span> above to start your first one.
          </p>
          <Link to="/member/cpd" className="text-xs text-aps-blue hover:underline">← Back to My CPD</Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myPrograms.map((p) => {
            const template = findLinkedTemplate(p, aoPEPrograms || []);
            const pct = template ? compliancePercent(p, template) : 0;
            const barColour = pct >= 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-400' : 'bg-gray-300';
            return (
              <Link
                key={p.id}
                to={`/member/registrar/${p.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-5 hover:border-aps-blue/50 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{p.areaOfPractice}</h3>
                    <p className="text-xs text-gray-500 mt-1">Commenced {formatDate(p.commencementDate)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-gray-600 mb-2">{p.qualification}</p>
                <div className="flex items-baseline justify-between text-xs text-gray-600 mb-1.5">
                  <span>Compliance progress</span>
                  <span className="font-medium text-gray-900">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${barColour}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <p className="text-xs text-aps-blue hover:underline mt-3">Open program →</p>
              </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
