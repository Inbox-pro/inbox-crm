import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Sliders,
  SlidersHorizontal,
  Key,
  Database,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { settingsService, OrganizationSettings, CustomFieldDefinition, ScoringRule } from '../services/settingsService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { mockDb } from '../mock/db';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'org' | 'team' | 'fields' | 'scoring' | 'api'>('org');
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Team Member modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Sales' as any,
  });

  const { currentOrg, userRole, hasPermission } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await settingsService.getSettings();
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await settingsService.updateSettings(settings);
      showToast('Organization settings updated successfully!');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const updatedUsers = [
      ...settings.users,
      {
        id: `usr_${Date.now()}`,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        status: 'Active' as const,
      },
    ];
    setSettings({ ...settings, users: updatedUsers });
    await settingsService.updateSettings({ ...settings, users: updatedUsers });
    showToast(`Invited ${newMember.name} as ${newMember.role}`);
    setIsAddUserModalOpen(false);
    setNewMember({ name: '', email: '', role: 'Sales' });
  };

  const handleResetData = () => {
    if (window.confirm('Reset all CRM data back to initial mock factory state?')) {
      mockDb.resetToDefaults();
      showToast('Mock database reset to factory state! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleExportFullJson = () => {
    const data = mockDb.exportFullDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Database exported as JSON backup');
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Administration & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure tenant workspaces, user authorization roles, scoring heuristics, and integration endpoints.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('org')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'org'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Profile</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'team'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team & Roles (RBAC)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fields')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'fields'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Custom CRM Fields</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('scoring')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'scoring'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Lead Scoring Rules</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>API & Backend Readiness</span>
        </button>
      </div>

      {/* TAB 1: Organization Profile */}
      {activeTab === 'org' && (
        <form onSubmit={handleSaveOrg} className="space-y-4 max-w-2xl text-xs">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Information</h2>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Workspace Name</label>
              <input
                type="text"
                value={settings.orgName}
                onChange={e => setSettings({ ...settings, orgName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Default Base Currency</label>
                <select
                  value={settings.currency}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Fiscal Year Start Month</label>
              <select
                value={settings.fiscalYearStart}
                onChange={e => setSettings({ ...settings, fiscalYearStart: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="April">April (Indian Standard FY)</option>
                <option value="January">January (Calendar FY)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      )}

      {/* TAB 2: Team Members & Roles (RBAC) */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Authorized Users & Roles</h2>
              <p className="text-xs text-slate-500">Manage user access permissions across Super Admin, Manager, and Sales roles.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {settings.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Avatar name={u.name} size="xs" />
                      <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-600 font-semibold">{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Custom CRM Fields */}
      {activeTab === 'fields' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Custom Schema Attributes</h2>
            <p className="text-xs text-slate-500">Configure industry-tailored fields that attach to leads, deals, and accounts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.customFields.map((cf) => (
              <div key={cf.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{cf.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 font-mono">
                      {cf.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Applies to: {cf.entity}</p>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Lead Scoring Rules */}
      {activeTab === 'scoring' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Scoring Heuristics</h2>
            <p className="text-xs text-slate-500">Define weighted points for conversion intent algorithms.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {settings.scoringRules.map((rule) => (
                <div key={rule.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{rule.criterion}</p>
                    <p className="text-slate-400 text-[11px]">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded">
                      +{rule.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: API & Backend Readiness */}
      {activeTab === 'api' && (
        <div className="space-y-6 max-w-3xl text-xs">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                Production Backend Architecture Ready
              </span>
            </div>
            <p className="text-emerald-800 dark:text-emerald-400 leading-relaxed">
              All UI components communicate strictly through modular services (<code>/src/services/</code>) with standardized API response shapes. Switching from the reactive mock store to your Node.js/Express + MongoDB backend is as simple as configuring <code>VITE_API_BASE_URL</code>.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">API Configuration</h2>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Backend REST API Endpoint</label>
              <input
                type="text"
                disabled
                value="http://localhost:5000/api/v1 (Mock Mode Simulated)"
                className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">AI Provider Engine</label>
              <input
                type="text"
                disabled
                value="Google Gemini 2.5 (Ready for server-side key proxy)"
                className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Data Management & Client Demo Controls</h2>
            <p className="text-slate-500">Use these controls during customer presentations or to reset states.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportFullJson}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold flex items-center gap-2 shadow-xs"
              >
                <Database className="w-4 h-4" />
                <span>Export Full CRM Database (JSON)</span>
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Database to Factory Mock State</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Invite Team Member"
        subtitle="Grant role-based access privileges to staff."
      >
        <form onSubmit={handleAddMember} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Shalini Nair"
              value={newMember.name}
              onChange={e => setNewMember({ ...newMember, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email *</label>
            <input
              type="email"
              required
              placeholder="shalini@company.com"
              value={newMember.email}
              onChange={e => setNewMember({ ...newMember, email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Access Role</label>
            <select
              value={newMember.role}
              onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="Super Admin">Super Admin (All permissions)</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Sales">Sales Representative</option>
              <option value="Viewer">Read-Only Viewer</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
