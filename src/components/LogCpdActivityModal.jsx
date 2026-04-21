import { useState, useEffect } from 'react';

// Member-side CPD activity logging per HLBR §3.4.7 Log CPD Activity Page.
// Activities are tagged with the cycleId of the selected (Open) CPD cycle.
// Fields match the existing mockCpdProfiles activity shape so the same
// member detail surfaces can display them unchanged.

const activityTypes = [
  'Peer Consultation',
  'Peer Supervision',
  'Conference Attendance',
  'Workshop',
  'Online Learning',
  'Reading/Research',
  'Other',
];

const emptyForm = {
  activityType: '',
  completedDate: '',
  peerHrs: '',
  actionHrs: '',
  cpdHrs: '',
  journalNotes: '',
};

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function LogCpdActivityModal({ open, cycle, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm });
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.activityType) errs.activityType = 'Required';
    if (!form.completedDate) errs.completedDate = 'Required';
    const peer = Number(form.peerHrs) || 0;
    const action = Number(form.actionHrs) || 0;
    const cpd = Number(form.cpdHrs) || 0;
    if (peer + action + cpd <= 0) errs.cpdHrs = 'Enter at least one non-zero hour value';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const activity = {
      id: `a-${Date.now()}`,
      cycleId: cycle.id,
      activityType: form.activityType,
      peerHrs: Number(form.peerHrs) || 0,
      actionHrs: Number(form.actionHrs) || 0,
      cpdHrs: Number(form.cpdHrs) || 0,
      completedDate: form.completedDate,
      loggedDate: todayISO(),
      journalNotes: form.journalNotes.trim(),
    };
    onSave(activity);
  }

  const inputClass = (field) =>
    `w-full h-12 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Log CPD Activity</h3>
        <p className="text-sm text-gray-500 mb-5">
          This activity will be recorded against <span className="font-medium text-gray-700">{cycle.name}</span>.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Activity Type</label>
            <select
              value={form.activityType}
              onChange={(e) => update('activityType', e.target.value)}
              className={inputClass('activityType') + ' bg-white'}
            >
              <option value="">Select an activity type…</option>
              {activityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.activityType && <p className="mt-1 text-sm text-red-600">{errors.activityType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Completion Date</label>
            <input
              type="date"
              value={form.completedDate}
              onChange={(e) => update('completedDate', e.target.value)}
              className={inputClass('completedDate')}
            />
            {errors.completedDate && <p className="mt-1 text-sm text-red-600">{errors.completedDate}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Peer Hours</label>
              <input
                type="number" min="0" step="0.5"
                value={form.peerHrs}
                onChange={(e) => update('peerHrs', e.target.value)}
                placeholder="0"
                className={inputClass('peerHrs')}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Action Hours</label>
              <input
                type="number" min="0" step="0.5"
                value={form.actionHrs}
                onChange={(e) => update('actionHrs', e.target.value)}
                placeholder="0"
                className={inputClass('actionHrs')}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CPD Hours</label>
              <input
                type="number" min="0" step="0.5"
                value={form.cpdHrs}
                onChange={(e) => update('cpdHrs', e.target.value)}
                placeholder="0"
                className={inputClass('cpdHrs')}
              />
            </div>
          </div>
          {errors.cpdHrs && <p className="text-sm text-red-600 -mt-2">{errors.cpdHrs}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Journal Notes</label>
            <textarea
              value={form.journalNotes}
              onChange={(e) => update('journalNotes', e.target.value)}
              rows={3}
              placeholder="What did you learn or reflect on?"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
            />
            <p className="mt-1 text-xs text-gray-500">
              These notes are private to you and hidden from internal users (per CLAUDE.md business rule).
            </p>
          </div>
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
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Log activity
          </button>
        </div>
      </div>
    </div>
  );
}
