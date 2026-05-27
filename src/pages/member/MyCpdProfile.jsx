import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import PageShell from '../../components/PageShell';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useSelectedCycle } from '../../context/CycleContext';
import { aoPEOptions } from '../../data/mockPrograms';
import SelectField from '../../components/SelectField';

// HLBR §3.4.5 Manage CPD Profile — US-601 to US-604.
// View-first; edit mode unlocks inline editing.
// No-cycleProfile state (Pending/Open): inline setup form on this page.

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const BOARD_REG_OPTIONS = ['General', 'Provisional', 'Non-Practising', 'Not Registered'];

const EXEMPT_REGISTRATIONS = ['Provisional', 'Non-Practising', 'Not Registered'];

// US-603: derive registrar programStatus from boardRegistration
// General | Not Registered → Open ; Provisional | Non-Practising → Pending
function deriveRegistrarStatus(boardRegistration) {
  return ['General', 'Not Registered'].includes(boardRegistration) ? 'Open' : 'Pending';
}

export default function MyCpdProfile({ cpdProfiles, setCpdProfiles, registrarProfiles, setRegistrarProfiles }) {
  const { member } = useAuth();
  const { selectedCycle } = useSelectedCycle();

  // Step 1: primary member profile (by memberNumber)
  const memberProfile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  // Step 2: cycle sub-profile (by cycleId)
  const cycleProfile = useMemo(
    () => memberProfile?.cycleProfiles?.find((cp) => cp.cycleId === selectedCycle?.id) || null,
    [memberProfile, selectedCycle]
  );

  // ── Shared form state (used for both setup and edit flows) ────────────────
  const [setupOpen, setSetupOpen]  = useState(false);
  const [isEditing, setIsEditing]  = useState(false);
  const [form, setForm] = useState({
    boardRegistration:       memberProfile?.boardRegistration        || 'General',
    generalRegistrationDate: memberProfile?.generalRegistrationDate  || '',
    cpdExemption:            Boolean(cycleProfile?.cpdExemption),
    termsOfUse:              Boolean(cycleProfile?.termsOfUse),
    aoPEs:                   Array.isArray(memberProfile?.aoPEs) ? [...memberProfile.aoPEs] : [],
  });
  const [errors, setErrors] = useState({});

  // ── Helpers ───────────────────────────────────────────────────────────────
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function toggleAoPE(aope) {
    setForm((prev) => {
      const has = prev.aoPEs.includes(aope);
      return { ...prev, aoPEs: has ? prev.aoPEs.filter((a) => a !== aope) : [...prev.aoPEs, aope] };
    });
    setErrors((prev) => ({ ...prev, aoPEs: undefined }));
  }

  const aoPEsWithActivities = useMemo(
    () => new Set((cycleProfile?.activities || []).map((a) => a.allocation).filter(Boolean)),
    [cycleProfile]
  );

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
    // Can't remove an AoPE that has allocated activities (edit only)
    if (cycleProfile) {
      const removed  = (memberProfile.aoPEs || []).filter((a) => !form.aoPEs.includes(a));
      const blocked  = removed.filter((a) => aoPEsWithActivities.has(a));
      if (blocked.length > 0) {
        errs.aoPEs = `Can't remove ${blocked.join(', ')} — activities are allocated to ${blocked.length === 1 ? 'it' : 'them'}.`;
      }
    }
    return errs;
  }

  function persistMemberProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) => (p.id === memberProfile.id ? { ...p, ...patch } : p))
    );
  }

  function persistCycleProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.id === memberProfile.id
          ? { ...p, cycleProfiles: (p.cycleProfiles || []).map((cp) => cp.id === cycleProfile.id ? { ...cp, ...patch } : cp) }
          : p
      )
    );
  }

  // ── Setup handler — creates cycleProfile + saves member-level fields ──────
  function handleSetup() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const newCp = {
      id: `cp-${memberProfile.id}-${selectedCycle.id}-${Date.now()}`,
      cycleId:           selectedCycle.id,
      cpdCycle:          selectedCycle.name,
      cpdExemption:      form.cpdExemption,
      termsOfUse:        form.termsOfUse,
      requirementsMet:   false,
      learningPlanMethod: 'PD Tool',
      learningPlanReviews: [],
      learningNeeds:     [],
      activities:        [],
    };

    setCpdProfiles((prev) =>
      prev.map((p) =>
        p.id === memberProfile.id
          ? {
              ...p,
              boardRegistration:       form.boardRegistration,
              generalRegistrationDate: form.boardRegistration === 'General' ? form.generalRegistrationDate : null,
              aoPEs:                   form.aoPEs,
              cycleProfiles:           [...(p.cycleProfiles || []), newCp],
            }
          : p
      )
    );

    // US-603: update registrar programStatus based on boardRegistration
    if (setRegistrarProfiles) {
      const derivedStatus = deriveRegistrarStatus(form.boardRegistration);
      setRegistrarProfiles((prev) =>
        prev.map((p) =>
          p.memberNumber === member?.memberNumber && p.programStatus !== 'Closed'
            ? { ...p, programStatus: derivedStatus }
            : p
        )
      );
    }

    setSetupOpen(false);
  }

  // ── Edit save / cancel ────────────────────────────────────────────────────
  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    persistMemberProfile({
      boardRegistration:       form.boardRegistration,
      generalRegistrationDate: form.boardRegistration === 'General' ? form.generalRegistrationDate : null,
      aoPEs:                   form.aoPEs,
    });
    persistCycleProfile({ cpdExemption: form.cpdExemption, termsOfUse: form.termsOfUse });

    // US-603: update registrar programStatus based on boardRegistration
    if (setRegistrarProfiles) {
      const derivedStatus = deriveRegistrarStatus(form.boardRegistration);
      setRegistrarProfiles((prev) =>
        prev.map((p) =>
          p.memberNumber === member?.memberNumber && p.programStatus !== 'Closed'
            ? { ...p, programStatus: derivedStatus }
            : p
        )
      );
    }

    setIsEditing(false);
  }

  function handleCancel() {
    setForm({
      boardRegistration:       memberProfile.boardRegistration        || 'General',
      generalRegistrationDate: memberProfile.generalRegistrationDate  || '',
      cpdExemption:            Boolean(cycleProfile.cpdExemption),
      termsOfUse:              Boolean(cycleProfile.termsOfUse),
      aoPEs:                   Array.isArray(memberProfile.aoPEs) ? [...memberProfile.aoPEs] : [],
    });
    setErrors({});
    setIsEditing(false);
  }

  // ── No-cycleProfile state ─────────────────────────────────────────────────
  if (!memberProfile || !cycleProfile) {
    // Closed cycle → no setup offered (data should always exist for closed cycles)
    if (selectedCycle?.status === 'Closed') {
      return (
        <PageShell>
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <BookOpen size={26} strokeWidth={1.5} className="text-gray-400" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No records for this cycle</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">No CPD profile was found for the selected closed cycle.</p>
          </div>
        </PageShell>
      );
    }

    // Pending / Open — CTA landing
    if (!setupOpen) {
      return (
        <PageShell>
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-aps-blue-light flex items-center justify-center">
                <BookOpen size={26} strokeWidth={1.5} className="text-aps-blue" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedCycle?.status === 'Pending'
                ? `Get ready for ${selectedCycle.name}`
                : `Set up your CPD profile for ${selectedCycle?.name}`}
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {selectedCycle?.status === 'Pending'
                ? "This cycle hasn't opened yet. You can set up your profile now so you're ready to go when it opens."
                : "You don't have a CPD profile for this cycle yet. Set one up to start logging your professional development."}
            </p>
            <button
              type="button"
              onClick={() => setSetupOpen(true)}
              className="px-5 py-2.5 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
            >
              Set up CPD profile
            </button>
          </div>
        </PageShell>
      );
    }

    // Pending / Open — Setup form
    return (
      <PageShell>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Set up CPD profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {selectedCycle?.name} — complete your registration details to get started.
          </p>
        </div>

        <ProfileFormBody
          form={form}
          errors={errors}
          isEditing={true}
          update={update}
          toggleAoPE={toggleAoPE}
          aoPEsWithActivities={aoPEsWithActivities}
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => { setSetupOpen(false); setErrors({}); }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSetup}
            className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark"
          >
            Set up CPD profile
          </button>
        </div>
      </PageShell>
    );
  }

  // ── View / Edit mode (cycleProfile exists) ────────────────────────────────
  const regAlert = form.boardRegistration === 'Provisional'
    ? "As you hold provisional registration with the Psychology Board, you are not required to meet its CPD requirements."
    : form.boardRegistration === 'Non-Practising'
      ? "You currently hold non-practising registration. CPD requirements are deferred."
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

        {/* Read-only fields that never change with a cycle */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6">
          <div>
            <dt className="text-xs text-gray-500">Member Name</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{memberProfile.memberName}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Member Number</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{memberProfile.memberNumber}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Membership Grade</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{memberProfile.grade}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">CPD Cycle</dt>
            <dd className="text-sm font-medium text-gray-900 mt-0.5">{cycleProfile.cpdCycle}</dd>
          </div>
        </dl>

        <ProfileFormBody
          form={form}
          errors={errors}
          isEditing={isEditing}
          update={update}
          toggleAoPE={toggleAoPE}
          aoPEsWithActivities={aoPEsWithActivities}
        />

        {isEditing && (
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="button" onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-aps-blue rounded-md hover:bg-aps-blue-dark">
              Save changes
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}

// ── Shared form body (used in both setup and edit flows) ──────────────────────
function ProfileFormBody({ form, errors, isEditing, update, toggleAoPE, aoPEsWithActivities }) {
  return (
    <div className="space-y-5">
      {/* Board Registration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        <div>
          <dt className="text-xs text-gray-500 mb-0.5">Board Registration</dt>
          <dd className="text-sm font-medium text-gray-900">
            {isEditing ? (
              <SelectField value={form.boardRegistration} onChange={(e) => update('boardRegistration', e.target.value)}>
                {BOARD_REG_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </SelectField>
            ) : (
              form.boardRegistration
            )}
            {errors.boardRegistration && <p className="mt-1 text-xs text-red-600">{errors.boardRegistration}</p>}
          </dd>
        </div>

        {/* Status — derived from boardRegistration, view mode only */}
        {!isEditing && (
          <div>
            <dt className="text-xs text-gray-500 mb-0.5">Status</dt>
            <dd className="mt-0.5">
              <StatusBadge status={deriveRegistrarStatus(form.boardRegistration)} />
            </dd>
          </div>
        )}

        {/* General Registration Date — conditional on board reg */}
        {form.boardRegistration === 'General' && (
          <div>
            <dt className="text-xs text-gray-500 mb-0.5">General Registration Date</dt>
            <dd className="text-sm font-medium text-gray-900">
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
      </div>

      {/* CPD Exemption + Terms of Use */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {form.boardRegistration === 'General' && (
          <div>
            <dt className="text-xs text-gray-500 mb-0.5">CPD Exemption / Reduction</dt>
            <dd className="text-sm font-medium text-gray-900">
              {isEditing ? (
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={form.cpdExemption} onChange={(e) => update('cpdExemption', e.target.checked)} />
                  <span>Yes — exempt from CPD hours this cycle</span>
                </label>
              ) : (
                form.cpdExemption ? 'Exempt' : 'Not exempt'
              )}
            </dd>
          </div>
        )}

        <div>
          <dt className="text-xs text-gray-500 mb-0.5">Terms of Use</dt>
          <dd className="text-sm font-medium text-gray-900">
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
      </div>

      {/* Areas of Practice / Endorsements */}
      <div className={isEditing ? 'pt-2 border-t border-gray-100' : ''}>
        <p className="text-xs text-gray-500 mb-2">Areas of Practice / Endorsements</p>
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aoPEOptions.map((aope) => (
                <label key={aope} className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={form.aoPEs.includes(aope)} onChange={() => toggleAoPE(aope)} />
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
            <p className="text-sm text-gray-400 italic">No areas of practice linked yet.</p>
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
    </div>
  );
}
