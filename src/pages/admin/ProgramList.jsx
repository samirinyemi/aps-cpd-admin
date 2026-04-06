import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getMemberName(p) {
  return `${p.member.title} ${p.member.firstName} ${p.member.lastName}`;
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="14" rx="2" />
      <path d="M3 8h14M7 2v4M13 2v4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 3.5a2.12 2.12 0 013 3L7 17l-4 1 1-4L14.5 3.5z" />
    </svg>
  );
}

function ProgramCard({ program, layout, onNavigate }) {
  const isGrid = layout === 'grid';
  const memberName = getMemberName(program);

  if (isGrid) {
    return (
      <div
        onClick={() => onNavigate(program)}
        className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-aps-blue/40 hover:shadow-sm transition-all flex flex-col"
      >
        <h3 className="text-base font-semibold text-gray-900">{memberName}</h3>
        <p className="text-sm text-gray-500 mt-1">{program.areaOfPractice}</p>
        <p className="text-xs text-gray-400 mt-1 flex-1">
          {program.memberNumber} &middot; {program.memberGrade}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-4">
          <CalendarIcon />
          Commenced {formatDate(program.commencementDate)}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <StatusBadge status={program.status} />
          {program.status !== 'Closed' && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onNavigate(program, 'edit')}
                className="p-2 rounded-md text-aps-blue bg-aps-blue-light/60 hover:bg-aps-blue-light transition-colors"
                title="Edit program"
              >
                <EditIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List layout
  return (
    <div
      onClick={() => onNavigate(program)}
      className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-aps-blue/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900">{memberName}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {program.areaOfPractice} &middot; {program.memberNumber} &middot; {program.memberGrade}
          </p>
        </div>
        {program.status !== 'Closed' && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onNavigate(program, 'edit')}
              className="p-2 rounded-md text-aps-blue bg-aps-blue-light/60 hover:bg-aps-blue-light transition-colors"
              title="Edit program"
            >
              <EditIcon />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarIcon />
          Commenced {formatDate(program.commencementDate)}
        </span>
        <StatusBadge status={program.status} />
      </div>
    </div>
  );
}

export default function ProgramList({ programs }) {
  const navigate = useNavigate();
  const [layout, setLayout] = useState('list');

  function handleNavigate(program, mode) {
    if (mode === 'edit') {
      navigate(`/admin/registrar/programs/${program.id}/edit`);
    } else {
      navigate(`/admin/registrar/programs/${program.id}`);
    }
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Registrar Programs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{programs.length} program{programs.length !== 1 ? 's' : ''} found</p>
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
            onClick={() => navigate('/admin/registrar/programs/new')}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Create new program
          </button>
        </div>
      </div>

      {programs.length === 0 ? (
        <EmptyState message="No registrar programs have been created yet." />
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} layout="grid" onNavigate={handleNavigate} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} layout="list" onNavigate={handleNavigate} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
