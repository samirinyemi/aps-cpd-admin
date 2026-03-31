import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { aoPEOptions } from '../../data/mockPrograms';

const supervisionFields = [
  { key: 'totalRequiredHours', label: 'Total Required Hours' },
  { key: 'supervisionHours', label: 'Required Supervision Hours' },
  { key: 'minPrimaryHours', label: 'Min Primary Hours' },
  { key: 'maxSecondaryHours', label: 'Max Secondary Hours' },
  { key: 'maxSecondaryNonAoPE', label: 'Max Secondary Non-AoPE' },
  { key: 'maxGroupHours', label: 'Max Group Hours' },
  { key: 'directClientContactHours', label: 'Direct Client Contact Hours' },
];

const practiceFields = [
  { key: 'practiceHours', label: 'Required Practice Hours' },
  { key: 'cpdHours', label: 'Required CPD Hours' },
];

export default function ProgramForm({ programs, setPrograms }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const existing = isEdit ? programs.find((p) => p.id === id) : null;

  const [form, setForm] = useState(() => {
    if (existing) return { ...existing };
    return {
      name: '',
      aope: '',
      totalRequiredHours: '',
      supervisionHours: '',
      minPrimaryHours: '',
      maxSecondaryHours: '',
      maxSecondaryNonAoPE: '',
      maxGroupHours: '',
      directClientContactHours: '',
      practiceHours: '',
      cpdHours: '',
    };
  });

  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const allFields = ['name', 'aope', ...supervisionFields.map((f) => f.key), ...practiceFields.map((f) => f.key)];

  function validate() {
    const errs = {};
    for (const field of allFields) {
      const val = form[field];
      if (val === '' || val === null || val === undefined) {
        errs[field] = 'Required';
      }
    }
    return errs;
  }

  const isComplete = allFields.every((f) => form[f] !== '' && form[f] !== null && form[f] !== undefined);

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const numericFields = [...supervisionFields.map((f) => f.key), ...practiceFields.map((f) => f.key)];
    const programData = { ...form };
    for (const f of numericFields) {
      programData[f] = Number(programData[f]);
    }

    if (isEdit) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...programData } : p))
      );
    } else {
      setPrograms((prev) => [
        ...prev,
        { ...programData, id: String(Date.now()) },
      ]);
    }

    navigate('/admin/registrar/programs');
  }

  const inputClass = (field) =>
    `w-full h-14 px-4 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/admin/registrar/programs')} className="hover:text-aps-blue">
          Registrar Programs
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{isEdit ? 'Edit Program' : 'Create Program'}</span>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        {isEdit ? 'Edit Registrar Program' : 'Create Registrar Program'}
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Program Details */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Program Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputClass('name')}
                placeholder="e.g. Clinical Psychology Registrar Program"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Area of Practice Endorsement (AoPE)</label>
              <select
                value={form.aope}
                onChange={(e) => update('aope', e.target.value)}
                className={inputClass('aope')}
              >
                <option value="">Select AoPE...</option>
                {aoPEOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.aope && <p className="mt-1 text-sm text-red-600">{errors.aope}</p>}
            </div>
          </div>
        </section>

        {/* Section 2: Supervision Requirements */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Supervision Requirements</h2>
          <div className="grid grid-cols-2 gap-4">
            {supervisionFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  type="number"
                  min="0"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className={inputClass(f.key)}
                />
                {errors[f.key] && <p className="mt-1 text-sm text-red-600">{errors[f.key]}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Practice Requirements */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Practice Requirements</h2>
          <div className="grid grid-cols-2 gap-4">
            {practiceFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                <input
                  type="number"
                  min="0"
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className={inputClass(f.key)}
                />
                {errors[f.key] && <p className="mt-1 text-sm text-red-600">{errors[f.key]}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/registrar/programs')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isComplete}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Save changes' : 'Create program'}
          </button>
        </div>
      </form>
    </PageShell>
  );
}
