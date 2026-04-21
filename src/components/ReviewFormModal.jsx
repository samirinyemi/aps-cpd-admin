import { useEffect, useState } from 'react';

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function ReviewFormModal({ open, existingReview, onSave, onCancel }) {
  const [form, setForm] = useState({ reviewedAt: todayISO(), notes: '' });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(existingReview?.id);

  useEffect(() => {
    if (!open) return;
    setForm({
      reviewedAt: existingReview?.reviewedAt || todayISO(),
      notes: existingReview?.notes || '',
    });
    setErrors({});
  }, [open, existingReview]);

  if (!open) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSave() {
    const errs = {};
    if (!form.reviewedAt) errs.reviewedAt = 'Required';
    if (!form.notes.trim()) errs.notes = 'Required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({
      id: isEdit ? existingReview.id : `rv-${Date.now()}`,
      reviewedAt: form.reviewedAt,
      notes: form.notes.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{isEdit ? 'Edit review' : 'Add review'}</h3>
        <p className="text-sm text-gray-500 mb-5">Capture progress on this learning need.</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Review date</label>
            <input
              type="date"
              value={form.reviewedAt}
              onChange={(e) => update('reviewedAt', e.target.value)}
              className={`w-full h-11 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors.reviewedAt ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.reviewedAt && <p className="mt-1 text-sm text-red-600">{errors.reviewedAt}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors.notes ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="What's happened since the last review? What's next?"
            />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >{isEdit ? 'Save review' : 'Add review'}</button>
        </div>
      </div>
    </div>
  );
}
