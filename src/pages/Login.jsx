import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initialCpdProfiles } from '../data/mockCpdProfiles';
import { initialPrograms } from '../data/mockPrograms';

const staffRoles = [
  {
    label: 'IT Administrator',
    description: 'Full access to CPD Configuration, Registrar Programs, and all internal management screens.',
    redirect: '/admin/cpd/cycles',
  },
  {
    label: 'Internal User',
    description: 'Access to Member CPD Profiles, Member Registrar Profiles, and Reports.',
    redirect: '/internal/cpd/profiles',
  },
];

function UserIcon() {
  return (
    <svg className="w-6 h-6 text-aps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function MemberIcon() {
  return (
    <svg className="w-6 h-6 text-aps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// Unified member directory: every CPD profile is a possible login persona.
// Coverage chip tells the demo audience what data the persona has.
function buildMemberDirectory() {
  return initialCpdProfiles.map((p) => {
    const programs = initialPrograms.filter((r) => r.memberNumber === p.memberNumber);
    const [firstName, ...lastParts] = p.memberName.replace(/^(Dr|Mr|Mrs|Ms|Miss|Prof)\s+/, '').split(' ');
    const titleMatch = p.memberName.match(/^(Dr|Mr|Mrs|Ms|Miss|Prof)\b/);
    return {
      memberNumber: p.memberNumber,
      title: titleMatch ? titleMatch[1] : '',
      firstName,
      lastName: lastParts.join(' '),
      displayName: p.memberName,
      grade: p.grade,
      cpdProfileId: p.id,
      cpdCycle: p.cpdCycle,
      registrarProgramIds: programs.map((r) => r.id),
      hasRegistrar: programs.length > 0,
    };
  });
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('roles'); // 'roles' | 'memberPicker'

  const members = useMemo(() => buildMemberDirectory(), []);

  function handleStaffSelect(role) {
    login(role.label);
    navigate(role.redirect);
  }

  function handleMemberSelect(m) {
    login('Member', m);
    navigate('/member/cpd');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-aps-blue text-white">
        <div className="flex items-center px-6 h-14">
          <span className="text-lg font-semibold tracking-tight">APS</span>
          <span className="ml-3 text-sm text-white/70">PD Logging Tool</span>
        </div>
      </header>

      {/* Prototype banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-center">
        <p className="text-sm text-amber-800 font-medium">
          Prototype &mdash; for demonstration purposes only
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl">
          {mode === 'roles' && (
            <>
              <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                Select your role
              </h1>
              <p className="text-sm text-gray-500 text-center mb-8">
                Choose a role to explore the prototype.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {staffRoles.map((role) => (
                  <button
                    key={role.label}
                    onClick={() => handleStaffSelect(role)}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-aps-blue hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-aps-blue-light flex items-center justify-center mb-4 group-hover:bg-aps-blue/10">
                      <UserIcon />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 mb-2">{role.label}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">{role.description}</p>
                  </button>
                ))}
                <button
                  onClick={() => setMode('memberPicker')}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 text-left hover:border-aps-blue hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-aps-blue-light flex items-center justify-center mb-4 group-hover:bg-aps-blue/10">
                    <MemberIcon />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 mb-2">Member</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Log in as a registered member to view your CPD cycle, registrar programs, and log activities.
                  </p>
                </button>
              </div>
            </>
          )}

          {mode === 'memberPicker' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setMode('roles')}
                  className="text-sm text-aps-blue hover:underline inline-flex items-center gap-1"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15l-5-5 5-5" />
                  </svg>
                  Back to roles
                </button>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Who are you logging in as?
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Pick a member persona. You'll see the tool from that person's perspective — their CPD cycle, their registrar programs, their activities.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((m) => (
                  <button
                    key={m.memberNumber}
                    onClick={() => handleMemberSelect(m)}
                    className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-aps-blue hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{m.displayName}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{m.memberNumber} · {m.grade}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{m.cpdCycle}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border shrink-0 ${
                        m.hasRegistrar
                          ? 'bg-aps-blue-light text-aps-blue border-aps-blue/20'
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {m.hasRegistrar ? 'CPD + Registrar' : 'CPD only'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-4">
        <p className="text-xs text-gray-500 text-center">
          Australian Psychological Society &mdash; PD Logging Tool &mdash; Prototype
        </p>
      </footer>
    </div>
  );
}
