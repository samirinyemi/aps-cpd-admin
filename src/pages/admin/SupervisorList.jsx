import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import EmptyState from '../../components/EmptyState';

function fullName(s) {
  return `${s.title} ${s.firstName} ${s.lastName}`;
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 3.5a2.12 2.12 0 013 3L7 17l-4 1 1-4L14.5 3.5z" />
    </svg>
  );
}

function SupervisorCard({ supervisor, layout, onView, onEdit, programLabel }) {
  const assigned = supervisor.assignedPrograms || [];
  const stop = (e) => e.stopPropagation();

  const editBtn = (
    <button
      type="button"
      onClick={(e) => { stop(e); onEdit(); }}
      className="p-1.5 rounded text-aps-blue hover:bg-aps-blue-light"
      title="Edit"
    >
      <EditIcon />
    </button>
  );

  if (layout === 'grid') {
    return (
      <div
        onClick={onView}
        className="cursor-pointer bg-white border border-gray-200 rounded-lg p-5 hover:border-aps-blue/50 hover:shadow-sm transition"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{fullName(supervisor)}</p>
            <p className="text-xs text-gray-500 mt-0.5">AHPRA: {supervisor.ahpraNumber}</p>
          </div>
          <div onClick={stop}>{editBtn}</div>
        </div>
        <dl className="text-xs text-gray-600 space-y-1.5 mb-3">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">AoPE</dt>
            <dd className="font-medium text-gray-900 truncate">{supervisor.supervisorAoPE}</dd>
          </div>
          {supervisor.email && (
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900 truncate">{supervisor.email}</dd>
            </div>
          )}
        </dl>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Assigned programs</p>
          {assigned.length === 0 ? (
            <span className="text-xs text-gray-400 italic">Unassigned</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {assigned.map((ap) => (
                <span
                  key={ap.programId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-aps-blue-light text-aps-blue border border-aps-blue/20"
                >
                  {programLabel(ap.programId)}
                  <span className="text-[10px] opacity-60">· {ap.supervisionType}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // list layout
  return (
    <div
      onClick={onView}
      className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-aps-blue/50 hover:shadow-sm transition flex items-center gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{fullName(supervisor)}</p>
          <span className="text-xs text-gray-400">·</span>
          <p className="text-xs text-gray-500">AHPRA {supervisor.ahpraNumber}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span><span className="text-gray-500">AoPE:</span> <span className="font-medium text-gray-900">{supervisor.supervisorAoPE}</span></span>
          {supervisor.email && (
            <span><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{supervisor.email}</span></span>
          )}
          <span>
            <span className="text-gray-500">Programs:</span>{' '}
            {assigned.length === 0 ? (
              <span className="italic text-gray-400">Unassigned</span>
            ) : (
              <span className="font-medium text-gray-900">{assigned.length}</span>
            )}
          </span>
        </div>
        {assigned.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {assigned.map((ap) => (
              <span
                key={ap.programId}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-aps-blue-light text-aps-blue border border-aps-blue/20"
              >
                {programLabel(ap.programId)}
                <span className="text-[10px] opacity-60">· {ap.supervisionType}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div onClick={stop}>{editBtn}</div>
    </div>
  );
}

export default function SupervisorList({ supervisors, programs }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [aoPEFilter, setAoPEFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [layout, setLayout] = useState('list');

  const aoPEs = useMemo(
    () => Array.from(new Set(supervisors.map((s) => s.supervisorAoPE))).sort(),
    [supervisors]
  );

  const filtered = useMemo(() => {
    return supervisors.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${fullName(s)} ${s.ahpraNumber} ${s.email || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (aoPEFilter && s.supervisorAoPE !== aoPEFilter) return false;
      if (assignmentFilter === 'assigned' && s.assignedPrograms.length === 0) return false;
      if (assignmentFilter === 'unassigned' && s.assignedPrograms.length > 0) return false;
      return true;
    });
  }, [supervisors, search, aoPEFilter, assignmentFilter]);

  function programLabel(programId) {
    const p = programs.find((pr) => pr.id === programId);
    if (!p) return 'Unknown';
    return `${p.member.firstName} ${p.member.lastName}`;
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manage Supervisors</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {supervisors.length} supervisor{supervisors.length !== 1 ? 's' : ''} in catalogue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setLayout('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                layout === 'list' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
              </svg>
              List
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
                layout === 'grid' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
              </svg>
              Grid
            </button>
          </div>
          <button
            onClick={() => navigate('/admin/registrar/supervisors/new')}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Add supervisor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, AHPRA, or email"
          className="flex-1 min-w-[220px] h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        />
        <select
          value={aoPEFilter}
          onChange={(e) => setAoPEFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        >
          <option value="">All AoPEs</option>
          {aoPEs.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        >
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No supervisors match the current filters." />
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <SupervisorCard
              key={s.id}
              supervisor={s}
              layout="grid"
              onView={() => navigate(`/admin/registrar/supervisors/${s.id}`)}
              onEdit={() => navigate(`/admin/registrar/supervisors/${s.id}?edit=1`)}
              programLabel={programLabel}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <SupervisorCard
              key={s.id}
              supervisor={s}
              layout="list"
              onView={() => navigate(`/admin/registrar/supervisors/${s.id}`)}
              onEdit={() => navigate(`/admin/registrar/supervisors/${s.id}?edit=1`)}
              programLabel={programLabel}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
