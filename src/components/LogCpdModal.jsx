import { useState, useEffect, useMemo } from 'react';

const emptyForm = {
  programId: '',
  completionDate: '',
  description: '',
  hours: '',
  minutes: '',
};

export default function LogCpdModal({ open, program, programs, activity, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(activity?.id);
  // When a specific program is passed, it's locked. Otherwise, user picks from Open programs.
  const isLocked = Boolean(program);
  const eligiblePrograms = useMemo(
    () => (programs || []).filter((p) => p.status === 'Open'),
    [programs]
  );

  useEffect(() => {
    if (open) {
      if (activity) {
        setForm({
          programId: activity.programId || program?.id || '',
          completionDate: activity.completionDate || '',
          description: activity.description || '',
          hours: activity.hours != null ? String(activity.hours) : '',
          minutes: activity.minutes != null ? String(activity.minutes) : '',
        });
      } else {
        setForm({ ...emptyForm, programId: program?.id || '' });
      }
      setErrors({});
    }
  }, [open, program, activity]);

  if (!open) return null;
  if (isLocked && !program) return null;

  const selectedProgram = isLocked
    ? program
    : eligiblePrograms.find((p) => p.id === form.programId);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!isLocked && !form.programId) errs.programId = 'Select a program';
    if (!form.completionDate) errs.completionDate = 'Required';
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.hours && !form.minutes) errs.hours = 'Enter duration';
    if (Number(form.hours) > 500) errs.hours = 'Maximum 500 hours';
    if (Number(form.minutes) > 59) errs.minutes = 'Maximum 59 minutes';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const hrs = Number(form.hours) || 0;
    const mins = Number(form.minutes) || 0;
    const target = selectedProgram;

    const payload = {
      id: isEdit ? activity.id : `act-${Date.now()}`,
      activityType: 'CPD',
      completionDate: form.completionDate,
      description: form.description.trim(),
      hours: hrs,
      minutes: mins,
      supervisionType: null,
      supervisorId: null,
      supervisorName: null,
      employerName: null,
      allocation: target.areaOfPractice || null,
    };
    onSave(target.id, payload, { isEdit, previousProgramId: activity?.programId });
  }

  const inputClass = (field) =>
    `w-full h-12 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{isEdit ? 'Edit CPD Activity' : 'Log CPD Hours'}</h3>
        <p className="text-sm text-gray-500 mb-5">
          {isLocked
            ? `${program.member.firstName} ${program.member.lastName} — ${program.areaOfPractice}`
            : 'Record a CPD activity against an open registrar program.'}
        </p>

        <div className="space-y-4 mb-6">
          {!isLocked && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Registrar Program</label>
              {eligiblePrograms.length === 0 ? (
                <p className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-md p-3">
                  No Open registrar programs available.
                </p>
              ) : (
                <select
                  value={form.programId}
                  onChange={(e) => update('programId', e.target.value)}
                  className={inputClass('programId') + ' bg-white'}
                >
                  <option value="">Select a program…</option>
                  {eligiblePrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.member.firstName} {p.member.lastName} — {p.areaOfPractice}
                    </option>
                  ))}
                </select>
              )}
              {errors.programId && <p className="mt-1 text-sm text-red-600">{errors.programId}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Completion Date</label>
            <input
              type="date"
              value={form.completionDate}
              onChange={(e) => update('completionDate', e.target.value)}
              className={inputClass('completionDate')}
            />
            {errors.completionDate && <p className="mt-1 text-sm text-red-600">{errors.completionDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Activity Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="e.g. Workshop on evidence-based practice"
              className={inputClass('description')}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-1.5">Duration</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hours (max 500)</label>
                <input
                  type="number" min="0" max="500"
                  value={form.hours}
                  onChange={(e) => update('hours', e.target.value)}
                  placeholder="0"
                  className={inputClass('hours')}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minutes (max 59)</label>
                <input
                  type="number" min="0" max="59"
                  value={form.minutes}
                  onChange={(e) => update('minutes', e.target.value)}
                  placeholder="0"
                  className={inputClass('minutes')}
                />
              </div>
            </div>
            {(errors.hours || errors.minutes) && (
              <p className="mt-1 text-sm text-red-600">{errors.hours || errors.minutes}</p>
            )}
          </fieldset>

          {selectedProgram && (
            <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-md p-3">
              CPD hours logged against the AoPE <span className="font-medium text-gray-700">{selectedProgram.areaOfPractice}</span> automatically count towards this registrar program's CPD requirement.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isLocked && eligiblePrograms.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save changes' : 'Log CPD'}
          </button>
        </div>
      </div>
    </div>
  );
}
