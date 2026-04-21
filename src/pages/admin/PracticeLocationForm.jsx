import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LogHoursModal from '../../components/LogHoursModal';
import { stateOptions } from '../../data/mockPrograms';

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(h, m) {
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
}

const emptyForm = {
  positionTitle: '',
  employerName: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  suburb: '',
  postcode: '',
  state: '',
};

function AssignProgramModal({ open, programs, location, onSave, onCancel }) {
  const [programId, setProgramId] = useState('');

  useEffect(() => {
    if (open) setProgramId('');
  }, [open]);

  if (!open) return null;

  const assignedIds = new Set(location.assignedPrograms.map((a) => a.programId));
  const available = programs.filter((p) => p.status === 'Open' && !assignedIds.has(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Assign to Existing Program</h3>
        <p className="text-sm text-gray-500 mb-5">
          Attach this practice location to an Open registrar program.
        </p>

        {available.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center border border-dashed border-gray-200 rounded-md mb-6">
            No eligible programs. All Open programs already include this location.
          </p>
        ) : (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Program</label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full h-12 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
              >
                <option value="">Select a program…</option>
                {available.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.member.firstName} {p.member.lastName} — {p.areaOfPractice}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ programId })}
            disabled={!programId || available.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PracticeLocationForm({ locations, setLocations, programs, setPrograms }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNew = !id;
  const existing = !isNew ? locations.find((l) => l.id === id) : null;
  const [isEditing, setIsEditing] = useState(isNew || searchParams.get('edit') === '1');

  const [form, setForm] = useState(
    existing
      ? {
          positionTitle: existing.positionTitle,
          employerName: existing.employerName,
          phone: existing.phone || '',
          email: existing.email || '',
          addressLine1: existing.addressLine1,
          addressLine2: existing.addressLine2 || '',
          suburb: existing.suburb,
          postcode: existing.postcode,
          state: existing.state,
        }
      : { ...emptyForm }
  );
  const [errors, setErrors] = useState({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [dialog, setDialog] = useState({ open: false });

  const sessions = !isNew
    ? programs.flatMap((p) =>
        (p.activities || [])
          .filter((a) => a.activityType === 'Practice' && a.placeId === id)
          .map((a) => ({ ...a, programId: p.id, programMember: `${p.member.firstName} ${p.member.lastName}` }))
      )
    : [];

  function handleLogHours(programId, activity) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, activities: [...(p.activities || []), activity] } : p))
    );
    setLogOpen(false);
  }

  function handleRemoveSession(session) {
    setDialog({
      open: true,
      title: 'Remove Hours',
      message: `Remove this practice entry from ${session.programMember}'s program? This cannot be undone.`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === session.programId
              ? { ...p, activities: (p.activities || []).filter((a) => a.id !== session.id) }
              : p
          )
        );
        setDialog({ open: false });
      },
    });
  }

  if (!isNew && !existing) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Practice location not found.</p>
          <button
            onClick={() => navigate('/admin/registrar/practice-locations')}
            className="text-aps-blue hover:underline text-sm"
          >
            Back to Manage Practice Locations
          </button>
        </div>
      </PageShell>
    );
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.employerName.trim()) errs.employerName = 'Required';
    if (!form.positionTitle.trim()) errs.positionTitle = 'Required';
    if (!form.addressLine1.trim()) errs.addressLine1 = 'Required';
    if (!form.suburb.trim()) errs.suburb = 'Required';
    if (!form.postcode.trim()) errs.postcode = 'Required';
    if (!form.state) errs.state = 'Required';
    return errs;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (isNew) {
      const newId = `pl-${Date.now()}`;
      setLocations((prev) => [...prev, { id: newId, ...form, assignedPrograms: [] }]);
      navigate(`/admin/registrar/practice-locations/${newId}`);
    } else {
      setLocations((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...form } : l))
      );
      // Propagate updates into any programs that reference this location.
      setPrograms((prev) =>
        prev.map((p) => ({
          ...p,
          placesOfPractice: (p.placesOfPractice || []).map((pp) =>
            pp.id === id ? { ...pp, ...form } : pp
          ),
        }))
      );
      setIsEditing(false);
      setSearchParams({}, { replace: true });
    }
  }

  function handleCancelEdit() {
    if (isNew) {
      navigate('/admin/registrar/practice-locations');
      return;
    }
    if (existing) {
      setForm({
        positionTitle: existing.positionTitle,
        employerName: existing.employerName,
        phone: existing.phone || '',
        email: existing.email || '',
        addressLine1: existing.addressLine1,
        addressLine2: existing.addressLine2 || '',
        suburb: existing.suburb,
        postcode: existing.postcode,
        state: existing.state,
      });
      setErrors({});
    }
    setIsEditing(false);
    setSearchParams({}, { replace: true });
  }

  function handleAssignSave({ programId }) {
    setLocations((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, assignedPrograms: [...l.assignedPrograms, { programId }] }
          : l
      )
    );
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === programId
          ? {
              ...p,
              placesOfPractice: [
                ...(p.placesOfPractice || []),
                { id, ...form },
              ],
            }
          : p
      )
    );
    setAssignOpen(false);
  }

  function handleUnassign(programId) {
    const program = programs.find((p) => p.id === programId);
    setDialog({
      open: true,
      title: 'Unassign from Program',
      message: `Remove ${form.employerName} from ${program?.member.firstName} ${program?.member.lastName}'s program? Any logged practice activities will remain.`,
      confirmLabel: 'Unassign',
      onConfirm: () => {
        setLocations((prev) =>
          prev.map((l) =>
            l.id === id
              ? { ...l, assignedPrograms: l.assignedPrograms.filter((a) => a.programId !== programId) }
              : l
          )
        );
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId
              ? { ...p, placesOfPractice: (p.placesOfPractice || []).filter((pp) => pp.id !== id) }
              : p
          )
        );
        setDialog({ open: false });
      },
    });
  }

  const inputClass = (field) =>
    `w-full h-14 px-4 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  const currentAssignments = existing ? existing.assignedPrograms : [];

  return (
    <PageShell>
      <nav className="text-sm text-gray-500 mb-6">
        <button
          onClick={() => navigate('/admin/registrar/practice-locations')}
          className="hover:text-aps-blue"
        >
          Manage Practice Locations
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">
          {isNew ? 'New Location' : form.employerName}
        </span>
      </nav>

      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-900">
          {isNew ? 'Add Practice Location' : isEditing ? 'Edit Practice Location' : 'View Practice Location'}
        </h1>
        {!isNew && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit location
          </button>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900">Location Details</h2>

          {!isEditing ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <dt className="text-xs text-gray-500">Employer / Organisation</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.employerName || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Position Title</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.positionTitle || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Phone</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.phone || <span className="text-gray-400">—</span>}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.email || <span className="text-gray-400">—</span>}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-500">Address</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">
                  {form.addressLine1}
                  {form.addressLine2 ? `, ${form.addressLine2}` : ''}
                  <br />
                  {form.suburb} {form.state} {form.postcode}
                </dd>
              </div>
            </dl>
          ) : (
          <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Employer / Organisation</label>
              <input
                type="text"
                value={form.employerName}
                onChange={(e) => update('employerName', e.target.value)}
                className={inputClass('employerName')}
              />
              {errors.employerName && <p className="mt-1 text-sm text-red-600">{errors.employerName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Position Title</label>
              <input
                type="text"
                value={form.positionTitle}
                onChange={(e) => update('positionTitle', e.target.value)}
                className={inputClass('positionTitle')}
              />
              {errors.positionTitle && <p className="mt-1 text-sm text-red-600">{errors.positionTitle}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass('phone')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass('email')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address line 1</label>
              <input
                type="text"
                value={form.addressLine1}
                onChange={(e) => update('addressLine1', e.target.value)}
                className={inputClass('addressLine1')}
              />
              {errors.addressLine1 && <p className="mt-1 text-sm text-red-600">{errors.addressLine1}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address line 2</label>
              <input
                type="text"
                value={form.addressLine2}
                onChange={(e) => update('addressLine2', e.target.value)}
                className={inputClass('addressLine2')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Suburb</label>
              <input
                type="text"
                value={form.suburb}
                onChange={(e) => update('suburb', e.target.value)}
                className={inputClass('suburb')}
              />
              {errors.suburb && <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Postcode</label>
              <input
                type="text"
                value={form.postcode}
                onChange={(e) => update('postcode', e.target.value)}
                className={inputClass('postcode')}
              />
              {errors.postcode && <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <select
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
                className={inputClass('state') + ' bg-white'}
              >
                <option value="">—</option>
                {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>
          </div>
          </div>
          )}
        </div>

        {!isNew && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Assigned Programs</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Programs where this location is currently listed as a place of practice.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  type="button"
                  onClick={() => setLogOpen(true)}
                  disabled={currentAssignments.length === 0}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Log hours
                </button>
                <button
                  type="button"
                  onClick={() => setAssignOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-aps-blue border border-aps-blue rounded hover:bg-aps-blue-light"
                >
                  Assign to Program
                </button>
              </div>
            </div>

            {currentAssignments.length === 0 ? (
              <div className="mt-4 py-8 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-400">Not assigned to any program yet.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Program</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">AoPE</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssignments.map((a) => {
                      const p = programs.find((pr) => pr.id === a.programId);
                      return (
                        <tr key={a.programId} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {p ? `${p.member.title} ${p.member.firstName} ${p.member.lastName}` : 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{p?.areaOfPractice || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleUnassign(a.programId)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Unassign
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Recent Hours */}
        {!isNew && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Recent Hours</h2>
            <p className="text-sm text-gray-500 mb-4">
              Practice hours logged for this location across all assigned programs.
            </p>
            {sessions.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-400">No hours logged yet.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Registrar</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Duration</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Direct Contact</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...sessions].sort((a, b) => b.completionDate.localeCompare(a.completionDate)).map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 text-gray-700">{formatDate(s.completionDate)}</td>
                        <td className="px-4 py-3 text-gray-900">{s.programMember}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDuration(s.hours, s.minutes)}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDuration(s.directContactHours, s.directContactMinutes)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSession(s)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
            >
              {isNew ? 'Add location' : 'Save changes'}
            </button>
          </div>
        )}
      </form>

      {!isNew && (
        <>
          <AssignProgramModal
            open={assignOpen}
            programs={programs}
            location={existing}
            onSave={handleAssignSave}
            onCancel={() => setAssignOpen(false)}
          />
          <LogHoursModal
            open={logOpen}
            location={existing}
            programs={programs}
            onSave={handleLogHours}
            onCancel={() => setLogOpen(false)}
          />
        </>
      )}

      <ConfirmDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={() => setDialog({ open: false })}
      />
    </PageShell>
  );
}
