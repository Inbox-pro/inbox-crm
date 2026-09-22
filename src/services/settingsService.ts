import { Organization, PipelineStageConfig, CustomFieldConfig, Role } from '../types';
import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: string;
  entity: string;
}

export interface ScoringRule {
  id: string;
  criterion: string;
  description: string;
  points: number;
}

export interface OrganizationSettings {
  orgName: string;
  currency: string;
  timezone: string;
  fiscalYearStart: string;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
    status: 'Active' | 'Inactive';
  }>;
  customFields: CustomFieldDefinition[];
  scoringRules: ScoringRule[];
}

let storedSettings: OrganizationSettings = {
  orgName: 'Nexus Global Enterprises',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  fiscalYearStart: 'April',
  users: [
    { id: 'usr_1', name: 'Vikramaditya Rao', email: 'vikramaditya@nexus.io', role: 'Super Admin', status: 'Active' },
    { id: 'usr_2', name: 'Ananya Sharma', email: 'ananya@nexus.io', role: 'Admin', status: 'Active' },
    { id: 'usr_3', name: 'Priya Sundaram', email: 'priya@nexus.io', role: 'Manager', status: 'Active' },
    { id: 'usr_4', name: 'Rohan Mehta', email: 'rohan@nexus.io', role: 'Sales', status: 'Active' },
    { id: 'usr_5', name: 'Devendra Joshi', email: 'devendra@nexus.io', role: 'Sales', status: 'Active' },
  ],
  customFields: [
    { id: 'cf_1', label: 'ERP Account Reference', type: 'Text', entity: 'Companies' },
    { id: 'cf_2', label: 'Security Compliance Tier', type: 'Dropdown', entity: 'Deals' },
    { id: 'cf_3', label: 'Procurement POC Phone', type: 'Phone', entity: 'Leads' },
    { id: 'cf_4', label: 'Annual SaaS Budget Bracket', type: 'Currency', entity: 'Leads' },
  ],
  scoringRules: [
    { id: 'sr_1', criterion: 'C-Level / VP Decision Maker', description: 'Evaluates job title seniority against known executive patterns', points: 30 },
    { id: 'sr_2', criterion: 'High-Growth Company (100+ Staff)', description: 'Organization size indicative of expansion capacity', points: 25 },
    { id: 'sr_3', criterion: 'Direct Inbound or Verified Referral', description: 'Lead arrived with high discovery motivation', points: 25 },
    { id: 'sr_4', criterion: 'Recent Pricing or Demo Activity', description: 'Prospect interacted with quotation or demo flow', points: 20 },
  ],
};

export const settingsService = {
  async getSettings(): Promise<ApiResponse<OrganizationSettings>> {
    return simulateNetworkLatency({
      success: true,
      data: storedSettings,
    });
  },

  async updateSettings(newSettings: OrganizationSettings): Promise<ApiResponse<OrganizationSettings>> {
    storedSettings = { ...newSettings };
    return simulateNetworkLatency({
      success: true,
      data: storedSettings,
      message: 'Settings updated successfully',
    });
  },

  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    return simulateNetworkLatency({
      success: true,
      data: mockDb.getOrganizations(),
    });
  },

  async getActiveOrganizationId(): Promise<ApiResponse<string>> {
    return simulateNetworkLatency({
      success: true,
      data: mockDb.getActiveOrganizationId(),
    });
  },

  async switchOrganization(orgId: string): Promise<ApiResponse<{ activeId: string }>> {
    mockDb.setActiveOrganizationId(orgId);
    return simulateNetworkLatency({
      success: true,
      data: { activeId: orgId },
      message: 'Switched organization workspace',
    });
  },

  async getPipelineStages(): Promise<ApiResponse<PipelineStageConfig[]>> {
    return simulateNetworkLatency({
      success: true,
      data: mockDb.getPipelineStages(),
    });
  },

  async updatePipelineStages(stages: PipelineStageConfig[]): Promise<ApiResponse<PipelineStageConfig[]>> {
    mockDb.updatePipelineStages(stages);
    return simulateNetworkLatency({
      success: true,
      data: stages,
      message: 'Pipeline stages updated successfully',
    });
  },

  async getCustomFields(): Promise<ApiResponse<CustomFieldConfig[]>> {
    return simulateNetworkLatency({
      success: true,
      data: mockDb.getCustomFields(),
    });
  },

  async addCustomField(field: Omit<CustomFieldConfig, 'id'>): Promise<ApiResponse<CustomFieldConfig>> {
    const created = mockDb.addCustomField(field);
    return simulateNetworkLatency({
      success: true,
      data: created,
      message: 'Custom field added successfully',
    });
  },
};
