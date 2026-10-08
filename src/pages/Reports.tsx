import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Award,
  Users,
  Target,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { reportsService, ReportsData } from '../services/reportsService';
import { Avatar } from '../components/common/Avatar';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<'Today' | '7 Days' | '30 Days' | '90 Days' | 'This Year'>('30 Days');
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportsService.getReportsData(dateRange);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading analytics reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const handleExportSummary = () => {
    if (!data) return;
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Active Pipeline', `₹${data.summary.totalPipelineLakhs} Lakhs`],
      ['Won Revenue Booked', `₹${data.summary.wonRevenueLakhs} Lakhs`],
      ['Average Deal Cycle', `${data.summary.averageSalesCycleDays} Days`],
      ['Win Conversion Rate', `${data.summary.winRatePercent}%`],
      ['Total Deals Count', `${data.summary.totalDealsCount}`],
      [],
      ['Representative', 'Deals Won', 'Revenue (Lakhs)', 'Win Rate (%)', 'Quota Attainment (%)'],
      ...data.repPerformance.map(r => [r.name, r.dealsWon, r.revenueLakhs, r.winRate, r.quotaAttainment]),
      [],
      ['Pipeline Stage', 'Count', 'Value (Lakhs)'],
      ...data.pipelineByStage.map(s => [s.stage, s.count, s.valueLakhs]),
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inbox_crm_analytics_report_${dateRange.toLowerCase().replace(' ', '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Inbox CRM Executive Report exported successfully!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('reports.title', 'Revenue & Pipeline Intelligence')}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              Analytics BI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('reports.subtitle', 'Executive revenue analytics, conversion funnels, quota attainment, and lead acquisition attribution.')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs shadow-xs">
            {(['Today', '7 Days', '30 Days', '90 Days', 'This Year'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setDateRange(period)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                  dateRange === period
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchReports}
            className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('reports.export_pdf', 'Export CSV')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Booked Closed Won</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            ₹{data?.summary.wonRevenueLakhs ?? 18.4} Lakhs
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.8% vs prior period</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pipeline</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            ₹{data?.summary.totalPipelineLakhs ?? 42.8} Lakhs
          </p>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1.5">
            <span>{data?.summary.totalDealsCount ?? 30} Qualified Deals</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Win Conversion Ratio</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {data?.summary.winRatePercent ?? 23.6}%
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Top tier SaaS benchmark</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Sales Cycle</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {data?.summary.averageSalesCycleDays ?? 34} Days
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5">
            <span>6 days faster velocity</span>
          </div>
        </div>
      </div>

      {/* Row 1: Monthly Bookings vs Target AND Lead Acquisition Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Bookings Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Revenue Bookings vs Quota Target (₹ Lakhs)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Actual won revenue generated vs executive quota targets and total open pipeline
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {data?.revenueData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.revenueData.map(r => ({
                    month: r.month,
                    Actual: Math.round((r.actual / 100000) * 10) / 10,
                    Target: Math.round((r.target / 100000) * 10) / 10,
                    Pipeline: Math.round((r.pipeline / 100000) * 10) / 10,
                  }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={v => `₹${v}L`} />
                  <Tooltip
                    formatter={(val: number) => [`₹${val.toFixed(1)} Lakhs`]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Actual" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Actual Won" />
                  <Bar dataKey="Target" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Quota Target" />
                  <Bar dataKey="Pipeline" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Open Pipeline" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Loading revenue telemetry...
              </div>
            )}
          </div>
        </div>

        {/* Lead Acquisition Attribution (Donut Chart) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5">
              Lead Acquisition Attribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Volume breakdown across marketing channels</p>

            <div className="h-52 w-full relative">
              {data?.leadSources && data.leadSources.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.leadSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                    >
                      {data.leadSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} Inbound Leads`]}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading lead sources...
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {(data?.leadSources || []).map((s, idx) => (
                <div key={s.name || idx} className="flex items-center gap-1.5 text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color || PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{s.name}</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Pipeline Value by Stage & Inbound Lead Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Value by Stage */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Deal Pipeline by Stage Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active opportunity volume and monetary value across pipeline milestones
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {data?.pipelineByStage ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.pipelineByStage}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={v => `₹${v}L`} />
                  <Tooltip
                    formatter={(val: number) => [`₹${val} Lakhs`]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="valueLakhs" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Value (Lakhs)">
                    {data.pipelineByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            {(data?.pipelineByStage || []).map((st) => (
              <div key={st.stage} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{st.stage}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">{st.count} deals</div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold font-mono">₹{st.valueLakhs}L</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Growth Trend Area Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Inbound Lead Generation & Qualification Velocity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monthly total inbound leads vs sales qualified opportunities
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {data?.leadGrowth ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.leadGrowth}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="qualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#leadGrad)"
                    name="Total Inbound Leads"
                  />
                  <Area
                    type="monotone"
                    dataKey="qualified"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#qualGrad)"
                    name="Qualified Opportunities"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Current Qualification Rate:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 43.8% Inbound to SQL Conversion
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Sales Rep Quota Performance Leaderboard */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Sales Representative Quota Attainment & Contribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Individual performance metrics, deals won, revenue closed, and quota attainment
            </p>
          </div>
          <span className="text-xs text-slate-400">Target: ₹40 Lakhs / Quarter</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3.5 px-3">Rank & Sales Executive</th>
                <th className="pb-3.5 px-3">Deals Won</th>
                <th className="pb-3.5 px-3">Closed Revenue</th>
                <th className="pb-3.5 px-3">Win Ratio</th>
                <th className="pb-3.5 px-3">Quota Attainment</th>
                <th className="pb-3.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.repPerformance || []).map((rep, idx) => (
                <tr key={rep.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-slate-400 text-xs">
                      #{idx + 1}
                    </span>
                    <Avatar name={rep.name} size="sm" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{rep.name}</p>
                      <p className="text-slate-400 text-[11px]">Senior Account Executive</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {rep.dealsWon} accounts
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white font-mono">
                    ₹{rep.revenueLakhs} Lakhs
                  </td>
                  <td className="py-3 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {rep.winRate}%
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-28 sm:w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            rep.quotaAttainment >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, rep.quotaAttainment)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {rep.quotaAttainment}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rep.quotaAttainment >= 100
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}
                    >
                      {rep.quotaAttainment >= 100 ? 'Quota Exceeded' : 'On Pace'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Full Enterprise Sales Funnel Conversion Stage Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Full-Cycle Sales Conversion Funnel & Stage Drop-Off
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Efficiency metrics at every progression stage from initial inbound contact to signed enterprise agreement
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(data?.salesFunnel || []).map((step, idx) => (
            <div
              key={step.stage}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Stage {idx + 1}
                </span>
                <p className="font-semibold text-slate-900 dark:text-white text-xs mt-1 line-clamp-2">
                  {step.stage}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                  {step.count}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Conv: <strong className="text-emerald-600 dark:text-emerald-400">{step.conversion}</strong></span>
                  {step.dropoff !== '-' && (
                    <span className="text-slate-400">Drop: {step.dropoff}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
