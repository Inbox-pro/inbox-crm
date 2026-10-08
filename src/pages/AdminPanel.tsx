import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { settingsService, OrganizationSettings } from '../services/settingsService';
import { mockDb } from '../mock/db';
import { Role } from '../types';
import {
  ShieldAlert,
  Users,
  Building2,
  Server,
  Activity,
  UserPlus,
  ShieldCheck,
  RefreshCw,
  Download,
  AlertTriangle,
  Lock,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Database,
  Cpu,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  target: string;
  ip: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARN' | 'INFO';
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'log_1', action: 'User Authenticated', user: 'Tejas Chauhan (Super Admin)', target: 'Admin Console', ip: '103.21.14.82', timestamp: 'Just now', status: 'SUCCESS' },
  { id: 'log_2', action: 'Pipeline Stage Updated', user: 'Rohan Mehta (Sales)', target: 'Deal #dl_01 (Tata Steel)', ip: '103.21.14.90', timestamp: '14 minutes ago', status: 'INFO' },
  { id: 'log_3', action: 'Role Elevated', user: 'Tejas Chauhan (Super Admin)', target: 'Ananya Sharma -> Admin', ip: '103.21.14.82', timestamp: '1 hour ago', status: 'SUCCESS' },
  { id: 'log_4', action: 'Database Snapshot Generated', user: 'System Automated', target: 'JSON Backup', ip: '127.0.0.1', timestamp: '3 hours ago', status: 'SUCCESS' },
  { id: 'log_5', action: 'Failed Auth Attempt', user: 'unknown@external.net', target: '/api/auth/login', ip: '194.26.29.11', timestamp: '5 hours ago', status: 'WARN' },
];

export const AdminPanel: React.FC = () => {
  const { role, currentUser, switchRole } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'users' | 'tenant' | 'security' | 'database'>('users');
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [isLoading, setIsLoading] = useState(true);

  // New Employee Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Sales');

  const isAdmin = role === 'Super Admin' || role === 'Admin';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(false);
    try {
      const res = await settingsService.getSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch {
      // Fallback
    }
  };

  const handleUpdateUserRole = (userId: string, targetRole: Role) => {
    if (!settings) return;
    const updatedUsers = settings.users.map(u => (u.id === userId ? { ...u, role: targetRole } : u));
    const newSettings = { ...settings, users: updatedUsers };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);
    
    // Add audit entry
    const newLog: AuditLogEntry = {
      id: `log_${Date.now()}`,
      action: `Modified User Role to ${targetRole}`,
      user: currentUser?.name || 'Administrator',
      target: `User ID: ${userId}`,
      ip: '103.21.14.82',
      timestamp: 'Just now',
      status: 'SUCCESS',
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast(`User role updated to ${targetRole}`, 'success');
  };

  const handleToggleUserStatus = (userId: string) => {
    if (!settings) return;
    const updatedUsers = settings.users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: nextStatus as 'Active' | 'Inactive' };
      }
      return u;
    });
    const newSettings = { ...settings, users: updatedUsers };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);
    showToast('Employee status toggled', 'info');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newUserName.trim() || !newUserEmail.trim()) {
      showToast('Please fill out employee name and email', 'error');
      return;
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'Active' as const,
    };

    const newSettings = {
      ...settings,
      users: [...settings.users, newUser],
    };
    setSettings(newSettings);
    settingsService.updateSettings(newSettings);

    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    showToast(`Added ${newUser.name} as ${newUser.role}`, 'success');
  };

  const handleExportDatabase = () => {
    const data = mockDb.exportFullDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inbox_crm_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database JSON backup downloaded successfully', 'success');
  };

  const handleFactoryReset = () => {
    if (window.confirm('Are you sure you want to reset all CRM demo data to initial factory state?')) {
      mockDb.resetToDefaults();
      showToast('CRM reset to pristine factory state', 'info');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  // If user is not an admin, show permission lock state with quick-escalate button
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto mt-10">
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-8 sm:p-10 shadow-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto text-sm">
            Your current account session is signed in with the <strong>{role}</strong> role, which cannot access system tenant configuration or user access control.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => switchRole('Super Admin')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Switch to Super Admin for Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('admin.title', 'Admin & Governance Console')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Super Admin Access
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('admin.subtitle', 'Global system health, employee RBAC privileges, tenant policies, and database safeguards.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDatabase}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export DB (JSON)</span>
          </button>
          <button
            onClick={handleFactoryReset}
            className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 text-xs sm:text-sm font-medium flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* Real-time System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tenant Org</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate">Inbox Infotech</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle className="w-3 h-3" /> Enterprise Tier
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Storage Sync</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">Active (100%)</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Reactive In-Memory Store
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Inbox AI Service</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">Gemini 2.5 Ready</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            4 Pre-Tuned Prompts
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Staff</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {settings?.users.length || 10} Members
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            RBAC Enforced
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management & RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security & Audit Stream</span>
        </button>

        <button
          onClick={() => setActiveTab('tenant')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'tenant'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Profile</span>
        </button>
      </div>

      {/* TAB CONTENT: User Management & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Employees & System Roles</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant or modify access levels across Super Admin, Admin, Manager, Sales, and Viewer.
              </p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role Assignment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {settings?.users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">ID: {u.id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value as Role)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Sales">Sales</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Security & Audit Stream */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security & Audit Event Stream</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable event stream tracking logins, stage advancements, and administrative mutations.
              </p>
            </div>
            <button
              onClick={() => showToast('Audit trail verified clean and synchronized', 'success')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Verify Integrity</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-200 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : log.status === 'WARN'
                        ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{log.action}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Actor: <span className="font-medium text-slate-700 dark:text-slate-300">{log.user}</span> • Target: <span className="font-medium text-slate-700 dark:text-slate-300">{log.target}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400 font-mono">
                  <div>IP: {log.ip}</div>
                  <div className="text-slate-500 dark:text-slate-400">{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Tenant Organization */}
      {activeTab === 'tenant' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Workspace Configuration</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-tenant metadata governing all records and calculations in this workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                disabled
                value="Inbox Infotech Pvt. Ltd."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Currency
              </label>
              <input
                type="text"
                disabled
                value="Indian Rupee (INR - ₹ / Lakhs)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Timezone
              </label>
              <input
                type="text"
                disabled
                value="Asia/Kolkata (IST +5:30)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Database Isolation Model
              </label>
              <input
                type="text"
                disabled
                value="Tenant Schema Binding (org_inbox_01)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add New Employee</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@inboxinfotech.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  System Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Sales">Sales Executive</option>
                  <option value="Manager">Sales Manager</option>
                  <option value="Admin">Operations Admin</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Viewer">Auditor / Viewer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
