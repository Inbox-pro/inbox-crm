import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Organization, Permission } from '../types';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';

interface AuthContextType {
  currentUser: User | null;
  currentOrg: Organization | null;
  role: Role;
  organizations: Organization[];
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  login: (email: string, password?: string, targetRole?: 'admin' | 'user' | Role) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const userRes = await authService.getCurrentUser();
      const orgsRes = await settingsService.getOrganizations();
      const activeOrgIdRes = await settingsService.getActiveOrganizationId();

      setCurrentUser(userRes.data);
      setIsAuthenticated(!!userRes.data && authService.isAuthenticated());
      setOrganizations(orgsRes.data);
      const activeOrg = orgsRes.data.find(o => o.id === activeOrgIdRes.data) || orgsRes.data[0];
      setCurrentOrg(activeOrg);
    } catch {
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const role: Role = currentUser?.role || 'Super Admin';
  const permissions = authService.getPermissionsForRole(role);

  const hasPermission = (permission: Permission) => {
    return permissions.includes(permission);
  };

  const login = async (
    email: string,
    password?: string,
    targetRole?: 'admin' | 'user' | Role
  ) => {
    const res = await authService.login(email, password, targetRole);
    if (res.success && res.data) {
      setCurrentUser(res.data);
      setIsAuthenticated(true);
      return { success: true, message: res.message };
    }
    return {
      success: false,
      message: res.message || 'Invalid credentials. Please check your email or password.',
    };
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const switchRole = async (newRole: Role) => {
    const res = await authService.switchRole(newRole);
    setCurrentUser(res.data);
  };

  const switchUser = async (userId: string) => {
    const res = await authService.switchUser(userId);
    setCurrentUser(res.data);
  };

  const switchOrganization = async (orgId: string) => {
    await settingsService.switchOrganization(orgId);
    const found = organizations.find(o => o.id === orgId);
    if (found) setCurrentOrg(found);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentOrg,
        role,
        organizations,
        permissions,
        isAuthenticated,
        isLoading,
        hasPermission,
        login,
        logout,
        switchRole,
        switchUser,
        switchOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
