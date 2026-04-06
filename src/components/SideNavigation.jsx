import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  {
    label: 'CPD Configuration',
    children: [
      { label: 'CPD Cycles', to: '/admin/cpd/cycles' },
    ],
  },
  {
    label: 'Registrar Configuration',
    children: [
      { label: 'AoPE Compliance', to: '/admin/registrar/aope' },
      { label: 'Registrar Programs', to: '/admin/registrar/programs' },
      { label: 'Log Supervision', to: '/admin/registrar/log-supervision' },
      { label: 'Log Practice Hours', to: '/admin/registrar/log-practice' },
      { label: 'Log CPD Hours', to: '/admin/registrar/log-cpd' },
    ],
  },
  {
    label: 'CPD Management',
    children: [
      { label: 'Member CPD Profiles', to: '/internal/cpd/profiles' },
      { label: 'All CPD Activities', to: '/internal/cpd/activities' },
    ],
  },
  {
    label: 'Registrar Management',
    children: [
      { label: 'Member Registrar Profiles', to: '/internal/registrar/profiles' },
      { label: 'All Registrar Activities', to: '/internal/registrar/activities' },
    ],
  },
  {
    label: 'Reports',
    to: '#',
  },
];

const internalNav = [
  {
    label: 'CPD Management',
    children: [
      { label: 'Member CPD Profiles', to: '/internal/cpd/profiles' },
      { label: 'All CPD Activities', to: '/internal/cpd/activities' },
    ],
  },
  {
    label: 'Registrar Management',
    children: [
      { label: 'Member Registrar Profiles', to: '/internal/registrar/profiles' },
      { label: 'All Registrar Activities', to: '/internal/registrar/activities' },
    ],
  },
  {
    label: 'Reports',
    to: '#',
  },
];

function NavItem({ item }) {
  const location = useLocation();

  if (item.children) {
    return (
      <div className="mb-1">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {item.label}
        </div>
        {item.children.map((child) => (
          <NavItem key={child.to} item={child} />
        ))}
      </div>
    );
  }

  // Match child routes (e.g. /internal/cpd/profiles/:id highlights /internal/cpd/profiles)
  const isActive = item.to !== '#' && location.pathname.startsWith(item.to);

  return (
    <NavLink
      to={item.to}
      className={
        `block px-4 py-2.5 text-sm rounded-md mx-2 mb-0.5 transition-colors ${
          isActive
            ? 'bg-aps-blue text-white font-medium'
            : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

export default function SideNavigation() {
  const { role } = useAuth();
  const items = role === 'IT Administrator' ? adminNav : internalNav;

  return (
    <nav className="w-60 shrink-0 bg-white border-r border-gray-200 py-4">
      {items.map((item) => (
        <NavItem key={item.label} item={item} />
      ))}
    </nav>
  );
}
