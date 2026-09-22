import { Organization, PipelineStageConfig, CustomFieldConfig, Role, Permission } from '../types';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_inbox_01',
    name: 'Inbox Infotech Pvt. Ltd.',
    industry: 'Enterprise Software & IT Solutions',
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata (IST +5:30)',
    plan: 'Enterprise',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'org_apex_02',
    name: 'Apex Industrial Dynamics',
    industry: 'Manufacturing & Distribution',
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/New_York (EST -5:00)',
    plan: 'Professional',
    createdAt: '2025-02-15T00:00:00Z',
  },
  {
    id: 'org_starlight_03',
    name: 'Starlight Ventures Ltd',
    industry: 'Financial & Capital Management',
    currency: 'EUR',
    currencySymbol: '€',
    timezone: 'Europe/London (GMT +0:00)',
    plan: 'Enterprise',
    createdAt: '2025-03-01T00:00:00Z',
  },
];

export const MOCK_PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'New', name: 'New Lead / Discovery', color: '#64748b', probability: 20, order: 1 },
  { id: 'Qualified', name: 'Needs Analysis & Qualified', color: '#3b82f6', probability: 40, order: 2 },
  { id: 'Proposal', name: 'Proposal / Price Quote', color: '#f59e0b', probability: 60, order: 3 },
  { id: 'Negotiation', name: 'Negotiation & Legal Review', color: '#8b5cf6', probability: 80, order: 4 },
  { id: 'Won', name: 'Closed Won', color: '#10b981', probability: 100, order: 5 },
  { id: 'Lost', name: 'Closed Lost', color: '#ef4444', probability: 0, order: 6 },
];

export const MOCK_CUSTOM_FIELDS: CustomFieldConfig[] = [
  {
    id: 'cf_1',
    entity: 'Lead',
    name: 'Industry Vertical',
    key: 'industryVertical',
    type: 'select',
    options: ['Healthcare', 'Fintech', 'Manufacturing', 'Retail', 'Logistics', 'Real Estate', 'Other'],
    required: true,
  },
  {
    id: 'cf_2',
    entity: 'Lead',
    name: 'Estimated Employee Size',
    key: 'employeeCount',
    type: 'select',
    options: ['1-50', '51-250', '251-1000', '1000+'],
    required: false,
  },
  {
    id: 'cf_3',
    entity: 'Deal',
    name: 'Contract Duration (Months)',
    key: 'contractMonths',
    type: 'number',
    required: false,
  },
  {
    id: 'cf_4',
    entity: 'Deal',
    name: 'Deployment Type',
    key: 'deploymentType',
    type: 'select',
    options: ['Cloud SaaS (Shared)', 'Dedicated Tenant Cloud', 'On-Premises Hybrid'],
    required: true,
  },
  {
    id: 'cf_5',
    entity: 'Company',
    name: 'Primary Cloud Provider',
    key: 'cloudProvider',
    type: 'select',
    options: ['AWS', 'Google Cloud', 'Microsoft Azure', 'On-Premise Private Datacenter'],
    required: false,
  },
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'Super Admin': [
    'leads.read', 'leads.create', 'leads.update', 'leads.delete',
    'deals.read', 'deals.create', 'deals.update', 'deals.delete',
    'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
    'companies.read', 'companies.create', 'companies.update', 'companies.delete',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'reports.read', 'users.manage', 'settings.manage'
  ],
  'Admin': [
    'leads.read', 'leads.create', 'leads.update', 'leads.delete',
    'deals.read', 'deals.create', 'deals.update', 'deals.delete',
    'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
    'companies.read', 'companies.create', 'companies.update', 'companies.delete',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'reports.read', 'users.manage', 'settings.manage'
  ],
  'Manager': [
    'leads.read', 'leads.create', 'leads.update',
    'deals.read', 'deals.create', 'deals.update',
    'contacts.read', 'contacts.create', 'contacts.update',
    'companies.read', 'companies.create', 'companies.update',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'reports.read'
  ],
  'Sales': [
    'leads.read', 'leads.create', 'leads.update',
    'deals.read', 'deals.create', 'deals.update',
    'contacts.read', 'contacts.create', 'contacts.update',
    'companies.read', 'companies.create', 'companies.update',
    'tasks.read', 'tasks.create', 'tasks.update',
    'reports.read'
  ],
  'Viewer': [
    'leads.read',
    'deals.read',
    'contacts.read',
    'companies.read',
    'tasks.read',
    'reports.read'
  ]
};
