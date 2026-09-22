import React, { useState, useEffect } from 'react';
import {
  Plus,
  Kanban as KanbanIcon,
  List,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  ChevronRight,
  TrendingUp,
  MoreVertical,
  Trash2,
  Eye,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { dealsService, DealFilterParams } from '../services/dealsService';
import { Deal, DealStage } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const STAGES: { id: DealStage; name: string; color: string; border: string }[] = [
  { id: 'New', name: 'Discovery', color: 'bg-slate-500', border: 'border-slate-300 dark:border-slate-700' },
  { id: 'Qualified', name: 'Qualified', color: 'bg-blue-500', border: 'border-blue-300 dark:border-blue-800' },
  { id: 'Proposal', name: 'Proposal / RFP', color: 'bg-amber-500', border: 'border-amber-300 dark:border-amber-800' },
  { id: 'Negotiation', name: 'Negotiation', color: 'bg-purple-500', border: 'border-purple-300 dark:border-purple-800' },
  { id: 'Won', name: 'Closed Won', color: 'bg-emerald-500', border: 'border-emerald-300 dark:border-emerald-800' },
  { id: 'Lost', name: 'Closed Lost', color: 'bg-rose-500', border: 'border-rose-300 dark:border-rose-800' },
];

export const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<DealStage | 'All'>('All');

  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);

  // Drag and drop state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  // New Deal Form State
  const [newDeal, setNewDeal] = useState({
    name: '',
    companyName: '',
    contactName: '',
    value: 800000,
    stage: 'Qualified' as DealStage,
    expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await dealsService.getDeals({
        search,
        stage: stageFilter,
      });
      setDeals(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load deals pipeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [search, stageFilter]);

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      await dealsService.updateDealStage(dealId, newStage);
      setDeals(prev =>
        prev.map(d => (d.id === dealId ? { ...d, stage: newStage } : d))
      );
      if (activeDeal && activeDeal.id === dealId) {
        setActiveDeal(prev => (prev ? { ...prev, stage: newStage } : null));
      }
      showToast(`Deal moved to ${newStage}`);
    } catch {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleDragStart = (dealId: string) => {
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: DealStage) => {
    if (!draggedDealId) return;
    handleStageChange(draggedDealId, stage);
    setDraggedDealId(null);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dealsService.createDeal({
        name: newDeal.name,
        companyName: newDeal.companyName,
        companyId: 'comp_1',
        contactName: newDeal.contactName || 'Executive Contact',
        value: Number(newDeal.value),
        stage: newDeal.stage,
        probability: newDeal.stage === 'Won' ? 100 : newDeal.stage === 'Negotiation' ? 80 : 40,
        ownerId: 'usr_3',
        ownerName: 'Vikramaditya Rao',
        expectedCloseDate: newDeal.expectedCloseDate,
      });
      showToast('New deal created!');
      setIsAddModalOpen(false);
      setNewDeal({
        name: '',
        companyName: '',
        contactName: '',
        value: 800000,
        stage: 'Qualified',
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchDeals();
    } catch {
      showToast('Failed to create deal', 'error');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!dealToDelete) return;
    try {
      await dealsService.deleteDeal(dealToDelete);
      showToast('Deal deleted from pipeline');
      setIsConfirmDeleteOpen(false);
      setDealToDelete(null);
      if (activeDeal?.id === dealToDelete) setIsDetailOpen(false);
      fetchDeals();
    } catch {
      showToast('Error deleting deal', 'error');
    }
  };

  // Stage metrics calculation
  const getStageStats = (stage: DealStage) => {
    const stageDeals = deals.filter(d => d.stage === stage);
    const count = stageDeals.length;
    const totalVal = stageDeals.reduce((acc, d) => acc + d.value, 0);
    return {
      count,
      totalValLakhs: (totalVal / 100000).toFixed(1),
      deals: stageDeals,
    };
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sales Pipeline & Kanban
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {deals.length} opportunities
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize deal velocity, stage progression, and revenue probability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {hasPermission('deals.create') && (
            <button
              id="btn-new-deal"
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search deals, company, or contact..." />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="All">All Stages</option>
            <option value="New">Discovery</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
          <button
            type="button"
            onClick={fetchDeals}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px]">
            {STAGES.map((col) => {
              const { count, totalValLakhs, deals: stageDeals } = getStageStats(col.id);

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(col.id)}
                  className={`flex-1 min-w-[220px] bg-slate-100/60 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80 flex flex-col max-h-[75vh]`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {col.name}
                      </h3>
                      <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {count}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{totalValLakhs}L
                    </span>
                  </div>

                  {/* Deals Cards Container */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {stageDeals.length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg">
                        Drop deals here
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={() => handleDragStart(deal.id)}
                          onClick={() => {
                            setActiveDeal(deal);
                            setIsDetailOpen(true);
                          }}
                          className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 cursor-grab active:cursor-grabbing transition-all space-y-2 text-xs"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                {deal.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{deal.companyName}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                              ₹{(deal.value / 100000).toFixed(1)}L
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                deal.probability >= 80
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : deal.probability >= 50
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {deal.probability}% Win
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{deal.expectedCloseDate}</span>
                            </div>
                            <Avatar name={deal.ownerName} size="xs" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Company Account</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Win Probability</th>
                  <th className="py-3 px-4">Close Date</th>
                  <th className="py-3 px-4">Deal Owner</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {deals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveDeal(deal);
                      setIsDetailOpen(true);
                    }}
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                        {deal.name}
                      </p>
                      <p className="text-slate-400 text-[11px]">{deal.contactName}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {deal.companyName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{(deal.value / 100000).toFixed(2)}L
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={deal.stage} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">
                        {deal.probability}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {deal.expectedCloseDate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={deal.ownerName} size="xs" />
                        <span className="text-slate-700 dark:text-slate-300">{deal.ownerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDeal(deal);
                            setIsDetailOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasPermission('deals.delete') && (
                          <button
                            type="button"
                            onClick={() => {
                              setDealToDelete(deal.id);
                              setIsConfirmDeleteOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
        </div>
      )}

      {/* Deal Detail Drawer */}
      <Drawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeDeal ? activeDeal.name : 'Deal Details'}
        width="lg"
      >
        {activeDeal && (
          <div className="space-y-6 text-xs">
            {/* Value Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Deal Value</span>
                <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  ₹{(activeDeal.value / 100000).toFixed(2)} Lakhs
                </p>
                <p className="text-slate-500 mt-1">
                  {activeDeal.companyName} • {activeDeal.contactName}
                </p>
              </div>
              <StatusBadge status={activeDeal.stage} size="md" />
            </div>

            {/* Pipeline Stage Stepper */}
            <div className="space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Advance Pipeline Stage:</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] as DealStage[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStageChange(activeDeal.id, st)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                      activeDeal.stage === st
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Properties */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-medium">Win Probability</span>
                <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                  {activeDeal.probability}%
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Expected Closing Date</span>
                <p className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                  {activeDeal.expectedCloseDate}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Opportunity Owner</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {activeDeal.ownerName}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Opportunity ID</span>
                <p className="font-mono text-slate-500 mt-0.5">{activeDeal.id}</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Deal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Sales Opportunity"
        subtitle="Create a deal and place it into the pipeline."
      >
        <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Opportunity Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise Cloud Analytics Implementation"
              value={newDeal.name}
              onChange={e => setNewDeal({ ...newDeal, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Organization *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corporation"
              value={newDeal.companyName}
              onChange={e => setNewDeal({ ...newDeal, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Deal Value (₹) *</label>
              <input
                type="number"
                required
                value={newDeal.value}
                onChange={e => setNewDeal({ ...newDeal, value: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Pipeline Stage</label>
              <select
                value={newDeal.stage}
                onChange={e => setNewDeal({ ...newDeal, stage: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="New">Discovery</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Closed Won</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Close Date</label>
            <input
              type="date"
              value={newDeal.expectedCloseDate}
              onChange={e => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
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
              Create Opportunity
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Opportunity"
        message="Are you sure you want to permanently delete this deal from the sales pipeline?"
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
