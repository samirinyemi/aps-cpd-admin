import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LogCpdActivityModal from '../../components/LogCpdActivityModal';
import { useAuth } from '../../context/AuthContext';
import { useSelectedCycle } from '../../context/CycleContext';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatHours(decimal) {
  if (!decimal) return '0h';
  const whole = Math.floor(decimal);
  const mins = Math.round((decimal - whole) * 60);
  if (whole && mins) return `${whole}h ${mins}m`;
  if (whole) return `${whole}h`;
  return `${mins}m`;
}

function Field({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{children}</dd>
    </div>
  );
}

export default function MyCpdActivityDetail({ cpdProfiles, setCpdProfiles, cycles = [] }) {
  const { member } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCycle } = useSelectedCycle();

  // Step 1: find primary member profile (by memberNumber only)
  const memberProfile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  // Step 2: find cycle sub-profile (by cycleId)
  const cycleProfile = useMemo(
    () => memberProfile?.cycleProfiles?.find((cp) => cp.cycleId === selectedCycle?.id) || null,
    [memberProfile, selectedCycle]
  );

  const activity = useMemo(
    () => (cycleProfile?.activities || []).find((a) => a.id === id) || null,
    [cycleProfile, id]
  );
  const cycle = useMemo(
    () => (cycles || []).find((c) => c.id === activity?.cycleId) || null,
    [cycles, activity]
  );

  const [editOpen, setEditOpen] = useState(searchParams.get('edit') === '1');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // If deleted externally, bounce to the list.
  useEffect(() => {
    if (cycleProfile && !activity) navigate('/member/cpd/activities', { replace: true });
  }, [cycleProfile, activity, navigate]);

  useEffect(() => {
    if (searchParams.get('edit') === '1') {
      setEditOpen(true);
      // clean the URL without reloading
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (!memberProfile || !cycleProfile) {
    return (
      <PageShell>
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-3">No CPD profile found for the selected cycle.</p>
          <Link to="/member/cpd" className="text-aps-blue hover:underline text-sm">
            Go to My CPD
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!activity) {
    return (
      <PageShell>
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-3">Activity not found.</p>
          <Link to="/member/cpd/activities" className="text-aps-blue hover:underline text-sm">
            Back to Activities
          </Link>
        </div>
      </PageShell>
    );
  }

  const kind = activity.activityKind || activity.activityType || 'CPD';
  const isPeer = kind === 'Peer Consultation';
  const isActiveOrOther = kind === 'Active CPD' || kind === 'Other CPD';

  function persistCycleProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.id === memberProfile.id
          ? {
              ...p,
              cycleProfiles: (p.cycleProfiles || []).map((cp) =>
                cp.id === cycleProfile.id ? { ...cp, ...patch } : cp
              ),
            }
          : p
      )
    );
  }

  function handleSave(updated) {
    persistCycleProfile({
      activities: (cycleProfile.activities || []).map((a) => (a.id === updated.id ? updated : a)),
    });
    setEditOpen(false);
  }

  function handleDelete() {
    persistCycleProfile({
      activities: (cycleProfile.activities || []).filter((a) => a.id !== activity.id),
    });
    setConfirmDelete(false);
    navigate('/member/cpd/activities');
  }

  return (
    <PageShell>
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/member/cpd/activities" className="hover:text-aps-blue">Activities</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{kind} · {formatDate(activity.completedDate)}</span>
      </nav>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-semibold text-gray-900">{kind}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-aps-blue/10 text-aps-blue">{formatHours(activity.cpdHrs)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Completed on {formatDate(activity.completedDate)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit activity
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
          >
            Delete activity
          </button>
        </div>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Activity kind">{kind}</Field>
          <Field label="Allocation (AoPE)">{activity.allocation || <span className="text-gray-400">Not allocated</span>}</Field>
          <Field label="Completion date">{formatDate(activity.completedDate)}</Field>
          <Field label="Logged on">{formatDate(activity.loggedDate)}</Field>
          <Field label="CPD cycle">{cycle?.name || <span className="text-gray-400">—</span>}</Field>
          <Field label="CPD hours">{formatHours(activity.cpdHrs)}</Field>

          {isPeer && (
            <>
              <Field label="Focus of consultation">{activity.focus || <span className="text-gray-400">—</span>}</Field>
              <Field label="Colleagues involved">{activity.colleagues || <span className="text-gray-400">—</span>}</Field>
              <Field label="Peer CPD duration">{formatHours(activity.peerHrs)}</Field>
              <Field label="Active CPD duration">{formatHours(activity.actionHrs)}</Field>
            </>
          )}
          {isActiveOrOther && (
            <>
              <Field label="Activity title">{activity.activityTitle || <span className="text-gray-400">—</span>}</Field>
              <Field label="Activity details">
                <span className="whitespace-pre-wrap">{activity.details || <span className="text-gray-400">—</span>}</span>
              </Field>
              <Field label="Total duration">{formatHours(activity.cpdHrs)}</Field>
            </>
          )}
        </dl>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Journal entry</h2>
        <p className="text-xs text-gray-500 mb-3">
          Mode: <span className="font-medium text-gray-700">{activity.journalMode || 'PD Tool'}</span>
        </p>
        {activity.journalNotes ? (
          <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-md p-3">{activity.journalNotes}</p>
        ) : (
          <p className="text-sm text-gray-400">No journal notes recorded.</p>
        )}
      </section>

      <LogCpdActivityModal
        open={editOpen}
        cycle={cycle || (cycles || []).find((c) => c.status === 'Open')}
        allocationOptions={(memberProfile.aoPEs || []).map((a) => ({ value: a, label: a }))}
        existingActivity={activity}
        onSave={handleSave}
        onCancel={() => setEditOpen(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete CPD activity"
        message={`Delete this ${kind} activity from ${formatDate(activity.completedDate)}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </PageShell>
  );
}
