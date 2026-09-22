import { Lead, LeadStatus, LeadSource } from '../types';
import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';
import { isDateInRange } from '../utils/dateFilter';

export interface LeadFilterParams {
  search?: string;
  status?: LeadStatus | 'All';
  source?: LeadSource | 'All';
  ownerId?: string | 'All';
  dateRange?: string;
  minScore?: number;
  sortBy?: keyof Lead;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const leadsService = {
  async getLeads(params: LeadFilterParams = {}): Promise<ApiResponse<Lead[]>> {
    let list = mockDb.getLeads();

    if (params.dateRange && params.dateRange !== 'All') {
      list = list.filter(l => isDateInRange(l.createdAt, params.dateRange!));
    }

    // Filtering
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        l =>
          l.name.toLowerCase().includes(q) ||
          l.companyName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q)
      );
    }

    if (params.status && params.status !== 'All') {
      list = list.filter(l => l.status === params.status);
    }

    if (params.source && params.source !== 'All') {
      list = list.filter(l => l.source === params.source);
    }

    if (params.ownerId && params.ownerId !== 'All') {
      list = list.filter(l => l.ownerId === params.ownerId);
    }

    if (params.minScore !== undefined) {
      list = list.filter(l => l.leadScore >= (params.minScore ?? 0));
    }

    // Sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    list.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = list.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const paginated = list.slice((page - 1) * pageSize, page * pageSize);

    return simulateNetworkLatency({
      success: true,
      data: paginated,
      meta: {
        total,
        page,
        pageSize,
      },
    });
  },

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    const lead = mockDb.getLeadById(id);
    if (!lead) {
      throw new Error(`Lead ${id} not found`);
    }
    return simulateNetworkLatency({
      success: true,
      data: lead,
    });
  },

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Promise<ApiResponse<Lead>> {
    const created = mockDb.createLead(leadData);
    return simulateNetworkLatency({
      success: true,
      data: created,
      message: 'Lead created successfully',
    });
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<ApiResponse<Lead>> {
    const updated = mockDb.updateLead(id, updates);
    return simulateNetworkLatency({
      success: true,
      data: updated,
      message: 'Lead updated successfully',
    });
  },

  async deleteLead(id: string): Promise<ApiResponse<{ id: string }>> {
    mockDb.deleteLead(id);
    return simulateNetworkLatency({
      success: true,
      data: { id },
      message: 'Lead deleted successfully',
    });
  },

  async bulkUpdateStatus(ids: string[], status: LeadStatus): Promise<ApiResponse<{ count: number }>> {
    ids.forEach(id => {
      mockDb.updateLead(id, { status });
    });
    return simulateNetworkLatency({
      success: true,
      data: { count: ids.length },
      message: `Updated status for ${ids.length} leads`,
    });
  },

  async bulkDelete(ids: string[]): Promise<ApiResponse<{ count: number }>> {
    ids.forEach(id => {
      mockDb.deleteLead(id);
    });
    return simulateNetworkLatency({
      success: true,
      data: { count: ids.length },
      message: `Deleted ${ids.length} leads`,
    });
  },

  async convertLead(leadId: string, options: { createDeal?: boolean; dealValue?: number; dealName?: string }): Promise<ApiResponse<{
    contactId: string;
    companyId: string;
    dealId?: string;
  }>> {
    const res = mockDb.convertLead(leadId, options);
    return simulateNetworkLatency({
      success: true,
      data: {
        contactId: res.contact.id,
        companyId: res.company.id,
        dealId: res.deal?.id,
      },
      message: 'Lead converted successfully',
    });
  },
};
