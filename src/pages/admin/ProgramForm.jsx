import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import {
  aoPEOptions,
  candidateMembers,
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

// ---- Existing Picker Modal ----
function ExistingPickerModal({ open, type, items, onSelect, onCreate, onCancel }) {
  const [search, setSearch] = useState('');
  if (!open) return null;

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    if (type === 'supervisor') {
      return `${item.firstName} ${item.lastName} ${item.ahpraNumber}`.toLowerCase().includes(q);
    }
    return `${item.employerName} ${item.positionTitle}`.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {type === 'supervisor' ? 'Add Supervisor' : 'Add Place of Practice'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">Choose from existing or create a new one.</p>

        {items.length > 0 && (
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={type === 'supervisor' ? 'Search by name or AHPRA number...' : 'Search by employer or position...'}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue mb-3"
            />
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No matches found.</p>
              ) : filtered.map((item) => (
                <button
                  key={item._poolKey}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="w-full text-left border border-gray-200 rounded-lg p-3 hover:border-aps-blue/40 hover:bg-aps-blue-light/30 transition-colors"
                >
                  {type === 'supervisor' ? (
                    <>
                      <p className="text-sm font-medium text-gray-900">
                        {item.title} {item.firstName} {item.lastName}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">AHPRA: {item.ahpraNumber}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          item.supervisionType === 'Primary' ? 'bg-aps-blue/10 text-aps-blue' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.supervisionType}
                        </span>
                        <span className="text-xs text-gray-500">{item.supervisorAoPE}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">{item.employerName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.positionTitle && `${item.positionTitle} · `}
                        {item.suburb}, {item.state}
                      </p>
                    </>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        <div className={`${items.length > 0 ? 'border-t border-gray-200 pt-4' : ''} flex items-center justify-between`}>
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={onCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
            Create new {type === 'supervisor' ? 'supervisor' : 'place'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Helper: collect unique pool from all programs ----
function buildSupervisorPool(programs, excludeIds) {
  const seen = new Map();
  programs.forEach((prog) => {
    (prog.supervisors || []).forEach((s) => {
      // Use AHPRA number as dedup key since it's unique per person
      if (!seen.has(s.ahpraNumber) && !excludeIds.has(s.ahpraNumber)) {
        seen.set(s.ahpraNumber, { ...s, _poolKey: `${prog.id}-${s.id}` });
      }
    });
  });
  return Array.from(seen.values());
}

function buildPlacePool(programs, excludeKeys) {
  const seen = new Map();
  programs.forEach((prog) => {
    (prog.placesOfPractice || []).forEach((p) => {
      // Use employer + address as dedup key
      const key = `${p.employerName}|${p.addressLine1}|${p.suburb}`.toLowerCase();
      if (!seen.has(key) && !excludeKeys.has(key)) {
        seen.set(key, { ...p, _poolKey: `${prog.id}-${p.id}` });
      }
    });
  });
  return Array.from(seen.values());
}

// ---- Main Form ----
export default function ProgramForm({ programs, setPrograms, aoPEPrograms = [], memberRole = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { member: loggedInMember } = useAuth();
  const isEdit = Boolean(id);
  const existing = isEdit ? programs.find((p) => p.id === id) : null;

  // Resolve initial template id: explicit reference, else match by AoPE name, else blank.
  const initialTemplateId = existing
    ? existing.aopeComplianceId
      || aoPEPrograms.find((t) => t.areaOfPractice === existing.areaOfPractice)?.id
      || ''
    : '';

  // If logged in as a Member, default the member block to the logged-in persona.
  const memberDefaults = memberRole && loggedInMember
    ? {
        member: {
          title: loggedInMember.title || '',
          firstName: loggedInMember.firstName || '',
          lastName: loggedInMember.lastName || '',
        },
        memberNumber: loggedInMember.memberNumber,
        memberGrade: loggedInMember.grade || 'Registrar',
      }
    : {
        member: existing?.member || { title: '', firstName: '', lastName: '' },
        memberNumber: existing?.memberNumber || '',
        memberGrade: existing?.memberGrade || 'Registrar',
      };

  const [form, setForm] = useState({
    ...memberDefaults,
    aopeComplianceId: initialTemplateId,
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
  const [supervisorPicker, setSupervisorPicker] = useState(false);
  const [placePicker, setPlacePicker] = useState(false);
  const [primaryConflict, setPrimaryConflict] = useState({ open: false, incoming: null, existing: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false });

  // Build pools of existing supervisors/places from other programs, excluding already-added ones
  const currentSupervisorAhpras = new Set(supervisors.map((s) => s.ahpraNumber));
  const currentPlaceKeys = new Set(places.map((p) => `${p.employerName}|${p.addressLine1}|${p.suburb}`.toLowerCase()));
  const supervisorPool = buildSupervisorPool(programs, currentSupervisorAhpras);
  const placePool = buildPlacePool(programs, currentPlaceKeys);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // HLBR US-1402: a member can have multiple Registrar Programs (one per AoPE),
  // but not two programs in the same AoPE. So the member picker shows everyone,
  // and the AoPE dropdown filters by AoPEs the selected member already has.
  // Build the full member directory from candidateMembers plus any seeded
  // members already referenced by existing programs (deduped by memberNumber).
  const seenMemberNumbers = new Set(candidateMembers.map((m) => m.memberNumber));
  const extraMembers = programs
    .filter((p) => !seenMemberNumbers.has(p.memberNumber))
    .map((p) => ({
      memberNumber: p.memberNumber,
      title: p.member.title,
      firstName: p.member.firstName,
      lastName: p.member.lastName,
      memberGrade: p.memberGrade,
    }));
  // Deduplicate extras
  const extraDedup = Array.from(
    new Map(extraMembers.map((m) => [m.memberNumber, m])).values()
  );
  const availableMembers = [...candidateMembers, ...extraDedup].sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );

  // For the currently selected member, which AoPE template ids are already taken?
  // Excludes the program being edited so the current selection stays valid.
  const takenAopeIdsForMember = (() => {
    if (!form.memberNumber) return new Set();
    const otherPrograms = programs.filter(
      (p) => p.memberNumber === form.memberNumber && (!isEdit || p.id !== id)
    );
    return new Set(otherPrograms.map((p) => p.aopeComplianceId).filter(Boolean));
  })();

  const availableAoPEPrograms = aoPEPrograms.filter(
    (t) => !takenAopeIdsForMember.has(t.id)
  );

  function handleSelectMember(memberNumber) {
    const picked = availableMembers.find((m) => m.memberNumber === memberNumber);
    if (!picked) {
      setForm((prev) => ({
        ...prev,
        member: { title: '', firstName: '', lastName: '' },
        memberNumber: '',
        memberGrade: 'Registrar',
        aopeComplianceId: '',
        areaOfPractice: '',
      }));
      return;
    }
    // Check whether the currently-selected AoPE is still valid for the new member
    const newTakenIds = new Set(
      programs
        .filter((p) => p.memberNumber === memberNumber && (!isEdit || p.id !== id))
        .map((p) => p.aopeComplianceId)
        .filter(Boolean)
    );
    setForm((prev) => {
      const aopeStillValid = prev.aopeComplianceId && !newTakenIds.has(prev.aopeComplianceId);
      return {
        ...prev,
        member: { title: picked.title, firstName: picked.firstName, lastName: picked.lastName },
        memberNumber: picked.memberNumber,
        memberGrade: picked.memberGrade,
        aopeComplianceId: aopeStillValid ? prev.aopeComplianceId : '',
        areaOfPractice: aopeStillValid ? prev.areaOfPractice : '',
      };
    });
    setErrors((prev) => ({ ...prev, memberNumber: undefined, aopeComplianceId: undefined }));
  }

  function validate() {
    const errs = {};
    if (!isEdit && !form.memberNumber) errs.memberNumber = 'Please select a member';
    if (!form.aopeComplianceId) errs.aopeComplianceId = 'Required';
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

    const basePath = memberRole ? '/member/registrar' : '/admin/registrar/programs';
    if (isEdit) {
      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...programData } : p))
      );
      navigate(`${basePath}/${id}`);
    } else {
      const newId = String(Date.now());
      setPrograms((prev) => [...prev, { ...programData, id: newId }]);
      navigate(memberRole ? `${basePath}/${newId}` : basePath);
    }
  }

  // Primary supervisor conflict check
  function checkPrimaryConflict(incomingData, isFromPool) {
    if (incomingData.supervisionType !== 'Primary') return false;
    const existingPrimary = supervisors.find(
      (s) => s.supervisionType === 'Primary' && s.id !== incomingData.id
    );
    if (existingPrimary) {
      setPrimaryConflict({ open: true, incoming: { ...incomingData, _isFromPool: isFromPool }, existing: existingPrimary });
      return true;
    }
    return false;
  }

  function handleConfirmPrimaryOverwrite() {
    const { incoming, existing } = primaryConflict;
    // Demote existing primary to Secondary
    setSupervisors((prev) =>
      prev.map((s) => (s.id === existing.id ? { ...s, supervisionType: 'Secondary' } : s))
    );
    // Now add/update the incoming supervisor
    if (incoming.id && !incoming._isFromPool) {
      // Editing existing supervisor
      const { _isFromPool, ...data } = incoming;
      setSupervisors((prev) => prev.map((s) => (s.id === data.id ? data : s)));
    } else {
      // Adding new (from form or pool)
      const { _isFromPool, _poolKey, ...rest } = incoming;
      const id = rest.id && !_isFromPool ? rest.id : `s-${Date.now()}`;
      setSupervisors((prev) => [...prev, { ...rest, id }]);
    }
    setPrimaryConflict({ open: false, incoming: null, existing: null });
    setSupervisorModal({ open: false, data: null });
    setSupervisorPicker(false);
  }

  function handleCancelPrimaryConflict() {
    setPrimaryConflict({ open: false, incoming: null, existing: null });
  }

  // Select existing from pool
  function handleSelectExistingSupervisor(poolItem) {
    const { _poolKey, id, ...rest } = poolItem;
    const newSup = { ...rest, id: `s-${Date.now()}` };
    if (checkPrimaryConflict({ ...newSup, _poolKey }, true)) return;
    setSupervisors((prev) => [...prev, newSup]);
    setSupervisorPicker(false);
  }

  function handleSelectExistingPlace(poolItem) {
    const { _poolKey, id, ...rest } = poolItem;
    setPlaces((prev) => [...prev, { ...rest, id: `p-${Date.now()}` }]);
    setPlacePicker(false);
  }

  // Supervisor CRUD
  function handleSaveSupervisor(data) {
    if (checkPrimaryConflict(data, false)) return;
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

  const listPath = memberRole ? '/member/registrar' : '/admin/registrar/programs';
  const detailPath = (pid) => (memberRole ? `/member/registrar/${pid}` : `/admin/registrar/programs/${pid}`);

  // Redirect if trying to edit a Closed program
  if (isEdit && existing?.status === 'Closed') {
    navigate(listPath);
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
        <button onClick={() => navigate(listPath)} className="hover:text-aps-blue">
          {memberRole ? 'My Registrar Programs' : 'Registrar Programs'}
        </button>
        {isEdit && existing && (
          <>
            <span className="mx-2">/</span>
            <button onClick={() => navigate(detailPath(id))} className="hover:text-aps-blue">
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
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {memberRole ? 'Your Details' : 'Member Information'}
          </h2>
          {!isEdit && !memberRole && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Member <span className="text-red-500">*</span>
              </label>
              <select
                value={form.memberNumber}
                onChange={(e) => handleSelectMember(e.target.value)}
                className={inputClass('memberNumber')}
              >
                <option value="">Select a member...</option>
                {availableMembers.map((m) => (
                  <option key={m.memberNumber} value={m.memberNumber}>
                    {m.title} {m.firstName} {m.lastName} — {m.memberNumber}
                  </option>
                ))}
              </select>
              {errors.memberNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.memberNumber}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                Member details are read-only and come from the member directory.
              </p>
            </div>
          )}
          {memberRole && (
            <p className="text-xs text-gray-500 mb-4">
              You're enrolling yourself into a new registrar program. These details come from your member record and can't be changed here.
            </p>
          )}
          {(isEdit || form.memberNumber) ? (
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
            <p className="text-sm text-gray-400">No member selected yet.</p>
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
              {aoPEPrograms.length === 0 ? (
                <div className="border border-dashed border-amber-300 bg-amber-50 rounded-md p-3 text-sm text-amber-800">
                  No AoPE compliance programs have been configured yet.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/admin/registrar/aope/new')}
                    className="font-medium underline hover:text-amber-900"
                  >
                    Create one
                  </button>{' '}
                  before starting a registrar program.
                </div>
              ) : form.memberNumber && availableAoPEPrograms.length === 0 ? (
                <div className="border border-dashed border-amber-300 bg-amber-50 rounded-md p-3 text-sm text-amber-800">
                  This member already has a registrar program in every configured AoPE. Pick a different member, or add a new AoPE compliance program.
                </div>
              ) : (
                <select
                  value={form.aopeComplianceId}
                  onChange={(e) => {
                    const templateId = e.target.value;
                    const template = aoPEPrograms.find((t) => t.id === templateId);
                    setForm((prev) => ({
                      ...prev,
                      aopeComplianceId: templateId,
                      areaOfPractice: template?.areaOfPractice || '',
                    }));
                    setErrors((prev) => ({ ...prev, aopeComplianceId: undefined }));
                  }}
                  className={inputClass('aopeComplianceId') + ' bg-white'}
                  disabled={!form.memberNumber}
                >
                  <option value="">
                    {form.memberNumber ? 'Select area of practice...' : 'Select a member first...'}
                  </option>
                  {availableAoPEPrograms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.areaOfPractice}
                    </option>
                  ))}
                </select>
              )}
              {errors.aopeComplianceId && (
                <p className="mt-1 text-sm text-red-600">{errors.aopeComplianceId}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                Only AoPEs the member doesn't yet have a registrar program for are shown (HLBR US-1402).
              </p>
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
                  <span className="text-sm text-gray-700">Yes (This means you are working towards a second AoPE)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="holdsAoPE" checked={form.holdsAoPE === false}
                    onChange={() => update('holdsAoPE', false)}
                    className="w-4 h-4 text-aps-blue border-gray-300 focus:ring-aps-blue" />
                  <span className="text-sm text-gray-700">No (This means you are working towards your first AoPE)</span>
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
                  <span className="text-sm text-gray-700">Yes (This means you need to undertake two registrar programs for each area of practice to obtain an AoPE in each area)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="dualQual" checked={form.dualQualification === false}
                    onChange={() => update('dualQualification', false)}
                    className="w-4 h-4 text-aps-blue border-gray-300 focus:ring-aps-blue" />
                  <span className="text-sm text-gray-700">No (This means your qualifying degree is in one area of practice such as clinical neuropsychology, counselling, organisational etc.)</span>
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
            <button type="button" onClick={() => setSupervisorPicker(true)}
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
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button type="button" onClick={() => handleDeleteSupervisor(s)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Remove">
                      <Trash2 size={14} strokeWidth={1.5} />
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
            <button type="button" onClick={() => setPlacePicker(true)}
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
                      <Pencil size={14} strokeWidth={1.5} />
                    </button>
                    <button type="button" onClick={() => handleDeletePlace(p)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50" title="Remove">
                      <Trash2 size={14} strokeWidth={1.5} />
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
            onClick={() => navigate(isEdit ? detailPath(id) : listPath)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
            {isEdit ? 'Save changes' : 'Create program'}
          </button>
        </div>
      </form>

      {/* Picker Modals */}
      <ExistingPickerModal
        open={supervisorPicker}
        type="supervisor"
        items={supervisorPool}
        onSelect={handleSelectExistingSupervisor}
        onCreate={() => { setSupervisorPicker(false); setSupervisorModal({ open: true, data: null }); }}
        onCancel={() => setSupervisorPicker(false)}
      />
      <ExistingPickerModal
        open={placePicker}
        type="place"
        items={placePool}
        onSelect={handleSelectExistingPlace}
        onCreate={() => { setPlacePicker(false); setPlaceModal({ open: true, data: null }); }}
        onCancel={() => setPlacePicker(false)}
      />

      {/* Primary Supervisor Conflict Dialog */}
      {primaryConflict.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelPrimaryConflict} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} strokeWidth={1.5} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Existing Primary Supervisor</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-gray-900">
                {primaryConflict.existing?.title} {primaryConflict.existing?.firstName} {primaryConflict.existing?.lastName}
              </span>{' '}
              is currently the primary supervisor for this program.
            </p>
            <p className="text-sm text-gray-600 mb-5">
              Would you like to replace them with{' '}
              <span className="font-medium text-gray-900">
                {primaryConflict.incoming?.title} {primaryConflict.incoming?.firstName} {primaryConflict.incoming?.lastName}
              </span>
              ? The current primary supervisor will be changed to Secondary.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={handleCancelPrimaryConflict}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Keep current primary
              </button>
              <button type="button" onClick={handleConfirmPrimaryOverwrite}
                className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
                Replace primary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modals */}
      <SupervisorModal
        key={`sup-${supervisorModal.data?.id || 'new'}-${supervisorModal.open}`}
        open={supervisorModal.open}
        supervisor={supervisorModal.data}
        onSave={handleSaveSupervisor}
        onCancel={() => setSupervisorModal({ open: false, data: null })}
      />
      <PlaceModal
        key={`place-${placeModal.data?.id || 'new'}-${placeModal.open}`}
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
