import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LogSessionModal from '../../components/LogSessionModal';
import { aoPEOptions, titleOptions } from '../../data/mockPrograms';

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
  title: 'Dr',
  firstName: '',
  lastName: '',
  ahpraNumber: '',
  supervisorAoPE: '',
  email: '',
  phone: '',
};

function AssignProgramModal({ open, programs, supervisor, onSave, onCancel }) {
  const [programId, setProgramId] = useState('');
  const [supervisionType, setSupervisionType] = useState('Primary');

  useEffect(() => {
    if (open) {
      setProgramId('');
      setSupervisionType('Primary');
    }
  }, [open]);

  if (!open) return null;

  const assignedIds = new Set(supervisor.assignedPrograms.map((a) => a.programId));
  const available = programs.filter((p) => p.status === 'Open' && !assignedIds.has(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Assign to Existing Program</h3>
        <p className="text-sm text-gray-500 mb-5">
          Attach this supervisor to an Open registrar program.
        </p>

        {available.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center border border-dashed border-gray-200 rounded-md mb-6">
            No eligible programs. All Open programs already include this supervisor.
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supervision Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['Primary', 'Secondary'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSupervisionType(t)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-md border transition-colors ${
                      supervisionType === t
                        ? 'border-aps-blue bg-aps-blue-light text-aps-blue'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
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
            onClick={() => onSave({ programId, supervisionType })}
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

export default function SupervisorForm({ supervisors, setSupervisors, programs, setPrograms }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNew = !id;
  const existing = !isNew ? supervisors.find((s) => s.id === id) : null;
  const [isEditing, setIsEditing] = useState(isNew || searchParams.get('edit') === '1');

  const [form, setForm] = useState(
    existing
      ? {
          title: existing.title,
          firstName: existing.firstName,
          lastName: existing.lastName,
          ahpraNumber: existing.ahpraNumber,
          supervisorAoPE: existing.supervisorAoPE,
          email: existing.email || '',
          phone: existing.phone || '',
        }
      : { ...emptyForm }
  );
  const [errors, setErrors] = useState({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [dialog, setDialog] = useState({ open: false });

  // Sessions for this supervisor across all programs
  const sessions = !isNew
    ? programs.flatMap((p) =>
        (p.activities || [])
          .filter((a) => a.activityType === 'Supervision' && a.supervisorId === id)
          .map((a) => ({ ...a, programId: p.id, programMember: `${p.member.firstName} ${p.member.lastName}` }))
      )
    : [];

  function handleLogSession(programId, activity) {
    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, activities: [...(p.activities || []), activity] } : p))
    );
    setLogOpen(false);
  }

  function handleRemoveSession(session) {
    setDialog({
      open: true,
      title: 'Remove Session',
      message: `Remove this supervision session from ${session.programMember}'s program? This cannot be undone.`,
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
          <p className="text-gray-500 mb-4">Supervisor not found.</p>
          <button
            onClick={() => navigate('/admin/registrar/supervisors')}
            className="text-aps-blue hover:underline text-sm"
          >
            Back to Manage Supervisors
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
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.ahpraNumber.trim()) errs.ahpraNumber = 'Required';
    if (!form.supervisorAoPE) errs.supervisorAoPE = 'Required';
    return errs;
  }

  function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (isNew) {
      const newId = `sv-${Date.now()}`;
      setSupervisors((prev) => [...prev, { id: newId, ...form, assignedPrograms: [] }]);
      navigate(`/admin/registrar/supervisors/${newId}`);
    } else {
      setSupervisors((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...form } : s))
      );
      // Propagate name/AHPRA/AoPE changes into any programs that reference this supervisor.
      setPrograms((prev) =>
        prev.map((p) => ({
          ...p,
          supervisors: (p.supervisors || []).map((ps) =>
            ps.id === id
              ? {
                  ...ps,
                  title: form.title,
                  firstName: form.firstName,
                  lastName: form.lastName,
                  ahpraNumber: form.ahpraNumber,
                  supervisorAoPE: form.supervisorAoPE,
                }
              : ps
          ),
        }))
      );
      setIsEditing(false);
      setSearchParams({}, { replace: true });
    }
  }

  function handleCancelEdit() {
    if (isNew) {
      navigate('/admin/registrar/supervisors');
      return;
    }
    // Reset form to existing values and exit edit mode
    if (existing) {
      setForm({
        title: existing.title,
        firstName: existing.firstName,
        lastName: existing.lastName,
        ahpraNumber: existing.ahpraNumber,
        supervisorAoPE: existing.supervisorAoPE,
        email: existing.email || '',
        phone: existing.phone || '',
      });
      setErrors({});
    }
    setIsEditing(false);
    setSearchParams({}, { replace: true });
  }

  function handleAssignSave({ programId, supervisionType }) {
    // Add to supervisor catalogue record
    setSupervisors((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, assignedPrograms: [...s.assignedPrograms, { programId, supervisionType }] }
          : s
      )
    );
    // Add to the program's supervisors array
    setPrograms((prev) =>
      prev.map((p) =>
        p.id === programId
          ? {
              ...p,
              supervisors: [
                ...(p.supervisors || []),
                {
                  id,
                  title: form.title,
                  firstName: form.firstName,
                  lastName: form.lastName,
                  ahpraNumber: form.ahpraNumber,
                  supervisionType,
                  supervisorAoPE: form.supervisorAoPE,
                },
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
      message: `Remove ${form.firstName} ${form.lastName} from ${program?.member.firstName} ${program?.member.lastName}'s program? Any logged supervision activities will remain.`,
      confirmLabel: 'Unassign',
      onConfirm: () => {
        setSupervisors((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, assignedPrograms: s.assignedPrograms.filter((a) => a.programId !== programId) }
              : s
          )
        );
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId
              ? { ...p, supervisors: (p.supervisors || []).filter((ps) => ps.id !== id) }
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
        <button onClick={() => navigate('/admin/registrar/supervisors')} className="hover:text-aps-blue">
          Manage Supervisors
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">
          {isNew ? 'New Supervisor' : `${form.firstName} ${form.lastName}`}
        </span>
      </nav>

      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-900">
          {isNew ? 'Add Supervisor' : isEditing ? 'Edit Supervisor' : 'View Supervisor'}
        </h1>
        {!isNew && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit supervisor
          </button>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900">Supervisor Details</h2>

          {!isEditing ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <dt className="text-xs text-gray-500">Full Name</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">
                  {form.title} {form.firstName} {form.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">AHPRA Number</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.ahpraNumber || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Supervisor AoPE</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.supervisorAoPE || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.email || <span className="text-gray-400">—</span>}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Phone</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{form.phone || <span className="text-gray-400">—</span>}</dd>
              </div>
            </dl>
          ) : (
          <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <select
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className={inputClass('title') + ' bg-white'}
              >
                {titleOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                className={inputClass('firstName')}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className={inputClass('lastName')}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">AHPRA Number</label>
              <input
                type="text"
                value={form.ahpraNumber}
                onChange={(e) => update('ahpraNumber', e.target.value)}
                className={inputClass('ahpraNumber')}
                placeholder="PSY0001234567"
              />
              {errors.ahpraNumber && <p className="mt-1 text-sm text-red-600">{errors.ahpraNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Supervisor AoPE</label>
              <select
                value={form.supervisorAoPE}
                onChange={(e) => update('supervisorAoPE', e.target.value)}
                className={inputClass('supervisorAoPE') + ' bg-white'}
              >
                <option value="">Select an AoPE…</option>
                {aoPEOptions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.supervisorAoPE && <p className="mt-1 text-sm text-red-600">{errors.supervisorAoPE}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass('email')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass('phone')}
              />
            </div>
          </div>
          </div>
          )}
        </div>

        {/* Assignments — only on existing records */}
        {!isNew && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Assigned Programs</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Programs that currently include this supervisor.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  type="button"
                  onClick={() => setLogOpen(true)}
                  disabled={currentAssignments.length === 0}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Log session
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
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Supervision Type</th>
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
                          <td className="px-4 py-3 text-gray-700">{a.supervisionType}</td>
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

        {/* Recent Sessions */}
        {!isNew && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Recent Sessions</h2>
            <p className="text-sm text-gray-500 mb-4">
              Supervision sessions logged for this supervisor across all assigned programs.
            </p>
            {sessions.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-400">No sessions logged yet.</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Registrar</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Duration</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...sessions].sort((a, b) => b.completionDate.localeCompare(a.completionDate)).map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 text-gray-700">{formatDate(s.completionDate)}</td>
                        <td className="px-4 py-3 text-gray-900">{s.programMember}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            s.supervisionType === 'Individual' ? 'bg-aps-blue/10 text-aps-blue' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {s.supervisionType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{formatDuration(s.hours, s.minutes)}</td>
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

        {/* Save / Cancel */}
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
              {isNew ? 'Add supervisor' : 'Save changes'}
            </button>
          </div>
        )}
      </form>

      {!isNew && (
        <>
          <AssignProgramModal
            open={assignOpen}
            programs={programs}
            supervisor={existing}
            onSave={handleAssignSave}
            onCancel={() => setAssignOpen(false)}
          />
          <LogSessionModal
            open={logOpen}
            supervisor={existing}
            programs={programs}
            onSave={handleLogSession}
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
