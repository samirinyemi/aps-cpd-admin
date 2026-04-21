import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import LogCpdActivityModal from '../../components/LogCpdActivityModal';
import { useAuth } from '../../context/AuthContext';

// HLBR §3.4.7 Log CPD Activity page — US-801 to US-805.
// This wraps LogCpdActivityModal so the modal becomes a dedicated route.

export default function MyCpdLog({ cpdProfiles, setCpdProfiles, cycles = [] }) {
  const { member } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  const profile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  const openCycle = useMemo(
    () => (cycles || []).find((c) => c.status === 'Open') || null,
    [cycles]
  );

  // HLBR US-801 redirect: if the member's profile is Pending OR Board Registration
  // is neither General nor Not Registered, send them to Manage Profile.
  useEffect(() => {
    if (!profile) return;
    const isActiveForLogging =
      ['General', 'Not Registered'].includes(profile.boardRegistration);
    if (!isActiveForLogging) {
      navigate('/member/cpd/profile', { replace: true });
    }
  }, [profile, navigate]);

  function handleSave(activity) {
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.memberNumber === profile.memberNumber
          ? { ...p, activities: [...(p.activities || []), activity] }
          : p
      )
    );
    setModalOpen(false);
    // HLBR US-805: ask whether to log another.
    const again = typeof window !== 'undefined' ? window.confirm('Activity saved. Log another?') : false;
    if (again) {
      setTimeout(() => setModalOpen(true), 0);
    } else {
      navigate('/member/cpd/activities');
    }
  }

  if (!profile || !openCycle) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">Unable to log activity right now.</p>
          <Link to="/member/cpd" className="text-aps-blue hover:underline text-sm">Back to CPD Summary</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Log CPD Activity</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Recording against <span className="font-medium text-gray-700">{openCycle.name}</span>.
        </p>
      </div>

      {!modalOpen && (
        <section className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Activity saved.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
            >
              Log another activity
            </button>
            <Link
              to="/member/cpd/activities"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              View activity history
            </Link>
          </div>
        </section>
      )}

      <LogCpdActivityModal
        open={modalOpen}
        cycle={openCycle}
        allocationOptions={(profile.aoPEs || []).map((a) => ({ value: a, label: a }))}
        onSave={handleSave}
        onCancel={() => navigate('/member/cpd')}
      />
    </PageShell>
  );
}
