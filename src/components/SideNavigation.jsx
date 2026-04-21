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
      { label: 'Supervisors', to: '/admin/registrar/supervisors' },
      { label: 'Practice Locations', to: '/admin/registrar/practice-locations' },
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

const memberNavBase = [
  {
    label: 'My CPD',
    children: [
      { label: 'CPD Summary', to: '/member/cpd' },
      { label: 'Manage Profile', to: '/member/cpd/profile' },
      { label: 'Manage Learning Plan', to: '/member/cpd/learning-plan' },
      { label: 'Activities', to: '/member/cpd/activities' },
      { label: 'Report', to: '/member/cpd/report' },
    ],
  },
];

const memberNavRegistrarGroup = {
  label: 'Registrar',
  children: [
    { label: 'My Registrar Programs', to: '/member/registrar' },
    { label: 'My Supervisors', to: '/member/registrar/supervisors' },
    { label: 'My Places of Practice', to: '/member/registrar/places' },
    { label: 'Log Supervision', to: '/member/registrar/log-supervision' },
    { label: 'Log Practice', to: '/member/registrar/log-practice' },
    { label: 'Log CPD', to: '/member/registrar/log-cpd' },
  ],
};

// Build the member nav dynamically. A CPD-only member (no registrar program
// IDs attached at login time) should never see the Registrar sub-menu.
function buildMemberNav(member) {
  const hasRegistrar = Array.isArray(member?.registrarProgramIds) && member.registrarProgramIds.length > 0;
  return hasRegistrar ? [...memberNavBase, memberNavRegistrarGroup] : memberNavBase;
}

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

function NavItem({ item, siblings = [] }) {
  const location = useLocation();

  if (item.children) {
    return (
      <div className="mb-1">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {item.label}
        </div>
        {item.children.map((child) => (
          <NavItem key={child.to} item={child} siblings={item.children} />
        ))}
      </div>
    );
  }

  // Match child routes (e.g. /internal/cpd/profiles/:id highlights /internal/cpd/profiles)
  // but don't highlight a shorter sibling path when a longer sibling also matches.
  const path = location.pathname;
  const otherSiblings = siblings.filter((s) => s.to && s.to !== '#' && s.to !== item.to);
  const longerSiblingMatches = otherSiblings.some(
    (s) => s.to.length > item.to.length && path.startsWith(s.to)
  );
  const isActive = item.to !== '#' && path.startsWith(item.to) && !longerSiblingMatches;

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
  const { role, member } = useAuth();
  const items =
    role === 'IT Administrator' ? adminNav
    : role === 'Member' ? buildMemberNav(member)
    : internalNav;

  return (
    <nav className="w-60 shrink-0 bg-white border-r border-gray-200 py-4">
      {items.map((item) => (
        <NavItem key={item.label} item={item} />
      ))}
    </nav>
  );
}
