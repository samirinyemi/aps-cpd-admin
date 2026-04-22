import { useEffect, useState } from 'react';
import SelectField from './SelectField';

const emptyForm = {
  title: '',
  description: '',
  proposedDate: '',
  anticipatedOutcome: '',
  status: 'Not Started',
  priority: 'Medium',
};

export default function LearningNeedFormModal({ open, existingNeed, onSave, onCancel }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(existingNeed?.id);

  useEffect(() => {
    if (!open) return;
    if (existingNeed) {
      setForm({
        title: existingNeed.title || existingNeed.need || '',
        description: existingNeed.description || '',
        proposedDate: existingNeed.proposedDate || '',
        anticipatedOutcome: existingNeed.anticipatedOutcome || '',
        status: existingNeed.status || 'Not Started',
        priority: existingNeed.priority || 'Medium',
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
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.proposedDate.trim()) errs.proposedDate = 'Required';
    if (!form.anticipatedOutcome.trim()) errs.anticipatedOutcome = 'Required';
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const payload = {
      id: isEdit ? existingNeed.id : `ln-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      proposedDate: form.proposedDate.trim(),
      anticipatedOutcome: form.anticipatedOutcome.trim(),
      status: form.status,
      priority: form.priority,
      reviews: isEdit ? (existingNeed.reviews || []) : [],
    };
    onSave(payload);
  }

  const inputClass = (field) =>
    `w-full h-11 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;
  const textareaClass = (field) =>
    `w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{isEdit ? 'Edit learning need' : 'Add learning need'}</h3>
        <p className="text-sm text-gray-500 mb-5">Capture what you plan to learn, when, and what good looks like.</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              type="text"
              maxLength={120}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className={inputClass('title')}
              placeholder="e.g. Evidence-based trauma interventions"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className={textareaClass('description')}
              placeholder="What will you do to meet this learning need?"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Proposed date</label>
            <input
              type="text"
              maxLength={80}
              value={form.proposedDate}
              onChange={(e) => update('proposedDate', e.target.value)}
              className={inputClass('proposedDate')}
              placeholder="e.g. August 2025 · Semester 2 · Ongoing through Q3"
            />
            {errors.proposedDate && <p className="mt-1 text-sm text-red-600">{errors.proposedDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Anticipated outcome</label>
            <textarea
              rows={3}
              maxLength={500}
              value={form.anticipatedOutcome}
              onChange={(e) => update('anticipatedOutcome', e.target.value)}
              className={textareaClass('anticipatedOutcome')}
              placeholder="What will you be able to do differently once this is complete?"
            />
            {errors.anticipatedOutcome && <p className="mt-1 text-sm text-red-600">{errors.anticipatedOutcome}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <SelectField value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </SelectField>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <SelectField value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </SelectField>
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
