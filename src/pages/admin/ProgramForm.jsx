import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  aoPEOptions,
  qualificationOptions,
  stateOptions,
  titleOptions,
} from '../../data/mockPrograms';

// ---- Supervisor Modal ----
function SupervisorModal({ open, supervisor, onSave, onCancel }) {
  const isEdit = Boolean(supervisor?.id);
  const [form, setForm] = useState({
    title: supervisor?.title || '',
    firstName: supervisor?.firstName || '',
    lastName: supervisor?.lastName || '',
    ahpraNumber: supervisor?.ahpraNumber || '',
    supervisionType: supervisor?.supervisionType || '',
    supervisorAoPE: supervisor?.supervisorAoPE || '',
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isComplete = form.firstName && form.lastName && form.ahpraNumber && form.supervisionType && form.supervisorAoPE;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEdit ? 'Edit Supervisor' : 'Add Supervisor'}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <select
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
              >
                <option value="">Select...</option>
                {titleOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              AHPRA Registration Number <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.ahpraNumber} onChange={(e) => update('ahpraNumber', e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
              placeholder="e.g. PSY0001234567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type of Supervision <span className="text-red-500">*</span>
            </label>
            <select value={form.supervisionType} onChange={(e) => update('supervisionType', e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue">
              <option value="">Select...</option>
              <option value="Primary">Primary</option>
              <option value="Secondary">Secondary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Supervisor's AoPE <span className="text-red-500">*</span>
            </label>
            <select value={form.supervisorAoPE} onChange={(e) => update('supervisorAoPE', e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue">
              <option value="">Select AoPE...</option>
              {aoPEOptions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={() => onSave({ ...form, id: supervisor?.id })} disabled={!isComplete}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed">
            {isEdit ? 'Save' : 'Add supervisor'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Place of Practice Modal ----
function PlaceModal({ open, place, onSave, onCancel }) {
  const isEdit = Boolean(place?.id);
  const [form, setForm] = useState({
    positionTitle: place?.positionTitle || '',
    employerName: place?.employerName || '',
    phone: place?.phone || '',
    email: place?.email || '',
    addressLine1: place?.addressLine1 || '',
    addressLine2: place?.addressLine2 || '',
    suburb: place?.suburb || '',
    postcode: place?.postcode || '',
    state: place?.state || '',
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isComplete = form.employerName && form.addressLine1 && form.suburb && form.postcode && form.state;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEdit ? 'Edit Place of Practice' : 'Add Place of Practice'}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Position/Title</label>
              <input type="text" value={form.positionTitle} onChange={(e) => update('positionTitle', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Employer Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.employerName} onChange={(e) => update('employerName', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={form.addressLine1} onChange={(e) => update('addressLine1', e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
            <input type="text" value={form.addressLine2} onChange={(e) => update('addressLine2', e.target.value)}
              className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Suburb <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.suburb} onChange={(e) => update('suburb', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Postcode <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.postcode} onChange={(e) => update('postcode', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <select value={form.state} onChange={(e) => update('state', e.target.value)}
                className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue">
                <option value="">Select...</option>
                {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={() => onSave({ ...form, id: place?.id })} disabled={!isComplete}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed">
            {isEdit ? 'Save' : 'Add place'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Form ----
export default function ProgramForm({ programs, setPrograms }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const existing = isEdit ? programs.find((p) => p.id === id) : null;

  const [form, setForm] = useState({
    member: existing?.member || { title: '', firstName: '', lastName: '' },
    memberNumber: existing?.memberNumber || '',
    memberGrade: existing?.memberGrade || 'Registrar',
    areaOfPractice: existing?.areaOfPractice || '',
    qualification: existing?.qualification || '',
    commencementDate: existing?.commencementDate || '',
    holdsAoPE: existing?.holdsAoPE ?? null,
    dualQualification: existing?.dualQualification ?? null,
  });

  const [supervisors, setSupervisors] = useState(existing?.supervisors || []);
  const [places, setPlaces] = useState(existing?.placesOfPractice || []);
  const [errors, setErrors] = useState({});
  const [supervisorModal, setSupervisorModal] = useState({ open: false, data: null });
  const [placeModal, setPlaceModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function updateMember(field, value) {
    setForm((prev) => ({
      ...prev,
      member: { ...prev.member, [field]: value },
    }));
  }

  function validate() {
    const errs = {};
    if (!form.areaOfPractice) errs.areaOfPractice = 'Required';
    if (!form.qualification) errs.qualification = 'Required';
    if (!form.commencementDate) errs.commencementDate = 'Required';
    if (form.holdsAoPE === null) errs.holdsAoPE = 'Required';
    if (form.dualQualification === null) errs.dualQualification = 'Required';
    return errs;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const programData = {
      ...form,
      supervisors,
      placesOfPractice: places,
      status: existing?.status || 'Open',
    };

    if (isEdit) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...programData } : p))
      );
      navigate(`/admin/registrar/programs/${id}`);
    } else {
      const newId = String(Date.now());
      setPrograms((prev) => [...prev, { ...programData, id: newId }]);
      navigate('/admin/registrar/programs');
    }
  }

  // Supervisor CRUD
  function handleSaveSupervisor(data) {
    if (data.id) {
      setSupervisors((prev) => prev.map((s) => (s.id === data.id ? data : s)));
    } else {
      setSupervisors((prev) => [...prev, { ...data, id: `s-${Date.now()}` }]);
    }
    setSupervisorModal({ open: false, data: null });
  }

  function handleDeleteSupervisor(sup) {
    setDeleteDialog({
      open: true,
      title: 'Remove Supervisor',
      message: `Remove ${sup.firstName} ${sup.lastName} as a supervisor?`,
      onConfirm: () => {
        setSupervisors((prev) => prev.filter((s) => s.id !== sup.id));
        setDeleteDialog({ open: false });
      },
    });
  }

  // Place CRUD
  function handleSavePlace(data) {
    if (data.id) {
      setPlaces((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      setPlaces((prev) => [...prev, { ...data, id: `p-${Date.now()}` }]);
    }
    setPlaceModal({ open: false, data: null });
  }

  function handleDeletePlace(place) {
    setDeleteDialog({
      open: true,
      title: 'Remove Place of Practice',
      message: `Remove "${place.employerName}" as a place of practice?`,
      onConfirm: () => {
        setPlaces((prev) => prev.filter((p) => p.id !== place.id));
        setDeleteDialog({ open: false });
      },
    });
  }

  // Redirect if trying to edit a Closed program
  if (isEdit && existing?.status === 'Closed') {
    navigate('/admin/registrar/programs');
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
        <button onClick={() => navigate('/admin/registrar/programs')} className="hover:text-aps-blue">
          Registrar Programs
        </button>
        {isEdit && existing && (
          <>
            <span className="mx-2">/</span>
            <button onClick={() => navigate(`/admin/registrar/programs/${id}`)} className="hover:text-aps-blue">
              {existing.member.firstName} {existing.member.lastName}
            </button>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{isEdit ? 'Edit' : 'Create'}</span>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        {isEdit ? 'Edit Registrar Program' : 'Create Registrar Program'}
      </h1>

      <form onSubmit={handleSave}>
        {/* Section 1: Member Information (non-editable in edit, inputs in create) */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Member Information</h2>
          {isEdit ? (
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8">
              <div>
                <dt className="text-sm text-gray-500">Member Name</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">
                  {form.member.title} {form.member.firstName} {form.member.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Member Number</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.memberNumber}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Member Grade</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.memberGrade}</dd>
              </div>
            </dl>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <select value={form.member.title} onChange={(e) => updateMember('title', e.target.value)}
                    className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue">
                    <option value="">Select...</option>
                    {titleOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <input type="text" value={form.member.firstName} onChange={(e) => updateMember('firstName', e.target.value)}
                    className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <input type="text" value={form.member.lastName} onChange={(e) => updateMember('lastName', e.target.value)}
                    className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Member Number</label>
                  <input type="text" value={form.memberNumber} onChange={(e) => update('memberNumber', e.target.value)}
                    className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
                    placeholder="e.g. PSY-2024-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Member Grade</label>
                  <input type="text" value={form.memberGrade} onChange={(e) => update('memberGrade', e.target.value)}
                    className="w-full h-14 px-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Program Details */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Program Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Area of Practice <span className="text-red-500">*</span>
              </label>
              <select value={form.areaOfPractice} onChange={(e) => update('areaOfPractice', e.target.value)}
                className={inputClass('areaOfPractice')}>
                <option value="">Select area of practice...</option>
                {aoPEOptions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.areaOfPractice && <p className="mt-1 text-sm text-red-600">{errors.areaOfPractice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Qualification completed/being undertaken <span className="text-red-500">*</span>
              </label>
              <select value={form.qualification} onChange={(e) => update('qualification', e.target.value)}
                className={inputClass('qualification')}>
                <option value="">Select qualification...</option>
                {qualificationOptions.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
              {errors.qualification && <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date Commencement to the Registrar Program <span className="text-red-500">*</span>
              </label>
              <input type="date" value={form.commencementDate} onChange={(e) => update('commencementDate', e.target.value)}
                className={inputClass('commencementDate')} />
              {errors.commencementDate && <p className="mt-1 text-sm text-red-600">{errors.commencementDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Do you currently hold an AoPE with PsyBA? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="holdsAoPE" checked={form.holdsAoPE === true}
                    onChange={() => update('holdsAoPE', true)}
                    className="w-4 h-4 text-aps-blue border-gray-300 focus:ring-aps-blue" />
                  <span className="text-sm text-gray-700">Yes — working towards a second AoPE</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="holdsAoPE" checked={form.holdsAoPE === false}
                    onChange={() => update('holdsAoPE', false)}
                    className="w-4 h-4 text-aps-blue border-gray-300 focus:ring-aps-blue" />
                  <span className="text-sm text-gray-700">No — working towards first AoPE</span>
                </label>
              </div>
              {errors.holdsAoPE && <p className="mt-1 text-sm text-red-600">{errors.holdsAoPE}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Is the qualification accredited for two areas of practice? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="dualQual" checked={form.dualQualification === true}
                    onChange={() => update('dualQualification', true)}
                    className="w-4 h-4 text-aps-blue border-gray-300 focus:ring-aps-blue" />
                  <span className="text-sm text-gray-700">Yes — two registrar programs needed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="dualQual" checked={form.dualQualification === false}
                    onChange={() => update('dualQualification', false)}
                    className="w-4 h-4 text-aps-blue border-gray-300 focus:ring-aps-blue" />
                  <span className="text-sm text-gray-700">No — one area of practice</span>
                </label>
              </div>
              {errors.dualQualification && <p className="mt-1 text-sm text-red-600">{errors.dualQualification}</p>}
            </div>
          </div>
        </section>

        {/* Section 3: Supervisors */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Supervisors
              <span className="text-sm font-normal text-gray-400 ml-2">({supervisors.length})</span>
            </h2>
            <button type="button" onClick={() => setSupervisorModal({ open: true, data: null })}
              className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
              Add supervisor
            </button>
          </div>
          {supervisors.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No supervisors added yet.</p>
          ) : (
            <div className="space-y-3">
              {supervisors.map((s) => (
                <div key={s.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {s.title} {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">AHPRA: {s.ahpraNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">AoPE: {s.supervisorAoPE}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.supervisionType === 'Primary' ? 'bg-aps-blue/10 text-aps-blue' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.supervisionType}
                    </span>
                    <button type="button" onClick={() => setSupervisorModal({ open: true, data: s })}
                      className="p-1.5 rounded text-aps-blue hover:bg-aps-blue-light" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14.5 3.5a2.12 2.12 0 013 3L7 17l-4 1 1-4L14.5 3.5z" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => handleDeleteSupervisor(s)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Remove">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 6h12M8 6V4h4v2m1 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Places of Practice */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Places of Practice
              <span className="text-sm font-normal text-gray-400 ml-2">({places.length})</span>
            </h2>
            <button type="button" onClick={() => setPlaceModal({ open: true, data: null })}
              className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
              Add place
            </button>
          </div>
          {places.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No places of practice added yet.</p>
          ) : (
            <div className="space-y-3">
              {places.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.employerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.positionTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {p.addressLine1}{p.addressLine2 ? `, ${p.addressLine2}` : ''}, {p.suburb} {p.state} {p.postcode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPlaceModal({ open: true, data: p })}
                      className="p-1.5 rounded text-aps-blue hover:bg-aps-blue-light" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14.5 3.5a2.12 2.12 0 013 3L7 17l-4 1 1-4L14.5 3.5z" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => handleDeletePlace(p)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Remove">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 6h12M8 6V4h4v2m1 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Save / Cancel */}
        <div className="flex justify-end gap-3">
          <button type="button"
            onClick={() => navigate(isEdit ? `/admin/registrar/programs/${id}` : '/admin/registrar/programs')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
            {isEdit ? 'Save changes' : 'Create program'}
          </button>
        </div>
      </form>

      {/* Modals */}
      <SupervisorModal
        open={supervisorModal.open}
        supervisor={supervisorModal.data}
        onSave={handleSaveSupervisor}
        onCancel={() => setSupervisorModal({ open: false, data: null })}
      />
      <PlaceModal
        open={placeModal.open}
        place={placeModal.data}
        onSave={handleSavePlace}
        onCancel={() => setPlaceModal({ open: false, data: null })}
      />
      <ConfirmDialog
        open={deleteDialog.open}
        title={deleteDialog.title}
        message={deleteDialog.message}
        confirmLabel="Remove"
        onConfirm={deleteDialog.onConfirm}
        onCancel={() => setDeleteDialog({ open: false })}
      />
    </PageShell>
  );
}
