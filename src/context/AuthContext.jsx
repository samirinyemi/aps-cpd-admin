import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

function readStoredMember() {
  try {
    const raw = localStorage.getItem('aps-member');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('aps-role') || null;
    } catch {
      return null;
    }
  });
  const [member, setMember] = useState(() => readStoredMember());

  // login(role) for admin/internal users; login(role, member) for Member role.
  const login = useCallback((selectedRole, selectedMember = null) => {
    setRole(selectedRole);
    setMember(selectedMember);
    try {
      localStorage.setItem('aps-role', selectedRole);
      if (selectedMember) {
        localStorage.setItem('aps-member', JSON.stringify(selectedMember));
      } else {
        localStorage.removeItem('aps-member');
      }
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setMember(null);
    try {
      localStorage.removeItem('aps-role');
      localStorage.removeItem('aps-member');
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ role, member, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
