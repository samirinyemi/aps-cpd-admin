import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';

function Field({ label, value, children }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900">{children ?? value ?? <span className="text-gray-400">—</span>}</dd>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function RegistrarProfileDetail({ profiles, setProfiles }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const profile = profiles.find((p) => p.id === id);

  // Edit form state — seeded from current profile
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);

  if (!profile) {
    return (
      <PageShell>
        <p className="text-sm text-gray-500">Profile not found.</p>
      </PageShell>
    );
  }

  const isAdmin = role === 'IT Administrator';
  const isEditable = profile.programStatus === 'Open' || profile.programStatus === 'Pending';
  const isClosed = profile.programStatus === 'Closed';

  function openEdit() {
    setForm({
      grade: profile.grade || '',
      program: profile.program || '',
      commencementDate: profile.commencementDate || '',
      qualification: profile.qualification || '',
    });
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setForm(null);
  }

  function handleSave() {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              grade: form.grade,
              program: form.program,
              commencementDate: form.commencementDate,
              qualification: form.qualification,
            }
          : p
      )
    );
    setEditMode(false);
    setForm(null);
  }

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const inputCls =
    'w-full h-10 px-3 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue';

  const supervisorColumns = [
    { key: 'name', label: 'Supervisor Name' },
    { key: 'role', label: 'Role' },
    { key: 'aope', label: 'AoPE' },
    { key: 'approvalDate', label: 'Approval Date' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const placeColumns = [
    { key: 'name', label: 'Practice Name' },
    { key: 'type', label: 'Type' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date', render: (row) => row.endDate || <span className="text-gray-400">—</span> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const activityColumns = [
    { key: 'activityType', label: 'Activity Type' },
    {
      key: 'supervisorPractice',
      label: 'Supervisor / Practice',
      render: (row) => {
        if (row.activityType === 'Supervision') return row.supervisorName;
        if (row.activityType === 'Practice') return row.employerName;
        return <span className="text-gray-400">—</span>;
      },
    },
    {
      key: 'supervisionType',
      label: 'Supervision Type',
      render: (row) =>
        row.activityType === 'Supervision'
          ? row.supervisionType
          : <span className="text-gray-400">—</span>,
    },
    { key: 'completionDate', label: 'Completion Date' },
    { key: 'hours', label: 'Hours' },
  ];

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/internal/registrar/profiles')} className="hover:text-aps-blue">
          Member Registrar Profiles
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{profile.memberName}</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{profile.memberName}</h1>
          <StatusBadge status={profile.programStatus} />
        </div>
        {isAdmin && isEditable && !editMode && (
          <button
            onClick={openEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Edit
          </button>
        )}
      </div>

      {/* Read-only banner (Closed only) */}
      {isClosed && (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 mb-6">
          <p className="text-sm text-amber-800">
            This program is closed. All fields are read-only.
          </p>
        </div>
      )}

      {/* Section A — Profile */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>

        {editMode ? (
          /* ── Edit form ─────────────────────────────────────────────── */
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <FormField label="Grade">
                <input
                  type="text"
                  value={form.grade}
                  onChange={set('grade')}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Registrar Program">
                <input
                  type="text"
                  value={form.program}
                  onChange={set('program')}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Commencement Date">
                <input
                  type="date"
                  value={form.commencementDate}
                  onChange={set('commencementDate')}
                  className={inputCls}
                />
              </FormField>

              <FormField label="Qualification">
                <input
                  type="text"
                  value={form.qualification}
                  onChange={set('qualification')}
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
              >
                Save changes
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── View mode ─────────────────────────────────────────────── */
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Name" value={profile.memberName} />
            <Field label="Number" value={profile.memberNumber} />
            <Field label="Grade" value={profile.grade} />
            <Field label="Program" value={profile.program} />
            <Field label="Commencement Date" value={profile.commencementDate} />
            <Field label="Qualification" value={profile.qualification} />
            <Field label="Board Registration" value={profile.boardRegistration} />
            <div>
              <dt className="text-xs font-medium text-gray-500 mb-0.5">Program Status</dt>
              <dd><StatusBadge status={profile.programStatus} /></dd>
            </div>
          </dl>
        )}
      </section>

      {/* Sections B–D are always read-only display */}

      {/* Section B — Supervisors */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Supervisors</h2>
        <DataTable
          columns={supervisorColumns}
          data={profile.supervisors}
          emptyMessage="No supervisors assigned."
        />
      </section>

      {/* Section C — Places of Practice */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Places of Practice</h2>
        <DataTable
          columns={placeColumns}
          data={profile.placesOfPractice}
          emptyMessage="No places of practice recorded."
        />
      </section>

      {/* Section D — Activities */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Activities</h2>
        <DataTable
          columns={activityColumns}
          data={profile.activities}
          emptyMessage="No activities logged."
        />
      </section>
    </PageShell>
  );
}
