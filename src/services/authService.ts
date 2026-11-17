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
  /**
   * Retrieves the currently authenticated user.
   * Validates the JWT with the backend /api/auth/me endpoint.
   */
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const stored = localStorage.getItem(AUTH_USER_KEY);

    if (!token) {
      return {
        success: false,
        data: null,
      };
    }

    try {
      // Validate token with live backend
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.data));
          return {
            success: true,
            data: payload.data,
            message: payload.message,
          };
        }
      }

      // If token expired (401), clear local session
      if (res.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        return {
          success: false,
          data: null,
          message: 'Session expired',
        };
      }
    } catch {
      // Network error (backend offline): gracefully fallback to cached user
    }

    // Local cached session fallback
    if (stored) {
      try {
        const user = JSON.parse(stored);
        return simulateNetworkLatency({
          success: true,
          data: user,
        }, 30);
      } catch {
        // Corrupted storage
      }
    }

    return {
      success: false,
      data: null,
    };
  },

  /**
   * Logs in a user by calling /api/auth/login.
   * Obtains and stores a signed JWT and user session.
   */
  async login(
    email: string,
    password?: string,
    targetRole?: 'admin' | 'user' | Role
  ): Promise<ApiResponse<User>> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return {
        success: false,
        data: null as any,
        message: 'Please enter your work email address.',
      };
    }

    if (!cleanPassword) {
      return {
        success: false,
        data: null as any,
        message: 'Please enter your password.',
      };
    }

    try {
      // Attempt backend login via Express API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          targetRole,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.data.user));
        return {
          success: true,
          data: data.data.user,
          message: data.message,
        };
      } else {
        return {
          success: false,
          data: null as any,
          message: data.message || 'Authentication failed. Please verify credentials.',
        };
      }
    } catch {
      // Offline fallback: verify against preconfigured accounts and local users
      console.warn('Backend API unreachable. Falling back to local verification.');
      return this.localLoginFallback(cleanEmail, cleanPassword, targetRole);
    }
  },

  /**
   * Register a new user via /api/auth/register.
   */
  async register(
    data: {
      name: string;
      email: string;
      password: string;
      role?: Role;
      department?: string;
    },
    options: { autoLogin?: boolean } = { autoLogin: true }
  ): Promise<ApiResponse<User>> {
    const autoLogin = options.autoLogin !== false;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json();
      if (res.ok && body.success && body.data?.user) {
        if (autoLogin && body.data.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, body.data.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(body.data.user));
        }
        return {
          success: true,
          data: body.data.user,
          message: body.message,
        };
      }

      const errMsg = body.errors && Array.isArray(body.errors) && body.errors.length > 0
        ? body.errors.map((e: any) => e.message).join(' ')
        : body.message || 'Registration failed.';

      return {
        success: false,
        data: null as any,
        message: errMsg,
      };
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        message: err.message || 'Unable to reach authentication server. Please ensure backend server is running.',
      };
    }
  },

  /**
   * Offline authentication fallback when backend server is not active.
   */
  localLoginFallback(
    email: string,
    password: string,
    targetRole?: 'admin' | 'user' | Role
  ): Promise<ApiResponse<User>> {
    const matchedUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email);
    if (!matchedUser) {
      return simulateNetworkLatency({
        success: false,
        data: null as any,
        message: `No registered account found for "${email}".`,
      }, 80);
    }

    const preconfigured = PRECONFIGURED_CREDENTIALS[email] || [];
    const validPasswords = new Set<string>([
      ...preconfigured,
      'demo1234',
      'inbox@2025',
      'admin@inbox2025',
      'sales@inbox2025',
      'manager@inbox2025',
    ]);

    if (!validPasswords.has(password)) {
      return simulateNetworkLatency({
        success: false,
        data: null as any,
        message: `Incorrect password for ${matchedUser.email}.`,
      }, 80);
    }

    if (targetRole === 'admin' && matchedUser.role !== 'Super Admin' && matchedUser.role !== 'Admin') {
      return simulateNetworkLatency({
        success: false,
        data: null as any,
        message: `Access denied: ${matchedUser.name} (${matchedUser.role}) does not have Administrator privileges.`,
      }, 80);
    }

    const token = `inbox_jwt_${matchedUser.id}_${Date.now()}`;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matchedUser));
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    return simulateNetworkLatency({
      success: true,
      data: matchedUser,
      message: `Welcome back, ${matchedUser.name}! Signed in as ${matchedUser.role}.`,
    }, 80);
  },

  async logout(): Promise<ApiResponse<null>> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network errors on logout
      }
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    return {
      success: true,
      data: null,
      message: 'Logged out successfully',
    };
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Fetch all registered organization users from backend API.
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    const token = this.getToken();
    if (token) {
      try {
        const res = await fetch('/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            return data;
          }
        }
      } catch {
        // Fallback to local
      }
    }
    return {
      success: true,
      data: MOCK_USERS,
      meta: { total: MOCK_USERS.length },
    };
  },

  async switchUser(userId: string): Promise<ApiResponse<User>> {
    const user = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];
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
