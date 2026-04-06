import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(h, m) {
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
}

const emptyForm = { completionDate: '', hours: '', minutes: '', supervisionType: '', supervisorId: '' };

export default function LogSupervision({ programs, setPrograms }) {
  const [searchParams] = useSearchParams();
  const openPrograms = programs.filter((p) => p.status === 'Open');
  const [selectedId, setSelectedId] = useState(searchParams.get('programId') || '');
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const [logAnother, setLogAnother] = useState(false);
  const historyRef = useRef(null);

  const program = openPrograms.find((p) => p.id === selectedId);

  // Pre-select from query param
  useEffect(() => {
    const qid = searchParams.get('programId');
    if (qid && openPrograms.find((p) => p.id === qid)) setSelectedId(qid);
  }, [searchParams]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.completionDate) errs.completionDate = 'Required';
    if (!form.hours && !form.minutes) errs.hours = 'Enter duration';
    if (!form.supervisionType) errs.supervisionType = 'Required';
    if (!form.supervisorId) errs.supervisorId = 'Required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const supervisor = program.supervisors.find((s) => s.id === form.supervisorId);
    const activity = {
      id: `act-${Date.now()}`,
      activityType: 'Supervision',
      completionDate: form.completionDate,
      hours: Number(form.hours) || 0,
      minutes: Number(form.minutes) || 0,
      supervisionType: form.supervisionType,
      supervisorId: form.supervisorId,
      supervisorName: supervisor ? `${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}` : '',
      directContactHours: null,
      directContactMinutes: null,
      placeId: null,
      employerName: null,
      allocation: program.areaOfPractice,
    };

    setPrograms((prev) =>
      prev.map((p) => p.id === selectedId ? { ...p, activities: [...(p.activities || []), activity] } : p)
    );
    setLogAnother(true);
  }

  function handleLogAnother(yes) {
    setLogAnother(false);
    if (yes) {
      setForm({ ...emptyForm });
      setErrors({});
    } else {
      historyRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const activities = program?.activities?.filter((a) => a.activityType === 'Supervision') || [];
  const inputClass = (field) =>
    `w-full h-14 px-4 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <PageShell>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Log Supervision Hours</h1>
      <p className="text-sm text-gray-500 mb-6">Record supervision activities against a registrar program.</p>

      {/* Program Picker */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Select Registrar Program <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setForm({ ...emptyForm }); setErrors({}); }}
          className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
        >
          <option value="">Choose a program...</option>
          {openPrograms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.member.title} {p.member.firstName} {p.member.lastName} — {p.areaOfPractice}
            </option>
          ))}
        </select>
        {openPrograms.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">No open registrar programs available.</p>
        )}
      </section>

      {program && (
        <>
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Activity Details</h2>
              <div className="space-y-4">
                {/* Read-only fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type of Activity</label>
                    <div className="h-14 px-4 flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      <span className="px-2.5 py-1 bg-aps-blue/10 text-aps-blue rounded-full text-xs font-medium">Supervision</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Allocation (AoPE)</label>
                    <div className="h-14 px-4 flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {program.areaOfPractice}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Completion Date <span className="text-red-500">*</span>
                  </label>
                  <input type="date" value={form.completionDate} onChange={(e) => update('completionDate', e.target.value)}
                    className={inputClass('completionDate')} />
                  {errors.completionDate && <p className="mt-1 text-sm text-red-600">{errors.completionDate}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Hours <span className="text-red-500">*</span>
                    </label>
                    <input type="number" min="0" value={form.hours} onChange={(e) => update('hours', e.target.value)}
                      placeholder="0" className={inputClass('hours')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Minutes</label>
                    <input type="number" min="0" max="59" value={form.minutes} onChange={(e) => update('minutes', e.target.value)}
                      placeholder="0" className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
                  </div>
                </div>
                {errors.hours && <p className="-mt-2 text-sm text-red-600">{errors.hours}</p>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Supervision Type <span className="text-red-500">*</span>
                  </label>
                  <select value={form.supervisionType} onChange={(e) => update('supervisionType', e.target.value)}
                    className={inputClass('supervisionType')}>
                    <option value="">Select...</option>
                    <option value="Individual">Individual</option>
                    <option value="Group">Group</option>
                  </select>
                  {errors.supervisionType && <p className="mt-1 text-sm text-red-600">{errors.supervisionType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Supervisor <span className="text-red-500">*</span>
                  </label>
                  <select value={form.supervisorId} onChange={(e) => update('supervisorId', e.target.value)}
                    className={inputClass('supervisorId')}>
                    <option value="">Select supervisor...</option>
                    {program.supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} {s.firstName} {s.lastName} ({s.supervisionType})
                      </option>
                    ))}
                  </select>
                  {errors.supervisorId && <p className="mt-1 text-sm text-red-600">{errors.supervisorId}</p>}
                </div>
              </div>
            </section>

            <div className="flex justify-end mb-8">
              <button type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
                Log Activity
              </button>
            </div>
          </form>

          {/* Activity History */}
          <section ref={historyRef} className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Supervision Activity History
              <span className="text-sm font-normal text-gray-400 ml-2">({activities.length})</span>
            </h2>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No supervision activities logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Date</th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Supervisor</th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-2 pr-4 font-medium text-gray-500">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...activities].sort((a, b) => b.completionDate.localeCompare(a.completionDate)).map((a) => (
                      <tr key={a.id} className="border-b border-gray-100">
                        <td className="py-3 pr-4">{formatDate(a.completionDate)}</td>
                        <td className="py-3 pr-4">{a.supervisorName}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            a.supervisionType === 'Individual' ? 'bg-aps-blue/10 text-aps-blue' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {a.supervisionType}
                          </span>
                        </td>
                        <td className="py-3 pr-4">{formatDuration(a.hours, a.minutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Log Another Dialog */}
      {logAnother && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 10 8 14 16 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Activity Logged</h3>
            <p className="text-sm text-gray-500 mb-5">Supervision activity has been recorded successfully. Would you like to log another?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => handleLogAnother(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
                No, view history
              </button>
              <button onClick={() => handleLogAnother(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
                Yes, log another
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
