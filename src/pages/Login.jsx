import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roles = [
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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSelect(role) {
    login(role.label);
    navigate(role.redirect);
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

      {/* Role cards */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            Select your role
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            Choose a role to explore the admin interface prototype.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {roles.map((role) => (
              <button
                key={role.label}
                onClick={() => handleSelect(role)}
                className="bg-white border-2 border-gray-200 rounded-lg p-8 text-left hover:border-aps-blue hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-aps-blue-light flex items-center justify-center mb-4 group-hover:bg-aps-blue/10">
                  <svg className="w-6 h-6 text-aps-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{role.label}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{role.description}</p>
              </button>
            ))}
          </div>
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
