import { useEffect, useState } from 'react';

// US-704/705: Learning need form — 4 mandatory fields per spec.
// Field sizes: learning need 250, activities proposed 250, proposed dates 60, anticipated outcomes 250.
const emptyForm = {
  need: '',
  activitiesProposed: '',
  proposedDate: '',
  anticipatedOutcome: '',
};

export default function LearningNeedFormModal({ open, existingNeed, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(existingNeed?.id);

  useEffect(() => {
    if (!open) return;
    if (existingNeed) {
      setForm({
        need: existingNeed.need || existingNeed.title || '',
        // backward-compat: old records may use 'description' for activities proposed
        activitiesProposed: existingNeed.activitiesProposed || existingNeed.description || '',
        proposedDate: existingNeed.proposedDate || '',
        anticipatedOutcome: existingNeed.anticipatedOutcome || '',
      });
    } else {
      setForm({ ...emptyForm });
    }
    setErrors({});
  }, [open, existingNeed]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.need.trim()) errs.need = 'Required';
    if (!form.activitiesProposed.trim()) errs.activitiesProposed = 'Required';
    if (!form.proposedDate.trim()) errs.proposedDate = 'Required';
    if (!form.anticipatedOutcome.trim()) errs.anticipatedOutcome = 'Required';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const payload = {
      id: isEdit ? existingNeed.id : `ln-${Date.now()}`,
      // keep both field aliases so the rest of the app can read either
      need: form.need.trim(),
      title: form.need.trim(),
      activitiesProposed: form.activitiesProposed.trim(),
      description: form.activitiesProposed.trim(),        // backward-compat alias
      proposedDate: form.proposedDate.trim(),
      anticipatedOutcome: form.anticipatedOutcome.trim(),
    };
    onSave(payload);
  }

  const inputClass = (field) =>
    `w-full h-14 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;
  const textareaClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue resize-none ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {isEdit ? 'Edit learning need' : 'Add learning need'}
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          All fields are mandatory.
        </p>

        <div className="space-y-5 mb-6">
          {/* Field 1: Learning need identified */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Learning need identified <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={250}
              value={form.need}
              onChange={(e) => update('need', e.target.value)}
              className={inputClass('need')}
              placeholder="e.g. Evidence-based trauma interventions"
            />
            <div className="flex justify-between mt-1">
              {errors.need
                ? <p className="text-sm text-red-600">{errors.need}</p>
                : <span />}
              <span className="text-[11px] text-gray-400 ml-auto">{form.need.length}/250</span>
            </div>
          </div>

          {/* Field 2: Types of activities proposed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Types of activities proposed to meet this need <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              maxLength={250}
              value={form.activitiesProposed}
              onChange={(e) => update('activitiesProposed', e.target.value)}
              className={textareaClass('activitiesProposed')}
              placeholder="e.g. Attend 2-day trauma workshop, monthly peer consultation, reading program"
            />
            <div className="flex justify-between mt-1">
              {errors.activitiesProposed
                ? <p className="text-sm text-red-600">{errors.activitiesProposed}</p>
                : <span />}
              <span className="text-[11px] text-gray-400 ml-auto">{form.activitiesProposed.length}/250</span>
            </div>
          </div>

          {/* Field 3: Proposed dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Proposed dates for activities <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={60}
              value={form.proposedDate}
              onChange={(e) => update('proposedDate', e.target.value)}
              className={inputClass('proposedDate')}
              placeholder="e.g. August 2025 · Semester 2 · Ongoing through Q3"
            />
            <div className="flex justify-between mt-1">
              {errors.proposedDate
                ? <p className="text-sm text-red-600">{errors.proposedDate}</p>
                : <span />}
              <span className="text-[11px] text-gray-400 ml-auto">{form.proposedDate.length}/60</span>
            </div>
          </div>

          {/* Field 4: Anticipated outcomes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Anticipated outcomes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              maxLength={250}
              value={form.anticipatedOutcome}
              onChange={(e) => update('anticipatedOutcome', e.target.value)}
              className={textareaClass('anticipatedOutcome')}
              placeholder="e.g. Confidently formulate and deliver phased trauma treatment"
            />
            <div className="flex justify-between mt-1">
              {errors.anticipatedOutcome
                ? <p className="text-sm text-red-600">{errors.anticipatedOutcome}</p>
                : <span />}
              <span className="text-[11px] text-gray-400 ml-auto">{form.anticipatedOutcome.length}/250</span>
            </div>
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
            {isEdit ? 'Save changes' : 'Add learning need'}
          </button>
        </div>
      </div>
    </div>
  );
}
