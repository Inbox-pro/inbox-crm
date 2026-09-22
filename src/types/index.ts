export type Role = 'Super Admin' | 'Admin' | 'Manager' | 'Sales' | 'Viewer';

export type Permission =
  | 'leads.read'
  | 'leads.create'
  | 'leads.update'
  | 'leads.delete'
  | 'deals.read'
  | 'deals.create'
  | 'deals.update'
  | 'deals.delete'
  | 'contacts.read'
  | 'contacts.create'
  | 'contacts.update'
  | 'contacts.delete'
  | 'companies.read'
  | 'companies.create'
  | 'companies.update'
  | 'companies.delete'
  | 'tasks.read'
  | 'tasks.create'
  | 'tasks.update'
  | 'tasks.delete'
  | 'reports.read'
  | 'users.manage'
  | 'settings.manage';

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  createdAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'LinkedIn'
  | 'Advertisement'
  | 'Cold Call'
  | 'Email'
  | 'Other';

export interface AiLeadScoreInsight {
  score: number;
  factors: string[];
  recommendedAction: string;
  lastEvaluatedAt: string;
  intentLevel: 'High' | 'Medium' | 'Low';
}

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  leadScore: number;
  aiInsight?: AiLeadScoreInsight;
  scoreFactors?: string[];
  lastContactedAt?: string;
  ownerId: string;
  ownerName: string;
  estimatedValue: number;
  title?: string;
  location?: string;
  notes?: string;
  convertedContactId?: string;
  convertedCompanyId?: string;
  convertedDealId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organizationId: string;
  name: string;
  companyId: string;
  companyName: string;
  email: string;
  phone: string;
  jobTitle: string;
  ownerId: string;
  ownerName: string;
  lastActivityAt: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  location?: string;
  linkedin?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  organizationId: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  location: string;
  employees: string;
  annualRevenue?: string;
  ownerId: string;
  ownerName: string;
  status: 'Customer' | 'Prospect' | 'Partner' | 'Churned';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage = 'New' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Deal {
  id: string;
  organizationId: string;
  name: string;
  companyId: string;
  companyName: string;
  contactId?: string;
  contactName: string;
  value: number;
  stage: DealStage;
  probability: number;
  ownerId: string;
  ownerName: string;
  expectedCloseDate: string;
  pipelineId?: string;
  lostReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: string;
  assignedToName: string;
  relatedLeadId?: string;
  relatedLeadName?: string;
  relatedContactId?: string;
  relatedContactName?: string;
  relatedDealId?: string;
  relatedDealName?: string;
  relatedCompanyId?: string;
  relatedCompanyName?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Note' | 'Demo' | 'Follow-up';

export interface Activity {
  id: string;
  organizationId: string;
  type: ActivityType;
  title: string;
  description: string;
  performedById: string;
  performedByName: string;
  occurredAt: string;
  relatedLeadId?: string;
  relatedLeadName?: string;
  relatedContactId?: string;
  relatedContactName?: string;
  relatedCompanyId?: string;
  relatedCompanyName?: string;
  relatedDealId?: string;
  relatedDealName?: string;
  durationMinutes?: number;
  outcome?: string;
}

export interface PipelineStageConfig {
  id: DealStage;
  name: string;
  color: string;
  probability: number;
  order: number;
}

export interface CustomFieldConfig {
  id: string;
  entity: 'Lead' | 'Contact' | 'Company' | 'Deal';
  name: string;
  key: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  options?: string[];
  required: boolean;
}

export interface DashboardKpiSummary {
  totalLeads: number;
  newLeads: number;
  openDeals: number;
  pipelineValue: number;
  wonRevenue: number;
  conversionRate: number;
  leadGrowthPercent: number;
  revenueGrowthPercent: number;
  pipelineValueFormatted: string;
  wonRevenueFormatted: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  cards?: {
    type: 'deal' | 'lead' | 'company' | 'stats';
    title: string;
    subtitle?: string;
    value?: string;
    link?: string;
    meta?: Record<string, string>;
  }[];
}
