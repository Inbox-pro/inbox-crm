import React, { useState, useEffect } from 'react';
import {
  Plus,
  Phone,
  Mail,
  Users2,
  Tv,
  FileText,
  Calendar,
  Building2,
  Download,
  RefreshCw,
} from 'lucide-react';
import { activitiesService, ActivityFilterParams } from '../services/activitiesService';
import { Activity, ActivityType } from '../types';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const Activities: React.FC = () => {
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | ActivityType>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    type: 'Call' as ActivityType,
    description: '',
    companyName: '',
  });

  const { showToast } = useToast();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await activitiesService.getActivities({
        search,
        type: typeFilter,
        page: currentPage,
        pageSize,
      });
      setActivities(res.data);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showToast('Failed to load activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [search, typeFilter, currentPage, pageSize]);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await activitiesService.createActivity({
        title: newActivity.title,
        type: newActivity.type,
        description: newActivity.description || 'Logged via touchpoints console.',
        performedById: 'usr_3',
        performedByName: 'Vikramaditya Rao',
        occurredAt: new Date().toISOString(),
        relatedCompanyName: newActivity.companyName || 'Enterprise Account',
      });
      showToast('Activity logged successfully');
      setIsAddModalOpen(false);
      setNewActivity({ title: '', type: 'Call', description: '', companyName: '' });
      fetchActivities();
    } catch {
      showToast('Failed to log activity', 'error');
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Meeting':
        return <Users2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Demo':
        return <Tv className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('activities.title', 'Activity Stream & Audit Log')}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {total} {t('common.details', 'touchpoints')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('activities.subtitle', 'Complete chronology of calls, emails, product demos, meetings, and internal notes.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('activities.log_activity', 'Log Activity')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder={t('common.search', 'Search activity notes, accounts, reps...')} />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="All">All Types</option>
            <option value="Call">Calls</option>
            <option value="Email">Emails</option>
            <option value="Meeting">Meetings</option>
            <option value="Demo">Product Demos</option>
            <option value="Note">Notes</option>
            <option value="Follow-up">Follow-ups</option>
          </select>
          <button
            type="button"
            onClick={fetchActivities}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSkeleton count={pageSize} />
        ) : activities.length === 0 ? (
          <EmptyState
            title="No activity records found"
            description="No logs match your filter criteria. Log an activity to begin building an audit history."
            actionLabel="Log Activity"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                  {getActivityIcon(act.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {act.title}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {act.type}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {new Date(act.occurredAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                    {act.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                      <Avatar name={act.performedByName} size="xs" />
                      <span>{act.performedByName}</span>
                    </div>

                    {act.relatedCompanyName && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{act.relatedCompanyName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Touchpoint Activity"
        subtitle="Log communications and meeting notes for account history."
      >
        <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Type</label>
              <select
                value={newActivity.type}
                onChange={e => setNewActivity({ ...newActivity, type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Call">Phone Call</option>
                <option value="Email">Email Communication</option>
                <option value="Meeting">In-Person / Virtual Meeting</option>
                <option value="Demo">Product Demonstration</option>
                <option value="Note">Internal Note</option>
                <option value="Follow-up">Account Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Account</label>
              <input
                type="text"
                placeholder="e.g. Reliance Retail"
                value={newActivity.companyName}
                onChange={e => setNewActivity({ ...newActivity, companyName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Subject / Summary *</label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise Security Architecture Review"
              value={newActivity.title}
              onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Discussion Notes</label>
            <textarea
              rows={4}
              placeholder="Key decisions, client objections, next action items..."
              value={newActivity.description}
              onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Log Touchpoint
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
