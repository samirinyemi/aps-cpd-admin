import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GlobalNav() {
  const { role } = useAuth();

  return (
    <header className="bg-aps-blue text-white">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">APS</span>
          <span className="text-sm text-white/70">PD Logging Tool</span>
        </div>
        {role && (
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20">
              {role}
            </span>
            <Link
              to="/login"
              className="text-sm text-white/80 hover:text-white underline underline-offset-2"
            >
              Switch role
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
