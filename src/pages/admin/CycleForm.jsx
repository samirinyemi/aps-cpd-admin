import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';

export default function CycleForm({ cycles, setCycles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const existing = isEdit ? cycles.find((c) => c.id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    startDate: existing?.startDate || '',
    endDate: existing?.endDate || '',
    minRequiredHours: existing?.minRequiredHours ?? '',
    minPeerHours: existing?.minPeerHours ?? '',
  });

  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, dates: undefined }));
  }

  const overlapError = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (start >= end) return null;

    const overlapping = cycles.find((c) => {
      if (isEdit && c.id === id) return false;
      const cStart = new Date(c.startDate);
      const cEnd = new Date(c.endDate);
      return start < cEnd && end > cStart;
    });

    return overlapping ? `Date range overlaps with "${overlapping.name}"` : null;
  }, [form.startDate, form.endDate, cycles, id, isEdit]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) {
      errs.dates = 'End date must be after start date';
    }
    if (form.minRequiredHours === '' || Number(form.minRequiredHours) < 0) errs.minRequiredHours = 'Required';
    if (form.minPeerHours === '' || Number(form.minPeerHours) < 0) errs.minPeerHours = 'Required';
    if (overlapError) errs.dates = overlapError;
    return errs;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const cycleData = {
      ...form,
      minRequiredHours: Number(form.minRequiredHours),
      minPeerHours: Number(form.minPeerHours),
    };

    if (isEdit) {
      setCycles((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...cycleData } : c))
      );
    } else {
      setCycles((prev) => [
        ...prev,
        { ...cycleData, id: String(Date.now()), status: 'Pending' },
      ]);
    }

    navigate('/admin/cpd/cycles');
  }

  // Redirect if trying to edit a Closed cycle
  if (isEdit && existing?.status === 'Closed') {
    navigate('/admin/cpd/cycles');
    return null;
  }

  const inputClass = (field) =>
    `w-full h-14 px-4 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/admin/cpd/cycles')} className="hover:text-aps-blue">
          CPD Cycles
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{isEdit ? 'Edit Cycle' : 'Create Cycle'}</span>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        {isEdit ? 'Edit CPD Cycle' : 'Create CPD Cycle'}
      </h1>

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputClass('name')}
            placeholder="e.g. 2026–2027 CPD Cycle"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className={inputClass('startDate')}
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
              className={inputClass('endDate')}
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>
        {(errors.dates || overlapError) && (
          <p className="text-sm text-red-600 -mt-4">{errors.dates || overlapError}</p>
        )}

        {/* Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Required Hours</label>
            <input
              type="number"
              min="0"
              value={form.minRequiredHours}
              onChange={(e) => update('minRequiredHours', e.target.value)}
              className={inputClass('minRequiredHours')}
            />
            {errors.minRequiredHours && <p className="mt-1 text-sm text-red-600">{errors.minRequiredHours}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Peer Hours</label>
            <input
              type="number"
              min="0"
              value={form.minPeerHours}
              onChange={(e) => update('minPeerHours', e.target.value)}
              className={inputClass('minPeerHours')}
            />
            {errors.minPeerHours && <p className="mt-1 text-sm text-red-600">{errors.minPeerHours}</p>}
          </div>
        </div>

        {/* Status (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status <span className="text-gray-400 font-normal">— System managed</span>
          </label>
          <div className="h-14 px-4 flex items-center border border-gray-200 rounded-md bg-gray-50">
            <StatusBadge status={existing?.status || 'Pending'} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/cpd/cycles')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            {isEdit ? 'Save changes' : 'Create cycle'}
          </button>
        </div>
      </form>
    </PageShell>
  );
}
