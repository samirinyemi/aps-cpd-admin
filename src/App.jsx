import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initialCycles } from './data/mockCycles';
import { initialPrograms } from './data/mockPrograms';
import { initialCpdProfiles } from './data/mockCpdProfiles';
import { initialRegistrarProfiles } from './data/mockRegistrarProfiles';

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

function RequireAuth({ children, adminOnly = false }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (adminOnly && role !== 'IT Administrator') return <Navigate to="/internal/cpd/profiles" replace />;
  return children;
}

function AppRoutes() {
  const [cycles, setCycles] = useState(initialCycles);
  const [programs, setPrograms] = useState(initialPrograms);
  const [cpdProfiles] = useState(initialCpdProfiles);
  const [registrarProfiles] = useState(initialRegistrarProfiles);

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
        <RequireAuth adminOnly><ProgramForm programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/programs/:id/edit" element={
        <RequireAuth adminOnly><ProgramForm programs={programs} setPrograms={setPrograms} /></RequireAuth>
      } />
      <Route path="/admin/registrar/programs/:id" element={
        <RequireAuth adminOnly><ProgramDetail programs={programs} /></RequireAuth>
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

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/aps-cpd-admin">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
