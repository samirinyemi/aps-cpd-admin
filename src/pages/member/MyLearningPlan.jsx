import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { useAuth } from '../../context/AuthContext';

// HLBR §3.4.6 Manage Learning Plan — US-701 to US-706.

const emptyNeed = {
  need: '',
  activities: '',
  dates: '',
  outcomes: '',
};

export default function MyLearningPlan({ cpdProfiles, setCpdProfiles }) {
  const { member } = useAuth();
  const profile = useMemo(
    () => (cpdProfiles || []).find((p) => p.memberNumber === member?.memberNumber) || null,
    [cpdProfiles, member]
  );

  const [method, setMethod] = useState(profile?.learningPlanMethod || 'PD Tool');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyNeed });
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

  function persistProfile(patch) {
    setCpdProfiles((prev) =>
      prev.map((p) => (p.memberNumber === profile.memberNumber ? { ...p, ...patch } : p))
    );
  }

  function changeMethod(next) {
    setMethod(next);
    persistProfile({ learningPlanMethod: next });
  }

  function validate() {
    const errs = {};
    if (!form.need.trim()) errs.need = 'Required';
    if (!form.activities.trim()) errs.activities = 'Required';
    if (!form.dates.trim()) errs.dates = 'Required';
    if (!form.outcomes.trim()) errs.outcomes = 'Required';
    return errs;
  }

  function startAdd() {
    setEditingId('__new');
    setForm({ ...emptyNeed });
    setErrors({});
  }

  function startEdit(need) {
    setEditingId(need.id);
    setForm({
      need: need.need || '',
      activities: need.activities || '',
      dates: need.dates || '',
      outcomes: need.outcomes || '',
    });
    setErrors({});
  }

  function saveNeed() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const needs = profile.learningNeeds || [];
    if (editingId === '__new') {
      const newNeed = { id: `ln-${Date.now()}`, ...form, status: 'Not Started' };
      persistProfile({ learningNeeds: [...needs, newNeed] });
    } else {
      persistProfile({
        learningNeeds: needs.map((n) => (n.id === editingId ? { ...n, ...form } : n)),
      });
    }
    setEditingId(null);
  }

  function deleteNeed(id) {
    persistProfile({
      learningNeeds: (profile.learningNeeds || []).filter((n) => n.id !== id),
    });
    if (editingId === id) setEditingId(null);
  }

  function markReviewed() {
    persistProfile({ learningPlanReviewedAt: new Date().toISOString() });
  }

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Manage Learning Plan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Record your planned learning activities and goals.</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Documentation method</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: 'PD Tool', label: 'I will use the online system' },
            { value: 'Offline', label: "I've documented my plan elsewhere" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => changeMethod(opt.value)}
              className={`px-3 py-2.5 text-sm font-medium rounded-md border transition-colors text-left ${
                method === opt.value
                  ? 'border-aps-blue bg-aps-blue-light text-aps-blue'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {method === 'Offline' ? (
        <section className="bg-white border border-dashed border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-600">
            Your learning plan is documented offline. Switch to <span className="font-medium">PD Tool</span> above to capture learning needs here.
          </p>
        </section>
      ) : (
        <>
          <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Learning Needs
                <span className="text-sm font-normal text-gray-400 ml-2">({(profile.learningNeeds || []).length})</span>
              </h2>
              {editingId === null && (
                <button
                  type="button"
                  onClick={startAdd}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark"
                >
                  Add learning need
                </button>
              )}
            </div>

            {editingId !== null && (
              <div className="border border-aps-blue/30 bg-aps-blue-light/30 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {editingId === '__new' ? 'New learning need' : 'Edit learning need'}
                </p>
                <div className="space-y-3">
                  {[
                    ['need', 'Learning need identified', 250],
                    ['activities', 'Activities proposed to meet this need', 250],
                    ['dates', 'Proposed dates for activities', 60],
                    ['outcomes', 'Anticipated outcomes', 250],
                  ].map(([field, label, max]) => (
                    <div key={field}>
                      <label className="block text-xs text-gray-600 mb-1">{label}</label>
                      <input
                        type="text"
                        value={form[field]}
                        maxLength={max}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                        className={`w-full h-10 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-aps-blue/30 focus:border-aps-blue ${errors[field] ? 'border-red-400' : 'border-gray-300'}`}
                      />
                      {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveNeed}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-aps-blue rounded hover:bg-aps-blue-dark"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {(profile.learningNeeds || []).length === 0 ? (
              <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500">No learning needs recorded yet.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {(profile.learningNeeds || []).map((ln) => (
                  <li key={ln.id} className="border border-gray-100 rounded-md p-3 bg-gray-50/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 font-medium">{ln.need}</p>
                        {ln.activities && <p className="text-xs text-gray-600 mt-1">Activities: {ln.activities}</p>}
                        {ln.dates && <p className="text-xs text-gray-600 mt-1">Dates: {ln.dates}</p>}
                        {ln.outcomes && <p className="text-xs text-gray-600 mt-1">Outcomes: {ln.outcomes}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(ln)}
                          className="text-xs px-2 py-1 text-aps-blue hover:bg-aps-blue-light rounded"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNeed(ln.id)}
                          className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Review of learning plan</h2>
            {profile.learningPlanReviewedAt ? (
              <p className="text-sm text-gray-700">
                Last reviewed on{' '}
                <span className="font-medium">
                  {new Date(profile.learningPlanReviewedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>.
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-3">You haven't reviewed your learning plan this cycle yet.</p>
            )}
            <button
              type="button"
              onClick={markReviewed}
              className="mt-3 px-4 py-2 text-sm font-medium text-aps-blue border border-aps-blue rounded-md hover:bg-aps-blue-light"
            >
              Mark plan as reviewed today
            </button>
          </section>
        </>
      )}
    </PageShell>
  );
}
