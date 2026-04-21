import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initialCycles } from './data/mockCycles';
import { initialPrograms } from './data/mockPrograms';
import { initialAoPEPrograms } from './data/mockAoPEPrograms';
import { initialCpdProfiles } from './data/mockCpdProfiles';
import { initialRegistrarProfiles } from './data/mockRegistrarProfiles';
import { initialSupervisors } from './data/mockSupervisors';
import { initialPracticeLocations } from './data/mockPracticeLocations';

import Login from './pages/Login';
import CycleList from './pages/admin/CycleList';
import CycleForm from './pages/admin/CycleForm';
import ProgramList from './pages/admin/ProgramList';
import ProgramForm from './pages/admin/ProgramForm';
import ProgramDetail from './pages/admin/ProgramDetail';
import CycleDetail from './pages/admin/CycleDetail';
import CpdProfilesList from './pages/internal/CpdProfilesList';
import CpdProfileDetail from './pages/internal/CpdProfileDetail';
import CpdActivitiesList from './pages/internal/CpdActivitiesList';
import RegistrarProfilesList from './pages/internal/RegistrarProfilesList';
import RegistrarProfileDetail from './pages/internal/RegistrarProfileDetail';
import RegistrarActivitiesList from './pages/internal/RegistrarActivitiesList';
import AoPEList from './pages/admin/AoPEList';
import AoPEDetail from './pages/admin/AoPEDetail';
import AoPEForm from './pages/admin/AoPEForm';
import LogCPD from './pages/admin/LogCPD';
import SupervisorList from './pages/admin/SupervisorList';
import SupervisorForm from './pages/admin/SupervisorForm';
import PracticeLocationList from './pages/admin/PracticeLocationList';
import PracticeLocationForm from './pages/admin/PracticeLocationForm';
import MyCpd from './pages/member/MyCpd';
import MyRegistrarPrograms from './pages/member/MyRegistrarPrograms';
import MemberRegistrarShortcut from './pages/member/MemberRegistrarShortcut';

function landingPathFor(role) {
  if (role === 'IT Administrator') return '/admin/cpd/cycles';
  if (role === 'Member') return '/member/cpd';
  return '/internal/cpd/profiles';
}

function RequireAuth({ children, adminOnly = false, memberOnly = false }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (adminOnly && role !== 'IT Administrator') return <Navigate to={landingPathFor(role)} replace />;
  if (memberOnly && role !== 'Member') return <Navigate to={landingPathFor(role)} replace />;
  // Internal/admin-ish routes shouldn't be reachable by Members.
  if (!memberOnly && role === 'Member') return <Navigate to="/member/cpd" replace />;
  return children;
}

function AppRoutes() {
  const [cycles, setCycles] = useState(initialCycles);
  const [programs, setPrograms] = useState(initialPrograms);
  const [cpdProfiles] = useState(initialCpdProfiles);
  const [aoPEPrograms, setAoPEPrograms] = useState(initialAoPEPrograms);
  const [registrarProfiles] = useState(initialRegistrarProfiles);
  const [supervisors, setSupervisors] = useState(initialSupervisors);
  const [practiceLocations, setPracticeLocations] = useState(initialPracticeLocations);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin: CPD Configuration */}
      <Route path="/admin/cpd/cycles" element={
        <RequireAuth adminOnly><CycleList cycles={cycles} setCycles={setCycles} /></RequireAuth>
      } />
      <Route path="/admin/cpd/cycles/new" element={
        <RequireAuth adminOnly><CycleForm cycles={cycles} setCycles={setCycles} /></RequireAuth>
      } />
      <Route path="/admin/cpd/cycles/:id/edit" element={
        <RequireAuth adminOnly><CycleForm cycles={cycles} setCycles={setCycles} /></RequireAuth>
      } />
      <Route path="/admin/cpd/cycles/:id" element={
        <RequireAuth adminOnly><CycleDetail cycles={cycles} setCycles={setCycles} /></RequireAuth>
      } />

      {/* Admin: Registrar Programs */}
      <Route path="/admin/registrar/programs" element={
        <RequireAuth adminOnly><ProgramList programs={programs} /></RequireAuth>
      } />
      <Route path="/admin/registrar/programs/new" element={
        <RequireAuth adminOnly><ProgramForm programs={programs} setPrograms={setPrograms} aoPEPrograms={aoPEPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/programs/:id/edit" element={
        <RequireAuth adminOnly><ProgramForm programs={programs} setPrograms={setPrograms} aoPEPrograms={aoPEPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/programs/:id" element={
        <RequireAuth adminOnly><ProgramDetail programs={programs} setPrograms={setPrograms} supervisors={supervisors} practiceLocations={practiceLocations} aoPEPrograms={aoPEPrograms} /></RequireAuth>
      } />

      {/* Admin: Activity Logging */}
      <Route path="/admin/registrar/log-cpd" element={
        <RequireAuth adminOnly><LogCPD programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />

      {/* Admin: Manage Supervisors */}
      <Route path="/admin/registrar/supervisors" element={
        <RequireAuth adminOnly><SupervisorList supervisors={supervisors} programs={programs} /></RequireAuth>
      } />
      <Route path="/admin/registrar/supervisors/new" element={
        <RequireAuth adminOnly><SupervisorForm supervisors={supervisors} setSupervisors={setSupervisors} programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/supervisors/:id" element={
        <RequireAuth adminOnly><SupervisorForm supervisors={supervisors} setSupervisors={setSupervisors} programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />

      {/* Admin: Manage Practice Locations */}
      <Route path="/admin/registrar/practice-locations" element={
        <RequireAuth adminOnly><PracticeLocationList locations={practiceLocations} programs={programs} /></RequireAuth>
      } />
      <Route path="/admin/registrar/practice-locations/new" element={
        <RequireAuth adminOnly><PracticeLocationForm locations={practiceLocations} setLocations={setPracticeLocations} programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/practice-locations/:id" element={
        <RequireAuth adminOnly><PracticeLocationForm locations={practiceLocations} setLocations={setPracticeLocations} programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />

      {/* Admin: AoPE Compliance Configuration */}
      <Route path="/admin/registrar/aope" element={
        <RequireAuth adminOnly><AoPEList aoPEPrograms={aoPEPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/aope/new" element={
        <RequireAuth adminOnly><AoPEForm aoPEPrograms={aoPEPrograms} setAoPEPrograms={setAoPEPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/aope/:id/edit" element={
        <RequireAuth adminOnly><AoPEForm aoPEPrograms={aoPEPrograms} setAoPEPrograms={setAoPEPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/aope/:id" element={
        <RequireAuth adminOnly><AoPEDetail aoPEPrograms={aoPEPrograms} /></RequireAuth>
      } />

      {/* Internal: CPD Management */}
      <Route path="/internal/cpd/profiles" element={
        <RequireAuth><CpdProfilesList profiles={cpdProfiles} /></RequireAuth>
      } />
      <Route path="/internal/cpd/profiles/:id" element={
        <RequireAuth><CpdProfileDetail profiles={cpdProfiles} /></RequireAuth>
      } />
      <Route path="/internal/cpd/activities" element={
        <RequireAuth><CpdActivitiesList profiles={cpdProfiles} /></RequireAuth>
      } />

      {/* Internal: Registrar Management */}
      <Route path="/internal/registrar/profiles" element={
        <RequireAuth><RegistrarProfilesList profiles={registrarProfiles} /></RequireAuth>
      } />
      <Route path="/internal/registrar/profiles/:id" element={
        <RequireAuth><RegistrarProfileDetail profiles={registrarProfiles} /></RequireAuth>
      } />
      <Route path="/internal/registrar/activities" element={
        <RequireAuth><RegistrarActivitiesList profiles={registrarProfiles} /></RequireAuth>
      } />

      {/* Member: self-service */}
      <Route path="/member/cpd" element={
        <RequireAuth memberOnly><MyCpd cpdProfiles={cpdProfiles} programs={programs} aoPEPrograms={aoPEPrograms} /></RequireAuth>
      } />
      <Route path="/member/registrar" element={
        <RequireAuth memberOnly><MyRegistrarPrograms programs={programs} aoPEPrograms={aoPEPrograms} /></RequireAuth>
      } />
      <Route path="/member/registrar/supervisors" element={
        <RequireAuth memberOnly><MemberRegistrarShortcut action="supervisors" programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/member/registrar/places" element={
        <RequireAuth memberOnly><MemberRegistrarShortcut action="places" programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/member/registrar/log-supervision" element={
        <RequireAuth memberOnly><MemberRegistrarShortcut action="log-supervision" programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/member/registrar/log-practice" element={
        <RequireAuth memberOnly><MemberRegistrarShortcut action="log-practice" programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/member/registrar/log-cpd" element={
        <RequireAuth memberOnly><MemberRegistrarShortcut action="log-cpd" programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/member/registrar/new" element={
        <RequireAuth memberOnly><ProgramForm programs={programs} setPrograms={setPrograms} aoPEPrograms={aoPEPrograms} memberRole /></RequireAuth>
      } />
      <Route path="/member/registrar/:id/edit" element={
        <RequireAuth memberOnly><ProgramForm programs={programs} setPrograms={setPrograms} aoPEPrograms={aoPEPrograms} memberRole /></RequireAuth>
      } />
      <Route path="/member/registrar/:id" element={
        <RequireAuth memberOnly><ProgramDetail programs={programs} setPrograms={setPrograms} supervisors={supervisors} practiceLocations={practiceLocations} aoPEPrograms={aoPEPrograms} /></RequireAuth>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
