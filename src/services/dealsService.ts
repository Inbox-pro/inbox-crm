import { Deal, DealStage } from '../types';
import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';
import { isDateInRange } from '../utils/dateFilter';

export interface DealFilterParams {
  search?: string;
  stage?: DealStage | 'All';
  ownerId?: string | 'All';
  dateRange?: string;
  companyId?: string;
  minAmount?: number;
  sortBy?: keyof Deal;
  sortOrder?: 'asc' | 'desc';
}

export const dealsService = {
  async getDeals(params: DealFilterParams = {}): Promise<ApiResponse<Deal[]>> {
    let list = mockDb.getDeals();

    if (params.dateRange && params.dateRange !== 'All') {
      list = list.filter(d => isDateInRange(d.createdAt, params.dateRange!));
    }

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.companyName.toLowerCase().includes(q) ||
          d.contactName.toLowerCase().includes(q)
      );
    }

    if (params.stage && params.stage !== 'All') {
      list = list.filter(d => d.stage === params.stage);
    }

    if (params.ownerId && params.ownerId !== 'All') {
      list = list.filter(d => d.ownerId === params.ownerId);
    }

    if (params.companyId) {
      list = list.filter(d => d.companyId === params.companyId);
    }

    if (params.minAmount !== undefined) {
      list = list.filter(d => d.value >= (params.minAmount ?? 0));
    }

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    list.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return simulateNetworkLatency({
      success: true,
      data: list,
      meta: {
        total: list.length,
      },
    });
  },

  async getDealById(id: string): Promise<ApiResponse<Deal>> {
    const deal = mockDb.getDealById(id);
    if (!deal) throw new Error(`Deal ${id} not found`);
    return simulateNetworkLatency({
      success: true,
      data: deal,
    });
  },

  async createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Promise<ApiResponse<Deal>> {
    const created = mockDb.createDeal(data);
    return simulateNetworkLatency({
      success: true,
      data: created,
      message: 'Deal created successfully',
    });
  },

  async updateDeal(id: string, updates: Partial<Deal>): Promise<ApiResponse<Deal>> {
    const updated = mockDb.updateDeal(id, updates);
    return simulateNetworkLatency({
      success: true,
      data: updated,
      message: 'Deal updated successfully',
    });
  },

  async updateDealStage(id: string, stage: DealStage): Promise<ApiResponse<Deal>> {
    // Automatically adjust probability based on stage
    const probabilities: Record<DealStage, number> = {
      New: 20,
      Qualified: 40,
      Proposal: 60,
      Negotiation: 80,
      Won: 100,
      Lost: 0,
    };

    const updated = mockDb.updateDeal(id, {
      stage,
      probability: probabilities[stage],
    });

    // Automatically log activity when deal stage advances
    mockDb.createActivity({
      type: 'Note',
      title: `Deal Stage Changed: ${updated.name}`,
      description: `Stage progressed to ${stage} (${probabilities[stage]}% win probability).`,
      performedById: updated.ownerId,
      performedByName: updated.ownerName,
      occurredAt: new Date().toISOString(),
      relatedDealId: updated.id,
      relatedDealName: updated.name,
      relatedCompanyId: updated.companyId,
      relatedCompanyName: updated.companyName,
    });

    return simulateNetworkLatency({
      success: true,
      data: updated,
      message: `Deal moved to ${stage}`,
    });
  },

  async deleteDeal(id: string): Promise<ApiResponse<{ id: string }>> {
    mockDb.deleteDeal(id);
    return simulateNetworkLatency({
      success: true,
      data: { id },
      message: 'Deal deleted successfully',
    });
  },
};
