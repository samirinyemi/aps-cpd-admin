import { useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import PageShell from '../../components/PageShell';
import EmptyState from '../../components/EmptyState';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(h, m) {
  const parts = [];
  if (Number(h)) parts.push(`${h}h`);
  if (Number(m)) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
}

function memberName(p) {
  return `${p.member.title} ${p.member.firstName} ${p.member.lastName}`;
}

const EMPTY = {
  programId: '',
  completionDate: '',
  hours: '',
  minutes: '',
  activityTitle: '',
  notes: '',
  allocation: '',
};

export default function LogCpdHours({ programs = [], setPrograms }) {
  const openPrograms = useMemo(
    () => programs.filter((p) => p.status === 'Open'),
    [programs]
  );

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(null); // last saved activity summary

  const selectedProgram = useMemo(
    () => openPrograms.find((p) => p.id === form.programId) || null,
    [openPrograms, form.programId]
  );

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (saved) setSaved(null);
  }

  function validate() {
    const errs = {};
    if (!form.programId) errs.programId = 'Select a registrar program.';
    if (!form.completionDate) errs.completionDate = 'Required.';
    if (!form.activityTitle.trim()) errs.activityTitle = 'Required.';
    const hrs = Number(form.hours);
    const mins = Number(form.minutes);
    if (form.hours === '' && form.minutes === '') {
      errs.hours = 'Enter a duration.';
    } else {
      if (hrs < 0 || isNaN(hrs)) errs.hours = 'Must be 0 or more.';
      if (mins < 0 || mins > 59 || isNaN(mins)) errs.minutes = '0 – 59 only.';
      if (hrs === 0 && mins === 0) errs.hours = 'Duration must be greater than zero.';
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const activity = {
      id: `act-cpd-${Date.now()}`,
      activityType: 'CPD',
      completionDate: form.completionDate,
      hours: Number(form.hours) || 0,
      minutes: Number(form.minutes) || 0,
      supervisionType: null,
      supervisorId: null,
      supervisorName: null,
      directContactHours: null,
      directContactMinutes: null,
      placeId: null,
      employerName: null,
      allocation: form.allocation || selectedProgram?.areaOfPractice || null,
      activityTitle: form.activityTitle.trim(),
      notes: form.notes.trim() || null,
    };

    setPrograms((prev) =>
      prev.map((p) =>
        p.id === form.programId
          ? { ...p, activities: [...(p.activities || []), activity] }
          : p
      )
    );

    setSaved({
      member: memberName(selectedProgram),
      aoPE: selectedProgram?.areaOfPractice,
      duration: formatDuration(form.hours, form.minutes),
      date: formatDate(form.completionDate),
      title: form.activityTitle.trim(),
    });

    // Reset form but keep program selection for convenience
    setForm((prev) => ({ ...EMPTY, programId: prev.programId }));
    setErrors({});
  }

  const inputBase =
    'w-full h-12 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue';

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Log CPD Hours</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Record a CPD activity against an open registrar program on behalf of a registrar.
        </p>
      </div>

      {openPrograms.length === 0 ? (
        <EmptyState message="There are no open registrar programs to log hours against." />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">

            {/* Section 1 — Program Selection */}
            <div className="p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Registrar Program</h2>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.programId}
                  onChange={(e) => update('programId', e.target.value)}
                  className={`${inputBase} bg-white ${errors.programId ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">Select a program…</option>
                  {openPrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {memberName(p)} — {p.areaOfPractice}
                    </option>
                  ))}
                </select>
                {errors.programId && (
                  <p className="mt-1 text-sm text-red-600">{errors.programId}</p>
                )}
              </div>

              {/* Selected program summary */}
              {selectedProgram && (
                <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border border-gray-100 rounded-md p-4 text-xs">
                  <div>
                    <dt className="text-gray-500 mb-0.5">Member number</dt>
                    <dd className="font-medium text-gray-900">{selectedProgram.memberNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-0.5">Area of Practice</dt>
                    <dd className="font-medium text-gray-900">{selectedProgram.areaOfPractice}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-0.5">Commenced</dt>
                    <dd className="font-medium text-gray-900">{formatDate(selectedProgram.commencementDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 mb-0.5">Status</dt>
                    <dd className="font-medium text-green-700">Open</dd>
                  </div>
                </dl>
              )}
            </div>

            {/* Section 2 — Activity Details */}
            <div className="p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Activity Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">

                {/* Activity Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    CPD Activity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    placeholder="e.g. Workshop on evidence-based trauma treatment"
                    value={form.activityTitle}
                    onChange={(e) => update('activityTitle', e.target.value)}
                    className={`${inputBase} ${errors.activityTitle ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.activityTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.activityTitle}</p>
                  )}
                </div>

                {/* Completion Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Completion Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.completionDate}
                    onChange={(e) => update('completionDate', e.target.value)}
                    className={`${inputBase} ${errors.completionDate ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.completionDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.completionDate}</p>
                  )}
                </div>

                {/* AoPE Allocation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Allocation (AoPE)
                  </label>
                  <input
                    type="text"
                    value={form.allocation || selectedProgram?.areaOfPractice || ''}
                    onChange={(e) => update('allocation', e.target.value)}
                    placeholder={selectedProgram?.areaOfPractice || 'Auto-filled from program'}
                    className={`${inputBase} border-gray-300`}
                    readOnly={Boolean(selectedProgram)}
                  />
                  {selectedProgram && (
                    <p className="mt-1 text-xs text-gray-500">
                      Inherited from the program's area of practice.
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Duration (CPD hours) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="999"
                        placeholder="Hours"
                        value={form.hours}
                        onChange={(e) => update('hours', e.target.value)}
                        className={`${inputBase} ${errors.hours ? 'border-red-400' : 'border-gray-300'}`}
                      />
                    </div>
                    <span className="text-sm text-gray-500 shrink-0">h</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="Minutes"
                        value={form.minutes}
                        onChange={(e) => update('minutes', e.target.value)}
                        className={`${inputBase} ${errors.minutes ? 'border-red-400' : 'border-gray-300'}`}
                      />
                    </div>
                    <span className="text-sm text-gray-500 shrink-0">m</span>
                  </div>
                  {(errors.hours || errors.minutes) && (
                    <p className="mt-1 text-sm text-red-600">{errors.hours || errors.minutes}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    placeholder="Optional additional details about this activity…"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-between gap-4 bg-gray-50 rounded-b-lg">
              {/* Success banner */}
              {saved ? (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 size={16} strokeWidth={1.5} className="shrink-0" />
                  <span>
                    Logged <strong>{saved.duration}</strong> CPD for{' '}
                    <strong>{saved.member}</strong> on {saved.date} —{' '}
                    <em>{saved.title}</em>
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-500">
                  Fields marked <span className="text-red-500">*</span> are required.
                </span>
              )}

              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark shrink-0"
              >
                Log CPD hours
              </button>
            </div>
          </div>
        </form>
      )}
    </PageShell>
  );
}
