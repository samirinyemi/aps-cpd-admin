import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, List, LayoutGrid } from 'lucide-react';
import PageShell from '../../components/PageShell';
import EmptyState from '../../components/EmptyState';

const EditIcon = () => <Pencil size={14} strokeWidth={1.5} />;

function LocationCard({ location, layout, onView, onEdit, programLabel }) {
  const assigned = location.assignedPrograms || [];
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
            <p className="text-sm font-semibold text-gray-900 truncate">{location.employerName}</p>
            {location.positionTitle && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{location.positionTitle}</p>
            )}
          </div>
          <div onClick={stop}>{editBtn}</div>
        </div>
        <dl className="text-xs text-gray-600 space-y-1.5 mb-3">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-gray-500">Location</dt>
            <dd className="font-medium text-gray-900 truncate">{location.suburb}, {location.state}</dd>
          </div>
          {location.phone && (
            <div className="flex items-baseline justify-between gap-2">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">{location.phone}</dd>
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
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-aps-blue-light text-aps-blue border border-aps-blue/20"
                >
                  {programLabel(ap.programId)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onView}
      className="cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:border-aps-blue/50 hover:shadow-sm transition flex items-center gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{location.employerName}</p>
          {location.positionTitle && (
            <>
              <span className="text-xs text-gray-400">·</span>
              <p className="text-xs text-gray-500">{location.positionTitle}</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
          <span><span className="text-gray-500">Location:</span> <span className="font-medium text-gray-900">{location.suburb}, {location.state}</span></span>
          {location.phone && (
            <span><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{location.phone}</span></span>
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
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-aps-blue-light text-aps-blue border border-aps-blue/20"
              >
                {programLabel(ap.programId)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div onClick={stop}>{editBtn}</div>
    </div>
  );
}

export default function PracticeLocationList({ locations, programs }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [layout, setLayout] = useState('list');

  const states = useMemo(
    () => Array.from(new Set(locations.map((l) => l.state))).sort(),
    [locations]
  );

  const filtered = useMemo(() => {
    return locations.filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${l.employerName} ${l.positionTitle || ''} ${l.suburb} ${l.addressLine1 || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (stateFilter && l.state !== stateFilter) return false;
      if (assignmentFilter === 'assigned' && l.assignedPrograms.length === 0) return false;
      if (assignmentFilter === 'unassigned' && l.assignedPrograms.length > 0) return false;
      return true;
    });
  }, [locations, search, stateFilter, assignmentFilter]);

  function programLabel(programId) {
    const p = programs.find((pr) => pr.id === programId);
    return p ? `${p.member.firstName} ${p.member.lastName}` : 'Unknown';
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manage Practice Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {locations.length} location{locations.length !== 1 ? 's' : ''} in catalogue
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
              <List size={14} strokeWidth={1.5} />
              List
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 ${
                layout === 'grid' ? 'bg-aps-blue text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={14} strokeWidth={1.5} />
              Grid
            </button>
          </div>
          <button
            onClick={() => navigate('/admin/registrar/practice-locations/new')}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Add location
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employer, position, or suburb"
          className="flex-1 min-w-[220px] h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        />
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        >
          <option value="">All states</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
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
        <EmptyState message="No practice locations match the current filters." />
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((l) => (
            <LocationCard
              key={l.id}
              location={l}
              layout="grid"
              onView={() => navigate(`/admin/registrar/practice-locations/${l.id}`)}
              onEdit={() => navigate(`/admin/registrar/practice-locations/${l.id}?edit=1`)}
              programLabel={programLabel}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((l) => (
            <LocationCard
              key={l.id}
              location={l}
              layout="list"
              onView={() => navigate(`/admin/registrar/practice-locations/${l.id}`)}
              onEdit={() => navigate(`/admin/registrar/practice-locations/${l.id}?edit=1`)}
              programLabel={programLabel}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
