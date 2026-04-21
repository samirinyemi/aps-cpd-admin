import { useState, useEffect, useMemo } from 'react';

const emptyForm = { programId: '', supervisorId: '', completionDate: '', hours: '', minutes: '', supervisionType: 'Individual' };

// Props:
//   supervisor (optional)        — when provided, the session is locked to this single supervisor.
//   supervisorOptions (optional) — array of supervisors to pick from when `supervisor` is not provided.
//                                  Used on the member side (HLBR US-1701) where the supervisor is a list-of-values.
//   programs, lockedProgramId, onSave, onCancel — as before.
export default function LogSessionModal({ open, supervisor, supervisorOptions, programs, lockedProgramId, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  const eligiblePrograms = useMemo(() => {
    if (!supervisor) return [];
    const assignedIds = new Set(supervisor.assignedPrograms.map((a) => a.programId));
    return programs.filter((p) => p.status === 'Open' && assignedIds.has(p.id));
  }, [supervisor, programs]);

  const supervisorPickerList = useMemo(
    () => (Array.isArray(supervisorOptions) ? supervisorOptions : []),
    [supervisorOptions]
  );
  const isSupervisorLocked = Boolean(supervisor);

  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        programId: lockedProgramId || (eligiblePrograms.length === 1 ? eligiblePrograms[0].id : ''),
        supervisorId: isSupervisorLocked ? (supervisor?.id || '') : (supervisorPickerList.length === 1 ? supervisorPickerList[0].id : ''),
      });
      setErrors({});
    }
  }, [open, lockedProgramId, eligiblePrograms.length, isSupervisorLocked, supervisor, supervisorPickerList]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.programId) errs.programId = 'Required';
    if (!isSupervisorLocked && !form.supervisorId) errs.supervisorId = 'Select a supervisor';
    if (!form.completionDate) errs.completionDate = 'Required';
    if (!form.hours && !form.minutes) errs.hours = 'Enter duration';
    if (Number(form.minutes) > 59) errs.minutes = 'Maximum 59 minutes';
    if (!form.supervisionType) errs.supervisionType = 'Required';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const program = programs.find((p) => p.id === form.programId);
    const chosenSupervisor = isSupervisorLocked
      ? supervisor
      : supervisorPickerList.find((s) => s.id === form.supervisorId);
    if (!chosenSupervisor) { setErrors({ supervisorId: 'Select a supervisor' }); return; }

    // supervisorRole resolution:
    // - locked supervisor path: look it up in the supervisor's assignedPrograms for the selected program
    // - picker path: the supervisor list already carries its supervisionType on the program record
    const lockedAssignment = isSupervisorLocked
      ? supervisor.assignedPrograms.find((a) => a.programId === form.programId)
      : null;
    const supervisorRole = isSupervisorLocked
      ? (lockedAssignment?.supervisionType || null)
      : (chosenSupervisor.supervisionType || null);

    const activity = {
      id: `act-${Date.now()}`,
      activityType: 'Supervision',
      completionDate: form.completionDate,
      hours: Number(form.hours) || 0,
      minutes: Number(form.minutes) || 0,
      supervisionType: form.supervisionType,
      supervisorId: chosenSupervisor.id,
      supervisorName: `${chosenSupervisor.title} ${chosenSupervisor.firstName} ${chosenSupervisor.lastName}`,
      supervisorRole,
      directContactHours: null,
      directContactMinutes: null,
      placeId: null,
      employerName: null,
      allocation: program?.areaOfPractice || null,
    };
    onSave(form.programId, activity);
  }

  const inputClass = (field) =>
    `w-full h-12 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  const lockedProgram = lockedProgramId ? programs.find((p) => p.id === lockedProgramId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Log Supervision Session</h3>
        <p className="text-sm text-gray-500 mb-5">
          {isSupervisorLocked
            ? `${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}`
            : 'Select the supervisor this session was with.'}
        </p>

        {!isSupervisorLocked && supervisorPickerList.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-md mb-6">
            <p className="text-sm text-gray-500">
              No supervisors linked to this program yet. Add supervisors first.
            </p>
          </div>
        ) : !lockedProgramId && isSupervisorLocked && eligiblePrograms.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-md mb-6">
            <p className="text-sm text-gray-500">
              No Open programs assigned. Assign this supervisor to a program first.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Registrar Program</label>
              {lockedProgramId ? (
                <div className="h-12 px-3 flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {lockedProgram
                    ? `${lockedProgram.member.title} ${lockedProgram.member.firstName} ${lockedProgram.member.lastName} — ${lockedProgram.areaOfPractice}`
                    : '—'}
                </div>
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

            {!isSupervisorLocked && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Supervisor</label>
                <select
                  value={form.supervisorId}
                  onChange={(e) => update('supervisorId', e.target.value)}
                  className={inputClass('supervisorId') + ' bg-white'}
                >
                  <option value="">Select a supervisor…</option>
                  {supervisorPickerList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} {s.firstName} {s.lastName} — {s.supervisionType}
                    </option>
                  ))}
                </select>
                {errors.supervisorId && <p className="mt-1 text-sm text-red-600">{errors.supervisorId}</p>}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hours</label>
                <input
                  type="number" min="0"
                  value={form.hours}
                  onChange={(e) => update('hours', e.target.value)}
                  placeholder="0"
                  className={inputClass('hours')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Minutes</label>
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
              <p className="-mt-2 text-sm text-red-600">{errors.hours || errors.minutes}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supervision Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['Individual', 'Group'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update('supervisionType', t)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-md border transition-colors ${
                      form.supervisionType === t
                        ? 'border-aps-blue bg-aps-blue-light text-aps-blue'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
            disabled={
              (!lockedProgramId && isSupervisorLocked && eligiblePrograms.length === 0) ||
              (!isSupervisorLocked && supervisorPickerList.length === 0)
            }
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Log session
          </button>
        </div>
      </div>
    </div>
  );
}
