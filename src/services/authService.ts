import { User, Role, Permission } from '../types';
import { MOCK_USERS } from '../mock/users';
import { ROLE_PERMISSIONS } from '../mock/settings';
import { ApiResponse, simulateNetworkLatency } from './api';

const AUTH_USER_KEY = 'inbox_current_user_v2';
const AUTH_TOKEN_KEY = 'inbox_crm_auth_token_v2';

export interface UserCredentialConfig {
  email: string;
  passwords: string[];
  user: User;
}

// Pre-configured account credentials with valid passwords
export const PRECONFIGURED_CREDENTIALS: Record<string, string[]> = {
  'admin@inboxinfotech.com': ['admin@inbox2025', 'demo1234', 'admin123', 'inbox@2025'],
  'ananya@inboxinfotech.com': ['ananya@inbox2025', 'demo1234', 'admin123', 'inbox@2025'],
  'manager@inboxinfotech.com': ['manager@inbox2025', 'demo1234', 'manager123', 'inbox@2025'],
  'sales@inboxinfotech.com': ['sales@inbox2025', 'demo1234', 'sales123', 'inbox@2025'],
  'pooja@inboxinfotech.com': ['pooja@inbox2025', 'demo1234', 'sales123', 'inbox@2025'],
  'kavita@inboxinfotech.com': ['kavita@inbox2025', 'demo1234', 'sales123', 'inbox@2025'],
  'arjun@inboxinfotech.com': ['arjun@inbox2025', 'demo1234', 'sales123', 'inbox@2025'],
  'sneha@inboxinfotech.com': ['sneha@inbox2025', 'demo1234', 'manager123', 'inbox@2025'],
  'deepak@inboxinfotech.com': ['deepak@inbox2025', 'demo1234', 'inbox@2025'],
  'meera@inboxinfotech.com': ['meera@inbox2025', 'demo1234', 'sales123', 'inbox@2025'],
};

export const authService = {
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const stored = localStorage.getItem(AUTH_USER_KEY);
    
    if (!token) {
      return simulateNetworkLatency({
        success: false,
        data: null,
      }, 30);
    }

    let user: User = MOCK_USERS[0];
    if (stored) {
      try {
        user = JSON.parse(stored);
      } catch {
        user = MOCK_USERS[0];
      }
    }

    return simulateNetworkLatency({
      success: true,
      data: user,
    }, 30);
  },

  async login(
    email: string,
    password?: string,
    targetRole?: 'admin' | 'user' | Role
  ): Promise<ApiResponse<User>> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. Validate email presence
    if (!cleanEmail) {
      return simulateNetworkLatency({
        success: false,
        data: null as any,
        message: 'Please enter your work email address.',
      }, 60);
    }

    // 2. Validate user existence in registry
    const matchedUser = MOCK_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      return simulateNetworkLatency({
        success: false,
        data: null as any,
        message: `No registered account found for "${email.trim()}". Please enter a valid account or use the demo credentials below.`,
      }, 100);
    }

    // 3. Validate password presence
    if (!cleanPassword) {
      return simulateNetworkLatency({
        success: false,
        data: null as any,
        message: 'Please enter your password.',
      }, 60);
    }

    // 4. Verify password against preconfigured credentials & common patterns
    const preconfigured = PRECONFIGURED_CREDENTIALS[cleanEmail] || [];
    const roleFallbackPassword = (matchedUser.role === 'Super Admin' || matchedUser.role === 'Admin')
      ? 'admin@inbox2025'
      : (matchedUser.role === 'Manager')
      ? 'manager@inbox2025'
      : 'sales@inbox2025';

    const validPasswords = new Set<string>([
      ...preconfigured,
      'demo1234',
      'inbox@2025',
      roleFallbackPassword,
      `${cleanEmail.split('@')[0]}@inbox2025`,
    ]);

    const isPasswordValid = validPasswords.has(cleanPassword);
    if (!isPasswordValid) {
      return simulateNetworkLatency({
        success: false,
        data: null as any,
        message: `Incorrect password for ${matchedUser.email}. Please verify your credentials and try again.`,
      }, 100);
    }

    // 5. Role validation for Administrator Portal tab
    if (targetRole === 'admin') {
      const hasAdminPrivilege = matchedUser.role === 'Super Admin' || matchedUser.role === 'Admin';
      if (!hasAdminPrivilege) {
        return simulateNetworkLatency({
          success: false,
          data: null as any,
          message: `Access denied: ${matchedUser.name} (${matchedUser.role}) does not have Administrator access. Please switch to the Staff / User Login tab.`,
        }, 100);
      }
    }

    // 6. Successful authentication: issue session token and persist
    const token = `inbox_jwt_${matchedUser.id}_${Date.now()}`;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matchedUser));
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    return simulateNetworkLatency({
      success: true,
      data: matchedUser,
      message: `Welcome back, ${matchedUser.name}! Signed in as ${matchedUser.role}.`,
    }, 100);
  },

  async logout(): Promise<ApiResponse<null>> {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    return simulateNetworkLatency({
      success: true,
      data: null,
      message: 'Logged out successfully',
    }, 50);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  async switchUser(userId: string): Promise<ApiResponse<User>> {
    const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, `inbox_jwt_${user.id}_${Date.now()}`);
    return simulateNetworkLatency({
      success: true,
      data: user,
      message: `Active session switched to ${user.name} (${user.role})`,
    }, 50);
  },

  async switchRole(role: Role): Promise<ApiResponse<User>> {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    let current = MOCK_USERS[0];
    if (stored) {
      try {
        current = JSON.parse(stored);
      } catch {
        // Fallback
      }
    }
    const updated: User = { ...current, role };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    return simulateNetworkLatency({
      success: true,
      data: updated,
      message: `Role switched to ${role}`,
    }, 50);
  },

  getPermissionsForRole(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  },

  hasPermission(role: Role, permission: Permission): boolean {
    const perms = this.getPermissionsForRole(role);
    return perms.includes(permission);
  },
};
