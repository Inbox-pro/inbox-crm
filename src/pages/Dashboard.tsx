import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Avatar } from '../components/common/Avatar';
import { mockDb } from '../mock/db';
import { reportsService, ReportsData } from '../services/reportsService';
import { tasksService } from '../services/tasksService';
import { activitiesService } from '../services/activitiesService';
import { leadsService } from '../services/leadsService';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Task, Activity, Lead } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30 Days');
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalOpenTasks, setTotalOpenTasks] = useState<number>(48);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topLeads, setTopLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, tPeriod, tStage, tActivityType, tStatus } = useLanguage();

  const kpiData = mockDb.getDashboardKpis(dateRange);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [repRes, tskRes, actRes, leadRes, allTasksRes, allLeadsRes] = await Promise.all([
          reportsService.getReportsData(dateRange),
          tasksService.getTasks({ dateRange }),
          activitiesService.getActivities({ dateRange }),
          leadsService.getLeads({ dateRange, sortBy: 'leadScore', sortOrder: 'desc', pageSize: 4 }),
          tasksService.getTasks(),
          leadsService.getLeads({ sortBy: 'leadScore', sortOrder: 'desc', pageSize: 4 }),
        ]);

        setReports(repRes.data);

        // Calculate total open tasks for board link
        const allOpen = allTasksRes.data.filter(t => t.status !== 'Completed');
        setTotalOpenTasks(allOpen.length || 48);

        // Upcoming Action Tasks: prioritize filtered tasks, supplement with all open tasks if < 3
        const filteredOpen = tskRes.data.filter(t => t.status !== 'Completed');
        let openToDisplay = filteredOpen;
        if (openToDisplay.length < 3) {
          const existingIds = new Set(openToDisplay.map(t => t.id));
          const extra = allOpen.filter(t => !existingIds.has(t.id));
          openToDisplay = [...openToDisplay, ...extra];
        }
        setTasks(openToDisplay.slice(0, 5));

        // High-Intent AI Leads: prioritize filtered leads, supplement with top AI scored leads so 4 are always visible
        let displayLeads = leadRes.data;
        if (!displayLeads || displayLeads.length < 4) {
          const fallback = allLeadsRes.data;
          const seen = new Set((displayLeads || []).map(l => l.id));
          const additions = fallback.filter(l => !seen.has(l.id));
          displayLeads = [...(displayLeads || []), ...additions];
        }
        setTopLeads(displayLeads.slice(0, 4));

        // Recent Activities
        let displayActs = actRes.data;
        if (!displayActs || displayActs.length === 0) {
          const allActs = await activitiesService.getActivities();
          displayActs = allActs.data;
        }
        setActivities(displayActs.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const handleToggleTask = async (taskId: string) => {
    try {
      await tasksService.toggleTaskComplete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast('Task marked as completed!');
    } catch {
      showToast('Failed to update task', 'error');
    }
  };

  const handleConvertLead = async (leadId: string, leadName: string) => {
    try {
      await leadsService.convertLead(leadId, { createDeal: true, dealValue: 800000 });
      showToast(`Lead ${leadName} converted to Contact & Deal!`);
      // Refresh top leads
      const refreshed = await leadsService.getLeads({ sortBy: 'leadScore', sortOrder: 'desc', pageSize: 4 });
      setTopLeads(refreshed.data);
    } catch {
      showToast('Error converting lead', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('dashboard.title', 'Executive CRM Dashboard')}
            </h1>
            <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
              {t('dashboard.live_badge', 'Live Real-Time')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('dashboard.subtitle', 'Real-time pipeline performance, conversion telemetry, and team activity.')}
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 text-xs shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {(['Today', '7 Days', '30 Days', '90 Days', 'This Year'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setDateRange(period)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  dateRange === period
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tPeriod(period)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <KpiCard
          id="kpi-total-leads"
          title={t('dashboard.total_leads', 'Total Leads')}
          value={kpiData.totalLeads.toLocaleString()}
          change={kpiData.leadGrowthPercent}
          icon={Users}
          iconBg="bg-blue-50 dark:bg-blue-950/50"
          iconColor="text-blue-600 dark:text-blue-400"
          onClick={() => navigate('/leads')}
        />
        <KpiCard
          id="kpi-new-leads"
          title={t('dashboard.new_inbound', 'New Inbound')}
          value={kpiData.newLeads}
          change={18.2}
          icon={Users}
          iconBg="bg-sky-50 dark:bg-sky-950/50"
          iconColor="text-sky-600 dark:text-sky-400"
          onClick={() => navigate('/leads?status=New')}
        />
        <KpiCard
          id="kpi-open-deals"
          title={t('dashboard.open_deals', 'Open Deals')}
          value={kpiData.openDeals}
          change={8.5}
          icon={Briefcase}
          iconBg="bg-purple-50 dark:bg-purple-950/50"
          iconColor="text-purple-600 dark:text-purple-400"
          onClick={() => navigate('/deals')}
        />
        <KpiCard
          id="kpi-pipeline-value"
          title={t('dashboard.pipeline_value', 'Pipeline Value')}
          value={kpiData.pipelineValueFormatted}
          change={12.4}
          icon={TrendingUp}
          iconBg="bg-indigo-50 dark:bg-indigo-950/50"
          iconColor="text-indigo-600 dark:text-indigo-400"
          onClick={() => navigate('/deals')}
        />
        <KpiCard
          id="kpi-won-revenue"
          title={t('dashboard.won_revenue', 'Won Revenue')}
          value={kpiData.wonRevenueFormatted}
          change={kpiData.revenueGrowthPercent}
          icon={DollarSign}
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
          onClick={() => navigate('/reports')}
        />
        <KpiCard
          id="kpi-conversion-rate"
          title={t('dashboard.conversion_rate', 'Win Rate')}
          value={`${kpiData.conversionRate}%`}
          change={3.2}
          icon={CheckCircle2}
          iconBg="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('dashboard.revenue_chart_title', 'Revenue Bookings vs Quota Target (₹ Lakhs)')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('dashboard.revenue_chart_subtitle', 'Monthly revenue closed against organizational quotas')}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              FY 2024-25
            </span>
          </div>

          <div className="h-72 w-full">
            {reports && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reports.revenueData.map(r => ({
                    month: r.month,
                    Actual: r.actual / 100000,
                    Target: r.target / 100000,
                    Pipeline: r.pipeline / 100000,
                  }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}L`}
                  />
                  <Tooltip
                    formatter={(val: number) => [`₹${val.toFixed(1)} Lakhs`]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t('dashboard.closed_won_legend', 'Closed Won (₹L)')} />
                  <Bar dataKey="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} name={t('dashboard.quota_target_legend', 'Quota Target (₹L)')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pipeline Distribution by Stage (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('dashboard.pipeline_overview', 'Pipeline Stages Breakdown')}
              </h2>
              <span className="text-xs text-blue-600 font-semibold cursor-pointer" onClick={() => navigate('/deals')}>
                {t('dashboard.view_pipeline', 'View Pipeline Board')} →
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {t('dashboard.pipeline_breakdown_desc', 'Deal volume and value across each milestone')}
            </p>

            <div className="space-y-3">
              {reports?.pipelineByStage.map((st) => (
                <div key={st.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {tStage(st.stage)} ({st.count})
                    </span>
                    <span className="text-slate-500 font-mono">
                      ₹{(st.value / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (st.value / 4280000) * 100)}%`,
                        backgroundColor: st.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">{t('dashboard.active_forecast', 'Active Weighted Win Forecast')}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ₹27.6 Lakhs (64.5%)
            </span>
          </div>
        </div>
      </div>

      {/* Grid: AI High Priority Leads + Upcoming Tasks + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top AI-Scored Leads */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('dashboard.high_intent_leads', 'High-Intent AI Leads')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {t('dashboard.view_leads', 'All Leads')} ({kpiData.totalLeads})
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topLeads.map((lead) => (
              <div key={lead.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {lead.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {lead.leadScore}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {lead.title} • {lead.companyName}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                    ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <StatusBadge status={lead.status} size="sm" />
                  {lead.status !== 'Converted' ? (
                    <button
                      type="button"
                      onClick={() => handleConvertLead(lead.id, lead.name)}
                      className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5"
                    >
                      {t('leads.convert', 'Convert')} <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-medium">{tStatus('Converted')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('dashboard.upcoming_tasks', 'Upcoming Action Tasks')}
            </h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {t('dashboard.view_tasks', 'View Board')} ({totalOpenTasks})
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => (
              <div key={task.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="mt-0.5 w-4 h-4 rounded border border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 flex items-center justify-center shrink-0 transition-colors"
                  aria-label="Complete task"
                />
                <div className="flex-1 truncate">
                  <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {task.relatedCompanyName} • {t('common.due', 'Due')} {task.dueDate}
                  </p>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('dashboard.recent_activities', 'Recent Activities')}
            </h2>
            <button
              onClick={() => navigate('/activities')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {t('dashboard.view_activities', 'View Timeline')}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((act) => (
              <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                <Avatar name={act.performedByName} size="xs" className="mt-0.5" />
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                      {act.performedByName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {tActivityType(act.type)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {act.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Leaderboard Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('dashboard.leaderboard_title', 'Sales Representative Performance Leaderboard')}
            </h2>
            <p className="text-xs text-slate-400">
              {t('dashboard.leaderboard_subtitle', 'Closed revenue, quota attainment, and individual win ratios')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {t('dashboard.full_analytics', 'Full Analytics')} →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 font-semibold">{t('reports.representative', 'Representative')}</th>
                <th className="pb-3 font-semibold">{t('reports.deals_closed', 'Deals Closed')}</th>
                <th className="pb-3 font-semibold">{t('reports.booked_revenue', 'Booked Revenue')}</th>
                <th className="pb-3 font-semibold">{t('reports.win_rate', 'Win Rate')}</th>
                <th className="pb-3 font-semibold">{t('reports.quota_attainment', 'Quota Attainment')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports?.repPerformance.map((rep, idx) => (
                <tr key={rep.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 flex items-center gap-2">
                    <span className="w-4 text-center font-bold text-slate-400 text-[11px]">
                      #{idx + 1}
                    </span>
                    <Avatar name={rep.name} size="xs" />
                    <span className="font-semibold text-slate-900 dark:text-white">{rep.name}</span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                    {rep.dealsWon} {t('reports.accounts', 'accounts')}
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white font-mono">
                    ₹{rep.revenueLakhs}L
                  </td>
                  <td className="py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {rep.winRate}%
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            rep.quotaAttainment >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, rep.quotaAttainment)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {rep.quotaAttainment}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
