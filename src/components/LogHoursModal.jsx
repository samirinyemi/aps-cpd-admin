import { useState, useEffect, useMemo } from 'react';

const emptyForm = {
  programId: '',
  placeId: '',
  completionDate: '',
  hours: '',
  minutes: '',
  directContactHours: '',
  directContactMinutes: '',
};

// Props:
//   location (optional)         — when provided, locks the session to this single place of practice.
//   locationOptions (optional)  — list of places to pick from (HLBR US-1703 member-side).
//   programs, lockedProgramId, onSave, onCancel — as before.
export default function LogHoursModal({ open, location, locationOptions, programs, lockedProgramId, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  const eligiblePrograms = useMemo(() => {
    if (!location) return [];
    const assignedIds = new Set(location.assignedPrograms.map((a) => a.programId));
    return programs.filter((p) => p.status === 'Open' && assignedIds.has(p.id));
  }, [location, programs]);

  const locationPickerList = useMemo(
    () => (Array.isArray(locationOptions) ? locationOptions : []),
    [locationOptions]
  );
  const isLocationLocked = Boolean(location);

  useEffect(() => {
    if (open) {
      setForm({
        ...emptyForm,
        programId: lockedProgramId || (eligiblePrograms.length === 1 ? eligiblePrograms[0].id : ''),
        placeId: isLocationLocked ? (location?.id || '') : (locationPickerList.length === 1 ? locationPickerList[0].id : ''),
      });
      setErrors({});
    }
  }, [open, lockedProgramId, eligiblePrograms.length, isLocationLocked, location, locationPickerList]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.programId) errs.programId = 'Required';
    if (!isLocationLocked && !form.placeId) errs.placeId = 'Select a place of practice';
    if (!form.completionDate) errs.completionDate = 'Required';
    if (!form.hours && !form.minutes) errs.hours = 'Enter duration';
    if (Number(form.hours) > 500) errs.hours = 'Maximum 500 hours';
    if (Number(form.minutes) > 59) errs.minutes = 'Maximum 59 minutes';
    if (!form.directContactHours && !form.directContactMinutes) errs.directContactHours = 'Enter direct contact';
    if (Number(form.directContactHours) > 100) errs.directContactHours = 'Maximum 100 hours';
    if (Number(form.directContactMinutes) > 59) errs.directContactMinutes = 'Maximum 59 minutes';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const program = programs.find((p) => p.id === form.programId);
    const chosenPlace = isLocationLocked
      ? location
      : locationPickerList.find((l) => l.id === form.placeId);
    if (!chosenPlace) { setErrors({ placeId: 'Select a place of practice' }); return; }

    const activity = {
      id: `act-${Date.now()}`,
      activityType: 'Practice',
      completionDate: form.completionDate,
      hours: Number(form.hours) || 0,
      minutes: Number(form.minutes) || 0,
      supervisionType: null,
      supervisorId: null,
      supervisorName: null,
      directContactHours: Number(form.directContactHours) || 0,
      directContactMinutes: Number(form.directContactMinutes) || 0,
      placeId: chosenPlace.id,
      employerName: chosenPlace.employerName,
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
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Log Practice Hours</h3>
        <p className="text-sm text-gray-500 mb-5">
          {isLocationLocked
            ? location.employerName
            : 'Select the place of practice where these hours were completed.'}
        </p>

        {!isLocationLocked && locationPickerList.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-md mb-6">
            <p className="text-sm text-gray-500">
              No places of practice linked to this program yet. Add a place first.
            </p>
          </div>
        ) : !lockedProgramId && isLocationLocked && eligiblePrograms.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-md mb-6">
            <p className="text-sm text-gray-500">
              No Open programs assigned. Assign this location to a program first.
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

            {!isLocationLocked && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Place of Practice</label>
                <select
                  value={form.placeId}
                  onChange={(e) => update('placeId', e.target.value)}
                  className={inputClass('placeId') + ' bg-white'}
                >
                  <option value="">Select a place of practice…</option>
                  {locationPickerList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.employerName}{l.positionTitle ? ` — ${l.positionTitle}` : ''}
                    </option>
                  ))}
                </select>
                {errors.placeId && <p className="mt-1 text-sm text-red-600">{errors.placeId}</p>}
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

            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-1.5">Total Duration</legend>
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

            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-1.5">Direct Client Contact</legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hours (max 100)</label>
                  <input
                    type="number" min="0" max="100"
                    value={form.directContactHours}
                    onChange={(e) => update('directContactHours', e.target.value)}
                    placeholder="0"
                    className={inputClass('directContactHours')}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minutes (max 59)</label>
                  <input
                    type="number" min="0" max="59"
                    value={form.directContactMinutes}
                    onChange={(e) => update('directContactMinutes', e.target.value)}
                    placeholder="0"
                    className={inputClass('directContactMinutes')}
                  />
                </div>
              </div>
              {(errors.directContactHours || errors.directContactMinutes) && (
                <p className="mt-1 text-sm text-red-600">{errors.directContactHours || errors.directContactMinutes}</p>
              )}
            </fieldset>
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
              (!lockedProgramId && isLocationLocked && eligiblePrograms.length === 0) ||
              (!isLocationLocked && locationPickerList.length === 0)
            }
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Log hours
          </button>
        </div>
      </div>
    </div>
  );
}
