import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';
import { aoPEOptions } from '../../data/mockPrograms';

// HLBR §3.4.5 Manage CPD Profile — US-601 to US-604.
// View-first; edit mode unlocks inline editing governed by profile status rules.

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MyCpdProfile({ cpdProfiles, setCpdProfiles }) {
  const { member } = useAuth();
  const profile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    boardRegistration: profile?.boardRegistration || 'General',
    generalRegistrationDate: profile?.generalRegistrationDate || '',
    cpdExemption: Boolean(profile?.cpdExemption),
    termsOfUse: Boolean(profile?.termsOfUse),
    aoPEs: Array.isArray(profile?.aoPEs) ? [...profile.aoPEs] : [],
  });
  const [errors, setErrors] = useState({});

  if (!profile) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">No CPD profile found.</p>
          <Link to="/member/cpd" className="text-aps-blue hover:underline text-sm">Back to CPD Summary</Link>
        </div>
      </PageShell>
    );
  }

  const aoPEsWithActivities = new Set(
    (profile.activities || []).map((a) => a.allocation).filter(Boolean)
  );

  function toggleAoPE(aope) {
    setForm((prev) => {
      const has = prev.aoPEs.includes(aope);
      return { ...prev, aoPEs: has ? prev.aoPEs.filter((a) => a !== aope) : [...prev.aoPEs, aope] };
    });
    setErrors((prev) => ({ ...prev, aoPEs: undefined }));
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.boardRegistration) errs.boardRegistration = 'Required';
    if (form.boardRegistration === 'General' && !form.generalRegistrationDate) {
      errs.generalRegistrationDate = 'Required when Board Registration is General';
    }
    if (form.generalRegistrationDate) {
      const today = new Date().toISOString().slice(0, 10);
      if (form.generalRegistrationDate > today) errs.generalRegistrationDate = 'Cannot be a future date';
    }
    if (form.boardRegistration === 'General' && !form.termsOfUse) {
      errs.termsOfUse = 'You must acknowledge the Terms of Use';
    }
    // HLBR US-603: can't remove an AoPE with allocated activities
    const removed = (profile.aoPEs || []).filter((a) => !form.aoPEs.includes(a));
    const blocked = removed.filter((a) => aoPEsWithActivities.has(a));
    if (blocked.length > 0) {
      errs.aoPEs = `Can't remove ${blocked.join(', ')} — activities are allocated to ${blocked.length === 1 ? 'it' : 'them'}.`;
    }
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.memberNumber === profile.memberNumber
          ? {
              ...p,
              boardRegistration: form.boardRegistration,
              generalRegistrationDate: form.boardRegistration === 'General' ? form.generalRegistrationDate : null,
              cpdExemption: form.cpdExemption,
              termsOfUse: form.termsOfUse,
              aoPEs: form.aoPEs,
            }
          : p
      )
    );
    setIsEditing(false);
  }

  function handleCancel() {
    setForm({
      boardRegistration: profile.boardRegistration || 'General',
      generalRegistrationDate: profile.generalRegistrationDate || '',
      cpdExemption: Boolean(profile.cpdExemption),
      termsOfUse: Boolean(profile.termsOfUse),
      aoPEs: Array.isArray(profile.aoPEs) ? [...profile.aoPEs] : [],
    });
    setErrors({});
    setIsEditing(false);
  }

  const regAlert = form.boardRegistration === 'Provisional'
    ? "As you hold provisional registration with the Psychology Board, you are not required to meet its CPD requirements."
    : form.boardRegistration === 'Non-Practicing'
      ? "You currently hold non-practicing registration. CPD requirements are deferred."
      : null;

  return (
    <PageShell>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manage Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your professional and CPD-related details.</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
          >
            Edit profile
          </button>
        )}
      </div>

      {regAlert && (
        <section className="mb-6 border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
          {regAlert}
        </section>
      )}

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <dt className="text-xs text-gray-500">Member Name</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{profile.memberName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Member Number</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{profile.memberNumber}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Membership Grade</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{profile.grade}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">CPD Cycle</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{profile.cpdCycle}</dd>
          </div>

          <div>
            <dt className="text-xs text-gray-500">Board Registration</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">
              {isEditing ? (
                <select
                  value={form.boardRegistration}
                  onChange={(e) => update('boardRegistration', e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
                >
                  <option value="General">General</option>
                  <option value="Provisional">Provisional</option>
                  <option value="Non-Practicing">Non-Practicing</option>
                  <option value="Not Registered">Not Registered</option>
                </select>
              ) : (
                form.boardRegistration
              )}
              {errors.boardRegistration && <p className="mt-1 text-xs text-red-600">{errors.boardRegistration}</p>}
            </dd>
          </div>

          {form.boardRegistration === 'General' && (
            <div>
              <dt className="text-xs text-gray-500">General Registration Date</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">
                {isEditing ? (
                  <input
                    type="date"
                    value={form.generalRegistrationDate}
                    onChange={(e) => update('generalRegistrationDate', e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue"
                  />
                ) : (
                  formatDate(form.generalRegistrationDate)
                )}
                {errors.generalRegistrationDate && <p className="mt-1 text-xs text-red-600">{errors.generalRegistrationDate}</p>}
              </dd>
            </div>
          )}

          {form.boardRegistration === 'General' && (
            <div>
              <dt className="text-xs text-gray-500">CPD Exemption</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">
                {isEditing ? (
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={form.cpdExemption} onChange={(e) => update('cpdExemption', e.target.checked)} />
                    <span>Yes — exempt from CPD hours this cycle</span>
                  </label>
                ) : (
                  form.cpdExemption ? 'Yes' : 'No'
                )}
              </dd>
            </div>
          )}

          <div>
            <dt className="text-xs text-gray-500">Terms of Use</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">
              {isEditing ? (
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={form.termsOfUse} onChange={(e) => update('termsOfUse', e.target.checked)} />
                  <span>I acknowledge the Terms of Use</span>
                </label>
              ) : (
                form.termsOfUse ? 'Acknowledged' : 'Not acknowledged'
              )}
              {errors.termsOfUse && <p className="mt-1 text-xs text-red-600">{errors.termsOfUse}</p>}
            </dd>
          </div>
        </dl>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-2">Linked AoPEs</p>
          {isEditing ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aoPEOptions.map((aope) => (
                  <label key={aope} className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={form.aoPEs.includes(aope)}
                      onChange={() => toggleAoPE(aope)}
                    />
                    <span>{aope}</span>
                    {aoPEsWithActivities.has(aope) && (
                      <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-full bg-aps-blue/10 text-aps-blue">logged</span>
                    )}
                  </label>
                ))}
              </div>
              {errors.aoPEs && <p className="mt-2 text-sm text-red-600">{errors.aoPEs}</p>}
            </>
          ) : (
            form.aoPEs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No AoPEs linked yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {form.aoPEs.map((aope) => (
                  <span key={aope} className="px-2 py-1 text-xs font-medium bg-aps-blue-light text-aps-blue border border-aps-blue/20 rounded">
                    {aope}
                  </span>
                ))}
              </div>
            )
          )}
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
            >
              Save changes
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}
