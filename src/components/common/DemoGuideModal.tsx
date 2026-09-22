import React from 'react';
import { Modal } from './Modal';
import { CheckCircle2, ArrowRight, Sparkles, Building2, Users2, Brain, Kanban, BarChart3, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const steps = [
    {
      num: '1',
      title: 'Multi-Tenant Workspace & RBAC',
      icon: Building2,
      desc: 'Use the top-right switcher to switch between organizations (Nexus Corp, Apex, Starlight) or toggle roles (Super Admin, Manager, Sales, Viewer) to demo strict permission boundaries.',
      actionRoute: '/settings',
      actionText: 'View Tenant Settings',
    },
    {
      num: '2',
      title: 'Executive Dashboard & Financial KPIs',
      icon: BarChart3,
      desc: 'Highlight ₹42.8L in active pipeline, ₹18.4L in won revenue, real-time conversion rates, sales rep leaderboard, and one-click filtering by date ranges.',
      actionRoute: '/dashboard',
      actionText: 'Go to Dashboard',
    },
    {
      num: '3',
      title: 'AI Lead Scoring & 1-Click Conversion',
      icon: Users2,
      desc: 'Navigate to Leads. Inspect Sunita Menon (87/100 score). Click "Convert" to instantly generate an associated Contact, Company, and a ₹8L Deal record.',
      actionRoute: '/leads',
      actionText: 'Explore Leads',
    },
    {
      num: '4',
      title: 'Interactive Sales Kanban Pipeline',
      icon: Kanban,
      desc: 'Demonstrate drag-and-drop deal progression through stages (Qualified → Proposal → Negotiation → Won). Watch win probability and timeline recalculate dynamically.',
      actionRoute: '/deals',
      actionText: 'Open Deals Kanban',
    },
    {
      num: '5',
      title: 'NexusAI Assistant In Action',
      icon: Brain,
      desc: 'Click on NexusAI in the sidebar. Click suggested prompt "Which deals need attention today?" or "Create a follow-up task for Rahul tomorrow" to see actionable CRM intelligence.',
      actionRoute: '/ai-assistant',
      actionText: 'Launch AI Assistant',
    },
    {
      num: '6',
      title: 'Generic Customization Engine',
      icon: Settings2,
      desc: 'Show how NexusCRM adapts to healthcare, manufacturing, or finance by adding custom fields and editing pipeline stages without changing code.',
      actionRoute: '/settings',
      actionText: 'Custom Fields & Stages',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="NexusCRM Client Demonstration Guide"
      subtitle="Follow this proven 6-step walkthrough script to present a compelling SaaS demonstration to prospects or investors."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong>Demonstration Tip:</strong> All data in this application is live and interactive in local memory. You can create records, drag deals, and log activities safely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {step.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(step.actionRoute);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors pt-2 border-t border-slate-200 dark:border-slate-800"
                >
                  <span>{step.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Architecture: Ready for Node/Express + MongoDB + Gemini API</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg transition-colors"
          >
            Got It, Let's Demo
          </button>
        </div>
      </div>
    </Modal>
  );
};
