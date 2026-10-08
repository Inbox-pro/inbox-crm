import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Bell,
  Sparkles,
  ChevronDown,
  Building2,
  Shield,
  LogOut,
  UserPlus,
  Briefcase,
  CheckSquare,
  History,
  Command,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { Avatar } from '../common/Avatar';
import { Role } from '../../types';
import { useNavigate } from 'react-router-dom';

interface TopNavProps {
  onOpenDemoGuide?: () => void;
  onQuickAction: (type: 'lead' | 'deal' | 'task' | 'activity') => void;
  collapsed: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onQuickAction,
  collapsed,
}) => {
  const { currentUser, currentOrg, organizations, role, switchRole, switchOrganization, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, tRole } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const orgRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) setShowOrgMenu(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleMenu(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setShowQuickMenu(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const roles: Role[] = ['Super Admin', 'Admin', 'Manager', 'Sales', 'Viewer'];

  return (
    <header
      id="app-header"
      className={`h-16 fixed top-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 px-4 flex items-center justify-between gap-4 ${
        collapsed ? 'left-18' : 'left-64'
      }`}
    >
      {/* Global Search */}
      <form onSubmit={handleGlobalSearch} className="flex-1 max-w-md hidden sm:block relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder={t('header.search_placeholder', 'Search leads, deals, contacts... (Press ↵)')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        <div className="absolute right-2.5 top-2 hidden md:flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </form>

      {/* Action Controls & Navigation Items */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Menu */}
        <div ref={quickRef} className="relative">
          <button
            id="btn-quick-add"
            type="button"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('header.new_record', 'New Record')}</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  onQuickAction('lead');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>{t('header.new_lead', 'New Lead')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  onQuickAction('deal');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
              >
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>{t('header.new_deal', 'New Opportunity / Deal')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  onQuickAction('task');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
              >
                <CheckSquare className="w-4 h-4 text-purple-600" />
                <span>{t('header.new_task', 'New Task')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  onQuickAction('activity');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
              >
                <History className="w-4 h-4 text-amber-600" />
                <span>{t('header.log_activity', 'Log Activity')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Multi-Tenant Workspace Switcher */}
        <div ref={orgRef} className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={t('header.switch_tenant', 'Switch Tenant Workspace')}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium max-w-[110px] truncate">{currentOrg?.name || t('header.tenant', 'Tenant')}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showOrgMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('header.select_tenant', 'Select Tenant Workspace')}
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    setShowOrgMenu(false);
                    switchOrganization(org.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    org.id === currentOrg?.id ? 'font-semibold text-blue-600 bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <p className="truncate">{org.name}</p>
                    <p className="text-[10px] text-slate-400">{org.industry}</p>
                  </div>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {org.plan}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RBAC Role Switcher (Crucial for Demo) */}
        <div ref={roleRef} className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
            title={t('header.switch_role_title', 'Switch Demo User Role')}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{tRole(role)}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('header.simulate_role', 'Simulate Role (RBAC)')}
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setShowRoleMenu(false);
                    switchRole(r);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    r === role ? 'font-semibold text-blue-600 bg-blue-50/50 dark:bg-blue-950/30' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{tRole(r)}</span>
                  {r === role && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Selector (GER, ENG, DUT) */}
        <LanguageSelector />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white">{t('header.notifications', 'Notifications')}</span>
                <span className="text-[10px] text-blue-600 font-medium cursor-pointer">{t('header.mark_all_read', 'Mark all as read')}</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
                <div className="py-2.5">
                  <p className="font-medium text-slate-900 dark:text-white">New high-priority lead scored 92/100</p>
                  <p className="text-slate-500 mt-0.5">Gaurav Bhasin from OmniRetail visited the pricing calculator.</p>
                  <span className="text-[10px] text-slate-400">10 mins ago</span>
                </div>
                <div className="py-2.5">
                  <p className="font-medium text-slate-900 dark:text-white">Deal stage progressed to Negotiation</p>
                  <p className="text-slate-500 mt-0.5">ABC Technologies - CRM Implementation moved by Vikramaditya.</p>
                  <span className="text-[10px] text-slate-400">1 hour ago</span>
                </div>
                <div className="py-2.5">
                  <p className="font-medium text-slate-900 dark:text-white">Task Due Today</p>
                  <p className="text-slate-500 mt-0.5">Schedule executive architectural demo with Rajesh Kulkarni.</p>
                  <span className="text-[10px] text-slate-400">3 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all"
          >
            <Avatar name={currentUser?.name || 'User'} size="sm" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">{currentUser?.name}</p>
                <p className="text-slate-500 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  {tRole(currentUser?.role || role)}
                </span>
              </div>
              <div className="pt-1">
                {(role === 'Super Admin' || role === 'Admin') && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/admin');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg text-left font-semibold"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t('header.admin_console', 'Admin Console')}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t('header.workspace_settings', 'Workspace Settings')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('header.sign_out', 'Sign Out / Switch User')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
