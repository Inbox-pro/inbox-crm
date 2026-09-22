import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Modal } from '../common/Modal';
import { leadsService } from '../../services/leadsService';
import { dealsService } from '../../services/dealsService';
import { tasksService } from '../../services/tasksService';
import { activitiesService } from '../../services/activitiesService';
import { useToast } from '../../context/ToastContext';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [quickActionType, setQuickActionType] = useState<'lead' | 'deal' | 'task' | 'activity' | null>(null);

  // Form states for quick actions
  const [leadForm, setLeadForm] = useState({ name: '', companyName: '', email: '', phone: '', source: 'Website' as const, value: 500000 });
  const [dealForm, setDealForm] = useState({ name: '', companyName: '', value: 800000, stage: 'Qualified' as const, closeDate: '2025-05-30' });
  const [taskForm, setTaskForm] = useState({ title: '', dueDate: '2025-04-20', priority: 'High' as const, companyName: '' });
  const [activityForm, setActivityForm] = useState({ title: '', type: 'Call' as const, description: '', companyName: '' });

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leadsService.createLead({
        name: leadForm.name,
        companyName: leadForm.companyName,
        email: leadForm.email,
        phone: leadForm.phone || '+91 98765 43210',
        source: leadForm.source,
        status: 'New',
        leadScore: 78,
        estimatedValue: Number(leadForm.value),
        ownerId: 'usr_3',
        ownerName: 'Vikramaditya Rao',
        lastContactedAt: new Date().toISOString(),
      });
      showToast(`Lead for ${leadForm.name} created!`);
      setQuickActionType(null);
      navigate('/leads');
    } catch {
      showToast('Failed to create lead', 'error');
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dealsService.createDeal({
        name: dealForm.name,
        companyName: dealForm.companyName,
        companyId: 'comp_1',
        contactName: 'Executive Contact',
        value: Number(dealForm.value),
        stage: dealForm.stage,
        probability: 40,
        ownerId: 'usr_3',
        ownerName: 'Vikramaditya Rao',
        expectedCloseDate: dealForm.closeDate,
      });
      showToast(`Deal ${dealForm.name} added to pipeline!`);
      setQuickActionType(null);
      navigate('/deals');
    } catch {
      showToast('Failed to create deal', 'error');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksService.createTask({
        title: taskForm.title,
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        status: 'Pending',
        assignedToId: 'usr_3',
        assignedToName: 'Vikramaditya Rao',
        relatedCompanyName: taskForm.companyName || 'Enterprise Account',
        description: 'Created via quick action button.',
      });
      showToast('New task scheduled!');
      setQuickActionType(null);
      navigate('/tasks');
    } catch {
      showToast('Failed to create task', 'error');
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await activitiesService.createActivity({
        title: activityForm.title,
        type: activityForm.type,
        description: activityForm.description || 'Logged via quick actions.',
        performedById: 'usr_3',
        performedByName: 'Vikramaditya Rao',
        occurredAt: new Date().toISOString(),
        relatedCompanyName: activityForm.companyName || 'Enterprise Account',
      });
      showToast('Activity logged successfully!');
      setQuickActionType(null);
      navigate('/activities');
    } catch {
      showToast('Failed to log activity', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Top Navigation */}
      <TopNav
        collapsed={collapsed}
        onQuickAction={(type) => setQuickActionType(type)}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`flex-1 transition-all duration-300 pt-16 ${
          collapsed ? 'ml-18' : 'ml-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Quick Add Lead Modal */}
      <Modal
        isOpen={quickActionType === 'lead'}
        onClose={() => setQuickActionType(null)}
        title="Create New Lead"
        subtitle="Add an inbound prospect to your CRM database with AI scoring."
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Mahindra"
              value={leadForm.name}
              onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Organization *</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Industrial Dynamics"
              value={leadForm.companyName}
              onChange={e => setLeadForm({ ...leadForm, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={leadForm.email}
                onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={leadForm.phone}
                onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Value (₹)</label>
              <input
                type="number"
                value={leadForm.value}
                onChange={e => setLeadForm({ ...leadForm, value: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Acquisition Source</label>
              <select
                value={leadForm.source}
                onChange={e => setLeadForm({ ...leadForm, source: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Cold Call">Cold Call</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setQuickActionType(null)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Save Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Deal Modal */}
      <Modal
        isOpen={quickActionType === 'deal'}
        onClose={() => setQuickActionType(null)}
        title="Create New Sales Opportunity"
        subtitle="Add a deal directly to the sales pipeline Kanban board."
      >
        <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Deal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cloud Security Suite Expansion"
              value={dealForm.name}
              onChange={e => setDealForm({ ...dealForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Account / Company *</label>
            <input
              type="text"
              required
              placeholder="e.g. ABC Technologies"
              value={dealForm.companyName}
              onChange={e => setDealForm({ ...dealForm, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Deal Value (₹)</label>
              <input
                type="number"
                value={dealForm.value}
                onChange={e => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Stage</label>
              <select
                value={dealForm.stage}
                onChange={e => setDealForm({ ...dealForm, stage: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="New">New Discovery</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Close Date</label>
            <input
              type="date"
              value={dealForm.closeDate}
              onChange={e => setDealForm({ ...dealForm, closeDate: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setQuickActionType(null)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Create Deal
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={quickActionType === 'task'}
        onClose={() => setQuickActionType(null)}
        title="Schedule New Task"
        subtitle="Assign an action item to keep deal momentum high."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Send technical architecture deck"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Related Account / Company</label>
            <input
              type="text"
              placeholder="e.g. OmniRetail Labs"
              value={taskForm.companyName}
              onChange={e => setTaskForm({ ...taskForm, companyName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setQuickActionType(null)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Save Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Activity Modal */}
      <Modal
        isOpen={quickActionType === 'activity'}
        onClose={() => setQuickActionType(null)}
        title="Log Customer Activity"
        subtitle="Record touchpoints across email, phone, or meetings."
      >
        <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Type</label>
              <select
                value={activityForm.type}
                onChange={e => setActivityForm({ ...activityForm, type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="Demo">Demo</option>
                <option value="Note">Note</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Related Account</label>
              <input
                type="text"
                placeholder="e.g. Quantum Health"
                value={activityForm.companyName}
                onChange={e => setActivityForm({ ...activityForm, companyName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Subject / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pricing renegotiation call"
              value={activityForm.title}
              onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Discussion Notes</label>
            <textarea
              rows={3}
              placeholder="Summary of customer requirements, milestones, or objections..."
              value={activityForm.description}
              onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setQuickActionType(null)}
              className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Record Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
