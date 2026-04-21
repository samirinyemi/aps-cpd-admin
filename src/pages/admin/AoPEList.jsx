import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Clock, List, LayoutGrid } from 'lucide-react';
import PageShell from '../../components/PageShell';
import EmptyState from '../../components/EmptyState';

const EditIcon = () => <Pencil size={16} strokeWidth={1.5} />;
const ClockIcon = () => <Clock size={14} strokeWidth={1.5} />;

function AoPECard({ program, layout, onNavigate }) {
  const isGrid = layout === 'grid';

  if (isGrid) {
    return (
      <div
        onClick={() => onNavigate(program)}
        className="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-aps-blue/40 hover:shadow-sm transition-all flex flex-col"
      >
        <h3 className="text-base font-semibold text-gray-900">{program.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{program.areaOfPractice}</p>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-4">
          <ClockIcon />
          {program.totalRequiredHours.toLocaleString()} total hours
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div>
            <span className="block text-gray-400">Supervision</span>
            <span className="font-medium text-gray-700">{program.requiredSupervisionHours}h</span>
          </div>
          <div>
            <span className="block text-gray-400">Practice</span>
            <span className="font-medium text-gray-700">{program.requiredPracticeHours}h</span>
          </div>
          <div>
            <span className="block text-gray-400">CPD</span>
            <span className="font-medium text-gray-700">{program.requiredCPDHours}h</span>
          </div>
        </div>

        <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onNavigate(program, 'edit')}
              className="p-2 rounded-md text-aps-blue bg-aps-blue-light/60 hover:bg-aps-blue-light transition-colors"
              title="Edit program"
            >
              <EditIcon />
            </button>
          </div>
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
          <h3 className="text-base font-semibold text-gray-900">{program.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{program.areaOfPractice}</p>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onNavigate(program, 'edit')}
            className="p-2 rounded-md text-aps-blue bg-aps-blue-light/60 hover:bg-aps-blue-light transition-colors"
            title="Edit program"
          >
            <EditIcon />
          </button>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon />
          {program.totalRequiredHours.toLocaleString()} total hours
        </span>
        <span>Supervision {program.requiredSupervisionHours}h</span>
        <span>Practice {program.requiredPracticeHours}h</span>
        <span>CPD {program.requiredCPDHours}h</span>
      </div>
    </div>
  );
}

export default function AoPEList({ aoPEPrograms }) {
  const navigate = useNavigate();
  const [layout, setLayout] = useState('list');

  function handleNavigate(program, mode) {
    if (mode === 'edit') {
      navigate(`/admin/registrar/aope/${program.id}/edit`);
    } else {
      navigate(`/admin/registrar/aope/${program.id}`);
    }
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">AoPE Compliance Configuration</h1>
          <p className="text-sm text-gray-500 mt-0.5">{aoPEPrograms.length} program{aoPEPrograms.length !== 1 ? 's' : ''} configured</p>
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
            onClick={() => navigate('/admin/registrar/aope/new')}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Create new program
          </button>
        </div>
      </div>

      {aoPEPrograms.length === 0 ? (
        <EmptyState message="No AoPE compliance programs have been configured yet." />
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {aoPEPrograms.map((p) => (
            <AoPECard key={p.id} program={p} layout="grid" onNavigate={handleNavigate} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {aoPEPrograms.map((p) => (
            <AoPECard key={p.id} program={p} layout="list" onNavigate={handleNavigate} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
