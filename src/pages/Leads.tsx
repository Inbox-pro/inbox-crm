import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  Sparkles,
  MoreVertical,
  Eye,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { leadsService, LeadFilterParams } from '../services/leadsService';
import { Lead, LeadStatus, LeadSource } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import { Pagination } from '../components/common/Pagination';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Leads: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = (searchParams.get('status') as LeadStatus) || 'All';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>(initialStatus);
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'All'>('All');
  const [minScore, setMinScore] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<keyof Lead>('leadScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection & Detail state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  // Convert Lead Modal state
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertTargetLead, setConvertTargetLead] = useState<Lead | null>(null);
  const [createDealOption, setCreateDealOption] = useState(true);
  const [convertDealName, setConvertDealName] = useState('');
  const [convertDealValue, setConvertDealValue] = useState<number>(800000);

  // Add Form state
  const [newLead, setNewLead] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    title: '',
    source: 'Website' as LeadSource,
    estimatedValue: 600000,
  });

  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await leadsService.getLeads({
        search,
        status: statusFilter,
        source: sourceFilter,
        minScore: minScore > 0 ? minScore : undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        pageSize,
      });
      setLeads(res.data);
      setTotalLeads(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showToast('Error loading leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, sourceFilter, minScore, currentPage, pageSize, sortBy, sortOrder]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(leads.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leadsService.createLead({
        name: newLead.name,
        companyName: newLead.companyName,
        email: newLead.email,
        phone: newLead.phone || '+91 98765 43210',
        title: newLead.title || 'Decision Maker',
        source: newLead.source,
        status: 'New',
        leadScore: 75,
        estimatedValue: Number(newLead.estimatedValue),
        ownerId: 'usr_3',
        ownerName: 'Vikramaditya Rao',
        lastContactedAt: new Date().toISOString(),
      });
      showToast('Lead created successfully!');
      setIsAddModalOpen(false);
      setNewLead({ name: '', companyName: '', email: '', phone: '', title: '', source: 'Website', estimatedValue: 600000 });
      fetchLeads();
    } catch {
      showToast('Failed to create lead', 'error');
    }
  };

  const handleConvertLead = async () => {
    if (!convertTargetLead) return;
    try {
      await leadsService.convertLead(convertTargetLead.id, {
        createDeal: createDealOption,
        dealName: convertDealName || `${convertTargetLead.companyName} CRM Expansion`,
        dealValue: convertDealValue,
      });
      showToast(`Lead ${convertTargetLead.name} successfully converted!`);
      setIsConvertModalOpen(false);
      setConvertTargetLead(null);
      fetchLeads();
      if (activeLead?.id === convertTargetLead.id) {
        setIsDetailOpen(false);
      }
    } catch {
      showToast('Failed to convert lead', 'error');
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      if (leadToDelete) {
        await leadsService.deleteLead(leadToDelete);
        showToast('Lead deleted successfully');
        setLeadToDelete(null);
      } else if (selectedIds.length > 0) {
        await leadsService.bulkDelete(selectedIds);
        showToast(`Deleted ${selectedIds.length} leads`);
        setSelectedIds([]);
      }
      setIsConfirmDeleteOpen(false);
      fetchLeads();
    } catch {
      showToast('Failed to delete leads', 'error');
    }
  };

  const handleBulkStatusChange = async (status: LeadStatus) => {
    try {
      await leadsService.bulkUpdateStatus(selectedIds, status);
      showToast(`Updated ${selectedIds.length} leads to ${status}`);
      setSelectedIds([]);
      fetchLeads();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Name,Company,Email,Phone,Title,Status,Source,Score,EstimatedValue'];
    const rows = leads.map(l =>
      `"${l.name}","${l.companyName}","${l.email}","${l.phone}","${l.title || ''}","${l.status}","${l.source}",${l.leadScore},${l.estimatedValue}`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported leads to CSV');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Leads Management
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalLeads} records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture, score, qualify, and convert prospective accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          {hasPermission('leads.create') && (
            <button
              id="btn-new-lead"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search leads by name, company, email..." />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Unqualified">Unqualified</option>
            <option value="Converted">Converted</option>
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="All">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Advertisement">Advertisement</option>
            <option value="Cold Call">Cold Call</option>
          </select>

          {/* AI Score Filter */}
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value={0}>All Scores</option>
            <option value={80}>AI Score &gt; 80 (Hot)</option>
            <option value={60}>AI Score &gt; 60 (Warm)</option>
          </select>

          <button
            type="button"
            onClick={fetchLeads}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-900 dark:text-blue-200">
              {selectedIds.length} leads selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Bulk Update Status:</span>
            <button
              onClick={() => handleBulkStatusChange('Contacted')}
              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded text-slate-700 dark:text-slate-300 font-medium"
            >
              Contacted
            </button>
            <button
              onClick={() => handleBulkStatusChange('Qualified')}
              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 rounded text-slate-700 dark:text-slate-300 font-medium"
            >
              Qualified
            </button>
            {hasPermission('leads.delete') && (
              <button
                onClick={() => {
                  setLeadToDelete(null);
                  setIsConfirmDeleteOpen(true);
                }}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Leads Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSkeleton count={pageSize} />
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads match current filters"
            description="Try adjusting your search query, status filters, or score threshold."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setStatusFilter('All');
              setSourceFilter('All');
              setMinScore(0);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === leads.length && leads.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => {
                      if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('name'); setSortOrder('asc'); }
                    }}
                  >
                    Prospect & Company
                  </th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Status</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => {
                      if (sortBy === 'leadScore') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('leadScore'); setSortOrder('desc'); }
                    }}
                  >
                    AI Score
                  </th>
                  <th className="py-3 px-4">Est. Value</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      selectedIds.includes(lead.id) ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={(e) => handleSelectOne(lead.id, e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div
                        className="cursor-pointer group"
                        onClick={() => {
                          setActiveLead(lead);
                          setIsDetailOpen(true);
                        }}
                      >
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {lead.name}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                          {lead.title ? `${lead.title} • ` : ''}
                          <span className="font-medium text-slate-700 dark:text-slate-300">{lead.companyName}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate">{lead.email}</p>
                      <p className="text-slate-400 text-[11px] font-mono">{lead.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={lead.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-xs px-2 py-0.5 rounded-full font-mono ${
                            lead.leadScore >= 80
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                              : lead.leadScore >= 60
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {lead.leadScore}
                        </span>
                        {lead.leadScore >= 80 && (
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500" title="High Conversion Propensity" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      ₹{(lead.estimatedValue / 100000).toFixed(1)}L
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {lead.source}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={lead.ownerName} size="xs" />
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                          {lead.ownerName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.status !== 'Converted' && (
                          <button
                            type="button"
                            onClick={() => {
                              setConvertTargetLead(lead);
                              setConvertDealName(`${lead.companyName} CRM Expansion`);
                              setConvertDealValue(lead.estimatedValue || 800000);
                              setIsConvertModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 rounded-md transition-colors"
                            title="Convert to Contact & Deal"
                          >
                            Convert
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveLead(lead);
                            setIsDetailOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasPermission('leads.delete') && (
                          <button
                            type="button"
                            onClick={() => {
                              setLeadToDelete(lead.id);
                              setIsConfirmDeleteOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalLeads}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Lead Detail Drawer */}
      <Drawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeLead ? `${activeLead.name} (${activeLead.companyName})` : 'Lead Details'}
        width="lg"
      >
        {activeLead && (
          <div className="space-y-6 text-xs">
            {/* Lead Header Profile */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Avatar name={activeLead.name} size="lg" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeLead.name}
                  </h3>
                  <p className="text-slate-500 font-medium">
                    {activeLead.title || 'Executive Lead'} • {activeLead.companyName}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{activeLead.location || 'India'}</p>
                </div>
              </div>
              <StatusBadge status={activeLead.status} size="md" />
            </div>

            {/* AI Scoring Analysis Panel */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    NexusAI Conversion Scoring
                  </span>
                </div>
                <span className="text-sm font-bold font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  {activeLead.leadScore}/100
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Prospect exhibits high purchase intent with senior executive decision authority in an enterprise vertical.
              </p>
              {activeLead.scoreFactors && activeLead.scoreFactors.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Positive Signals:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                    {activeLead.scoreFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Key Information Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-medium">Email Address</span>
                <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5">{activeLead.email}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Phone</span>
                <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5">{activeLead.phone}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Estimated Pipeline Value</span>
                <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                  ₹{(activeLead.estimatedValue / 100000).toFixed(2)} Lakhs
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Acquisition Channel</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{activeLead.source}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Lead Owner</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{activeLead.ownerName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Created On</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {new Date(activeLead.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Convert Actions */}
            {activeLead.status !== 'Converted' ? (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setConvertTargetLead(activeLead);
                    setConvertDealName(`${activeLead.companyName} CRM Expansion`);
                    setConvertDealValue(activeLead.estimatedValue || 800000);
                    setIsConvertModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>1-Click Convert to Contact & Deal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>This lead has already been converted into an active customer account!</span>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Convert Lead Modal */}
      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        title="Convert Lead into Account"
        subtitle={convertTargetLead ? `Convert ${convertTargetLead.name} (${convertTargetLead.companyName})` : ''}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1.5 border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-white">Conversion Workflow:</p>
            <p className="text-slate-500">1. A new Contact record will be created for {convertTargetLead?.name}.</p>
            <p className="text-slate-500">2. A Company record will be created or mapped to {convertTargetLead?.companyName}.</p>
            <p className="text-slate-500">3. Lead status will be marked as 'Converted'.</p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createDealOption}
                onChange={(e) => setCreateDealOption(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-900 dark:text-white">
                Create a new Deal / Sales Opportunity simultaneously
              </span>
            </label>

            {createDealOption && (
              <div className="pl-6 space-y-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Deal Title</label>
                  <input
                    type="text"
                    value={convertDealName}
                    onChange={(e) => setConvertDealName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Opportunity Value (₹)</label>
                  <input
                    type="number"
                    value={convertDealValue}
                    onChange={(e) => setConvertDealValue(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(false)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConvertLead}
              className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Confirm Conversion
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inbound Lead"
        subtitle="Record prospect details to initiate qualification pipeline."
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Patel"
              value={newLead.name}
              onChange={e => setNewLead({ ...newLead, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Organization *</label>
            <input
              type="text"
              required
              placeholder="e.g. Solaris Cloud Systems"
              value={newLead.companyName}
              onChange={e => setNewLead({ ...newLead, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Chief Operating Officer"
                value={newLead.title}
                onChange={e => setNewLead({ ...newLead, title: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Value (₹)</label>
              <input
                type="number"
                value={newLead.estimatedValue}
                onChange={e => setNewLead({ ...newLead, estimatedValue: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="vikram@solaris.io"
                value={newLead.email}
                onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 98200 12345"
                value={newLead.phone}
                onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Lead Source</label>
            <select
              value={newLead.source}
              onChange={e => setNewLead({ ...newLead, source: e.target.value as any })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="Website">Website Form</option>
              <option value="Referral">Executive Referral</option>
              <option value="LinkedIn">LinkedIn Outreach</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Cold Call">Cold Call</option>
            </select>
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
              Create Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Lead Record(s)"
        message={
          leadToDelete
            ? 'Are you sure you want to permanently delete this lead? This action cannot be undone.'
            : `Are you sure you want to permanently delete ${selectedIds.length} selected leads?`
        }
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
