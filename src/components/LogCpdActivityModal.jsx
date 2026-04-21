import { useState, useEffect } from 'react';

// Member-side CPD activity logging per HLBR §3.4.7 US-801/802/803.
// Activities are tagged with the Open cycle's id and optionally allocated to
// an AoPE linked to the member's CPD profile.

const activityKinds = ['Peer Consultation', 'Active CPD', 'Other CPD'];

const emptyForm = {
  activityKind: '',
  completedDate: '',
  allocation: '',         // selected AoPE
  focus: '',              // US-802 Peer Consultation
  colleagues: '',         // US-802 Peer Consultation
  peerHrs: '',            // US-802 Peer CPD hours
  peerMins: '',
  activeHrs: '',          // US-802 Active CPD hours within Peer
  activeMins: '',
  activityTitle: '',      // US-803 Active/Other
  details: '',            // US-803 Active/Other
  totalHrs: '',           // US-803 Total duration
  totalMins: '',
  journalMode: 'PD Tool', // 'PD Tool' | 'Offline'
  journalNotes: '',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toDecimalHours(hrs, mins) {
  return (Number(hrs) || 0) + (Number(mins) || 0) / 60;
}

// When `existingActivity` is passed, the modal acts in edit mode:
// form state is prefilled and the saved payload retains the same id.
export default function LogCpdActivityModal({ open, cycle, allocationOptions = [], defaultAllocation = '', existingActivity, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(existingActivity?.id);

  useEffect(() => {
    if (!open) return;
    if (existingActivity) {
      // Map existing activity back to the form shape. Hours carried as decimals in storage.
      const splitDuration = (decimal) => {
        const total = Math.round(Number(decimal || 0) * 60);
        return { hrs: String(Math.floor(total / 60)), mins: String(total % 60) };
      };
      const kind = existingActivity.activityKind || existingActivity.activityType || '';
      const peer = splitDuration(existingActivity.peerHrs);
      const active = splitDuration(existingActivity.actionHrs);
      const total = splitDuration(existingActivity.cpdHrs);
      setForm({
        activityKind: kind,
        completedDate: existingActivity.completedDate || '',
        allocation: existingActivity.allocation || defaultAllocation || '',
        focus: existingActivity.focus || '',
        colleagues: existingActivity.colleagues || '',
        peerHrs: peer.hrs,
        peerMins: peer.mins,
        activeHrs: active.hrs,
        activeMins: active.mins,
        activityTitle: existingActivity.activityTitle || '',
        details: existingActivity.details || '',
        totalHrs: total.hrs,
        totalMins: total.mins,
        journalMode: existingActivity.journalMode || 'PD Tool',
        journalNotes: existingActivity.journalNotes || '',
      });
    } else {
      setForm({ ...emptyForm, allocation: defaultAllocation || '' });
    }
    setErrors({});
  }, [open, defaultAllocation, existingActivity]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const isPeer = form.activityKind === 'Peer Consultation';
  const isActiveOrOther = form.activityKind === 'Active CPD' || form.activityKind === 'Other CPD';

  function validate() {
    const errs = {};
    if (!form.activityKind) errs.activityKind = 'Required';
    if (!form.completedDate) errs.completedDate = 'Required';

    // Cycle window check
    if (cycle && form.completedDate) {
      if (cycle.startDate && form.completedDate < cycle.startDate) errs.completedDate = 'Must fall within the cycle window';
      if (cycle.endDate && form.completedDate > cycle.endDate) errs.completedDate = 'Must fall within the cycle window';
    }

    if (allocationOptions.length === 0) {
      // Optional; no error. HLBR message is shown in UI.
    } else if (!form.allocation) {
      errs.allocation = 'Allocate this activity to an AoPE';
    }

    if (isPeer) {
      if (!form.focus.trim()) errs.focus = 'Required';
      if (!form.colleagues.trim()) errs.colleagues = 'Required';
      if (Number(form.peerHrs) > 100) errs.peerHrs = 'Max 100 hours';
      if (Number(form.peerMins) > 59) errs.peerMins = 'Max 59 minutes';
      if (Number(form.activeHrs) > 100) errs.activeHrs = 'Max 100 hours';
      if (Number(form.activeMins) > 59) errs.activeMins = 'Max 59 minutes';
      const total = toDecimalHours(form.peerHrs, form.peerMins) + toDecimalHours(form.activeHrs, form.activeMins);
      if (total <= 0) errs.peerHrs = 'Enter at least one non-zero duration';
    } else if (isActiveOrOther) {
      if (!form.activityTitle.trim()) errs.activityTitle = 'Required';
      if (!form.details.trim()) errs.details = 'Required';
      if (Number(form.totalHrs) > 100) errs.totalHrs = 'Max 100 hours';
      if (Number(form.totalMins) > 59) errs.totalMins = 'Max 59 minutes';
      if (toDecimalHours(form.totalHrs, form.totalMins) <= 0) errs.totalHrs = 'Enter a duration';
    }

    if (form.journalMode === 'Offline' && !form.journalNotes.trim()) {
      errs.journalNotes = 'Journal notes are required when journal entry is documented offline';
    }

    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const peerHrs = isPeer ? toDecimalHours(form.peerHrs, form.peerMins) : 0;
    const actionHrs = isPeer
      ? toDecimalHours(form.activeHrs, form.activeMins)
      : (isActiveOrOther ? toDecimalHours(form.totalHrs, form.totalMins) : 0);
    const cpdHrs = peerHrs + actionHrs;

    const activity = {
      id: isEdit ? existingActivity.id : `a-${Date.now()}`,
      cycleId: isEdit ? (existingActivity.cycleId || cycle.id) : cycle.id,
      allocation: form.allocation || null,
      activityKind: form.activityKind,
      // activityType retained for backward compatibility with any existing tables
      activityType: form.activityKind,
      // Type-specific descriptive fields
      focus: isPeer ? form.focus.trim() : null,
      colleagues: isPeer ? form.colleagues.trim() : null,
      activityTitle: isActiveOrOther ? form.activityTitle.trim() : null,
      details: isActiveOrOther ? form.details.trim() : null,
      // Hours
      peerHrs: Math.round(peerHrs * 100) / 100,
      actionHrs: Math.round(actionHrs * 100) / 100,
      cpdHrs: Math.round(cpdHrs * 100) / 100,
      completedDate: form.completedDate,
      loggedDate: isEdit ? (existingActivity.loggedDate || todayISO()) : todayISO(),
      journalMode: form.journalMode,
      journalNotes: form.journalNotes.trim(),
    };
    onSave(activity);
  }

  const inputClass = (field) =>
    `w-full h-12 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{isEdit ? 'Edit CPD Activity' : 'Log CPD Activity'}</h3>
        <p className="text-sm text-gray-500 mb-5">
          {isEdit ? 'Update the details of this logged activity.' : <>Recorded against <span className="font-medium text-gray-700">{cycle?.name || 'the current cycle'}</span>.</>}
        </p>

        <div className="space-y-4 mb-6">
          {/* Type of Activity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type of Activity</label>
            <div className="grid grid-cols-3 gap-2">
              {activityKinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => update('activityKind', k)}
                  className={`px-2 py-2 text-xs font-medium rounded-md border transition-colors ${
                    form.activityKind === k
                      ? 'border-aps-blue bg-aps-blue-light text-aps-blue'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            {errors.activityKind && <p className="mt-1 text-sm text-red-600">{errors.activityKind}</p>}
          </div>

          {/* Completion Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Completion Date</label>
            <input
              type="date"
              min={cycle?.startDate}
              max={cycle?.endDate}
              value={form.completedDate}
              onChange={(e) => update('completedDate', e.target.value)}
              className={inputClass('completedDate')}
            />
            {errors.completedDate && <p className="mt-1 text-sm text-red-600">{errors.completedDate}</p>}
          </div>

          {/* AoPE allocation (HLBR US-801) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Allocate to AoPE</label>
            {allocationOptions.length === 0 ? (
              <div className="border border-dashed border-amber-300 bg-amber-50 rounded-md p-3 text-xs text-amber-800">
                You have no APS Colleges or Psychology Board endorsements to allocate this activity to. To add a Psychology Board endorsement, edit your details in your{' '}
                <a href="/member/cpd/profile" className="font-medium underline hover:text-amber-900">CPD Profile</a>.
              </div>
            ) : (
              <select
                value={form.allocation}
                onChange={(e) => update('allocation', e.target.value)}
                className={inputClass('allocation') + ' bg-white'}
              >
                <option value="">Select an AoPE…</option>
                {allocationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {errors.allocation && <p className="mt-1 text-sm text-red-600">{errors.allocation}</p>}
          </div>

          {/* Peer Consultation fields (US-802) */}
          {isPeer && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Focus of peer consultation</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.focus}
                  onChange={(e) => update('focus', e.target.value)}
                  className={inputClass('focus')}
                />
                {errors.focus && <p className="mt-1 text-sm text-red-600">{errors.focus}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Colleague(s) involved</label>
                <input
                  type="text"
                  maxLength={250}
                  value={form.colleagues}
                  onChange={(e) => update('colleagues', e.target.value)}
                  className={inputClass('colleagues')}
                />
                {errors.colleagues && <p className="mt-1 text-sm text-red-600">{errors.colleagues}</p>}
              </div>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-1.5">Duration — focus on your practice (Peer CPD)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" min="0" max="100" placeholder="Hours" value={form.peerHrs} onChange={(e) => update('peerHrs', e.target.value)} className={inputClass('peerHrs')} />
                  <input type="number" min="0" max="59"  placeholder="Minutes" value={form.peerMins} onChange={(e) => update('peerMins', e.target.value)} className={inputClass('peerMins')} />
                </div>
                {(errors.peerHrs || errors.peerMins) && <p className="mt-1 text-sm text-red-600">{errors.peerHrs || errors.peerMins}</p>}
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-1.5">Duration — focus on your practice (Active CPD)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" min="0" max="100" placeholder="Hours" value={form.activeHrs} onChange={(e) => update('activeHrs', e.target.value)} className={inputClass('activeHrs')} />
                  <input type="number" min="0" max="59"  placeholder="Minutes" value={form.activeMins} onChange={(e) => update('activeMins', e.target.value)} className={inputClass('activeMins')} />
                </div>
                {(errors.activeHrs || errors.activeMins) && <p className="mt-1 text-sm text-red-600">{errors.activeHrs || errors.activeMins}</p>}
              </fieldset>
            </>
          )}

          {/* Active / Other CPD fields (US-803) */}
          {isActiveOrOther && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CPD Activity</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.activityTitle}
                  onChange={(e) => update('activityTitle', e.target.value)}
                  className={inputClass('activityTitle')}
                  placeholder="e.g. Conference session on evidence-based CBT"
                />
                {errors.activityTitle && <p className="mt-1 text-sm text-red-600">{errors.activityTitle}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Activity Details</label>
                <textarea
                  maxLength={250}
                  rows={2}
                  value={form.details}
                  onChange={(e) => update('details', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors.details ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.details && <p className="mt-1 text-sm text-red-600">{errors.details}</p>}
              </div>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700 mb-1.5">Total Duration (CPD hours)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" min="0" max="100" placeholder="Hours" value={form.totalHrs} onChange={(e) => update('totalHrs', e.target.value)} className={inputClass('totalHrs')} />
                  <input type="number" min="0" max="59"  placeholder="Minutes" value={form.totalMins} onChange={(e) => update('totalMins', e.target.value)} className={inputClass('totalMins')} />
                </div>
                {(errors.totalHrs || errors.totalMins) && <p className="mt-1 text-sm text-red-600">{errors.totalHrs || errors.totalMins}</p>}
              </fieldset>
            </>
          )}

          {/* Journal entry mode (US-801) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Journal Entry</label>
            <div className="grid grid-cols-2 gap-3">
              {['PD Tool', 'Offline'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update('journalMode', mode)}
                  className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    form.journalMode === mode
                      ? 'border-aps-blue bg-aps-blue-light text-aps-blue'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mode === 'PD Tool' ? 'Enter here (PD Tool)' : 'Documented elsewhere (Offline)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Journal Notes
              {form.journalMode === 'Offline' && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              rows={3}
              value={form.journalNotes}
              onChange={(e) => update('journalNotes', e.target.value)}
              placeholder={form.journalMode === 'Offline' ? 'Note where the full journal entry lives…' : 'What did you learn or reflect on? (optional)'}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors.journalNotes ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.journalNotes && <p className="mt-1 text-sm text-red-600">{errors.journalNotes}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Journal notes are private to you and hidden from internal users.
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
            {isEdit ? 'Save changes' : 'Log activity'}
          </button>
        </div>
      </div>
    </div>
  );
}
