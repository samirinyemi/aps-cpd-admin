import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { aoPEOptions } from '../../data/mockPrograms';

const emptyForm = {
  name: '',
  areaOfPractice: '',
  totalRequiredHours: '',
  requiredSupervisionHours: '',
  minPrimaryHours: '',
  maxSecondaryHours: '',
  maxSecondaryNonAoPEHours: '',
  maxGroupHours: '',
  directClientContactHours: '',
  requiredPracticeHours: '',
  requiredCPDHours: '',
};

function NumberField({ label, name, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min="0"
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aps-blue/40 focus:border-aps-blue"
      />
    </div>
  );
}

export default function AoPEForm({ aoPEPrograms, setAoPEPrograms }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const existing = isEdit ? aoPEPrograms.find((p) => p.id === id) : null;

  const [form, setForm] = useState(() => {
    if (existing) {
      return {
        name: existing.name,
        areaOfPractice: existing.areaOfPractice,
        totalRequiredHours: String(existing.totalRequiredHours),
        requiredSupervisionHours: String(existing.requiredSupervisionHours),
        minPrimaryHours: String(existing.minPrimaryHours),
        maxSecondaryHours: String(existing.maxSecondaryHours),
        maxSecondaryNonAoPEHours: String(existing.maxSecondaryNonAoPEHours),
        maxGroupHours: String(existing.maxGroupHours),
        directClientContactHours: String(existing.directClientContactHours),
        requiredPracticeHours: String(existing.requiredPracticeHours),
        requiredCPDHours: String(existing.requiredCPDHours),
      };
    }
    return { ...emptyForm };
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const allFilled = form.name.trim() &&
    form.areaOfPractice &&
    form.totalRequiredHours &&
    form.requiredSupervisionHours &&
    form.minPrimaryHours &&
    form.maxSecondaryHours &&
    form.maxSecondaryNonAoPEHours &&
    form.maxGroupHours &&
    form.directClientContactHours &&
    form.requiredPracticeHours &&
    form.requiredCPDHours;

  function handleSave() {
    if (!allFilled) return;

    const record = {
      id: isEdit ? id : `aope-${Date.now()}`,
      name: form.name.trim(),
      areaOfPractice: form.areaOfPractice,
      totalRequiredHours: Number(form.totalRequiredHours),
      requiredSupervisionHours: Number(form.requiredSupervisionHours),
      minPrimaryHours: Number(form.minPrimaryHours),
      maxSecondaryHours: Number(form.maxSecondaryHours),
      maxSecondaryNonAoPEHours: Number(form.maxSecondaryNonAoPEHours),
      maxGroupHours: Number(form.maxGroupHours),
      directClientContactHours: Number(form.directClientContactHours),
      requiredPracticeHours: Number(form.requiredPracticeHours),
      requiredCPDHours: Number(form.requiredCPDHours),
    };

    if (isEdit) {
      setAoPEPrograms((prev) => prev.map((p) => (p.id === id ? record : p)));
      navigate(`/admin/registrar/aope/${id}`);
    } else {
      setAoPEPrograms((prev) => [...prev, record]);
      navigate('/admin/registrar/aope');
    }
  }

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link to="/admin/registrar/aope" className="text-aps-blue hover:underline">
              AoPE Compliance Configuration
            </Link>
          </li>
          {isEdit && existing && (
            <>
              <li>/</li>
              <li>
                <Link to={`/admin/registrar/aope/${id}`} className="text-aps-blue hover:underline">
                  {existing.name}
                </Link>
              </li>
            </>
          )}
          <li>/</li>
          <li className="text-gray-900 font-medium">{isEdit ? 'Edit' : 'Create New Program'}</li>
        </ol>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        {isEdit ? `Edit ${existing?.name || 'Program'}` : 'Create New AoPE Program'}
      </h1>

      {/* Section 1: Program Details */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Program Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aps-blue/40 focus:border-aps-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area of Practice Endorsement <span className="text-red-500">*</span>
            </label>
            <select
              name="areaOfPractice"
              value={form.areaOfPractice}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aps-blue/40 focus:border-aps-blue"
            >
              <option value="">Select AoPE...</option>
              {aoPEOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <NumberField
            label="Total Required Hours"
            name="totalRequiredHours"
            value={form.totalRequiredHours}
            onChange={handleChange}
            required
          />
        </div>
      </section>

      {/* Section 2: Supervision Requirements */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Supervision Requirements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField
            label="Required Supervision Hours"
            name="requiredSupervisionHours"
            value={form.requiredSupervisionHours}
            onChange={handleChange}
            required
          />
          <NumberField
            label="Min Primary Supervision Hours"
            name="minPrimaryHours"
            value={form.minPrimaryHours}
            onChange={handleChange}
            required
          />
          <NumberField
            label="Max Secondary Supervision Hours"
            name="maxSecondaryHours"
            value={form.maxSecondaryHours}
            onChange={handleChange}
            required
          />
          <NumberField
            label="Max Secondary Non-AoPE Hours"
            name="maxSecondaryNonAoPEHours"
            value={form.maxSecondaryNonAoPEHours}
            onChange={handleChange}
            required
          />
          <NumberField
            label="Max Group Supervision Hours"
            name="maxGroupHours"
            value={form.maxGroupHours}
            onChange={handleChange}
            required
          />
          <NumberField
            label="Required Direct Client Contact Hours"
            name="directClientContactHours"
            value={form.directClientContactHours}
            onChange={handleChange}
            required
          />
        </div>
      </section>

      {/* Section 3: Practice Requirements */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Practice Requirements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField
            label="Required Practice Hours"
            name="requiredPracticeHours"
            value={form.requiredPracticeHours}
            onChange={handleChange}
            required
          />
          <NumberField
            label="Required CPD Hours"
            name="requiredCPDHours"
            value={form.requiredCPDHours}
            onChange={handleChange}
            required
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!allFilled}
          className="px-5 py-2.5 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isEdit ? 'Save Changes' : 'Create Program'}
        </button>
        <button
          onClick={() => navigate(isEdit ? `/admin/registrar/aope/${id}` : '/admin/registrar/aope')}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </PageShell>
  );
}
