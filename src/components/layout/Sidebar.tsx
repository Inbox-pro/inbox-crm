import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  Kanban,
  CheckSquare,
  History,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { InboxLogo } from '../common/InboxLogo';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentOrg, role } = useAuth();
  const { t, tRole } = useLanguage();

  const isAdmin = role === 'Super Admin' || role === 'Admin';

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { to: '/leads', label: t('nav.leads', 'Leads'), icon: Users, badge: '105' },
    { to: '/contacts', label: t('nav.contacts', 'Contacts'), icon: Contact },
    { to: '/companies', label: t('nav.companies', 'Companies'), icon: Building2 },
    { to: '/deals', label: t('nav.deals', 'Deals & Pipeline'), icon: Kanban, badge: '30' },
    { to: '/tasks', label: t('nav.tasks', 'Tasks'), icon: CheckSquare, badge: '52' },
    { to: '/activities', label: t('nav.activities', 'Activities'), icon: History },
    { to: '/reports', label: t('nav.reports', 'Reports & Analytics'), icon: BarChart3 },
    { to: '/ai-assistant', label: t('nav.ai', 'Inbox AI Assistant'), icon: Bot, isAi: true },
    { to: '/admin', label: t('nav.admin', 'Admin Panel'), icon: ShieldAlert, isAdminOnly: true },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: Settings },
  ];

  return (
    <aside
      id="app-sidebar"
      className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header with official Inbox Infotech Logo */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {!collapsed ? (
          <div className="flex items-center overflow-hidden">
            <InboxLogo size="sm" crmBadge={true} />
          </div>
        ) : (
          <div className="mx-auto">
            <InboxLogo size="sm" showText={false} />
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors ${
            collapsed ? 'mx-auto mt-1' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={`nav-link-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group relative ${
                  isActive
                    ? item.isAi
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold'
                      : item.isAdminOnly
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold'
                      : 'bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  item.isAi
                    ? 'text-blue-600 dark:text-blue-400'
                    : item.isAdminOnly
                    ? 'text-purple-600 dark:text-purple-400'
                    : ''
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.isAi && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                      AI
                    </span>
                  )}
                  {item.isAdminOnly && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      Admin
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role & Multi-Tenant Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('nav.rbac_role', 'RBAC Role')}: {tRole(role)}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Inbox Infotech • {currentOrg?.plan || 'Enterprise'} {t('nav.tier_enterprise', 'Tier')}
            </p>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500" title={`${t('nav.rbac_role', 'RBAC Role')}: ${tRole(role)}`}>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
