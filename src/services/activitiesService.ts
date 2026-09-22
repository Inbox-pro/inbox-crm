import { Activity, ActivityType } from '../types';
import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';
import { isDateInRange } from '../utils/dateFilter';

export interface ActivityFilterParams {
  type?: ActivityType | 'All';
  search?: string;
  dateRange?: string;
  relatedLeadId?: string;
  relatedContactId?: string;
  relatedCompanyId?: string;
  relatedDealId?: string;
  performedById?: string;
  page?: number;
  pageSize?: number;
}

export const activitiesService = {
  async getActivities(params: ActivityFilterParams = {}): Promise<ApiResponse<Activity[]>> {
    let list = mockDb.getActivities();

    if (params.dateRange && params.dateRange !== 'All') {
      list = list.filter(a => isDateInRange(a.occurredAt, params.dateRange!));
    }

    if (params.type && params.type !== 'All') {
      list = list.filter(a => a.type === params.type);
    }

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.performedByName.toLowerCase().includes(q)
      );
    }

    if (params.relatedLeadId) {
      list = list.filter(a => a.relatedLeadId === params.relatedLeadId);
    }

    if (params.relatedContactId) {
      list = list.filter(a => a.relatedContactId === params.relatedContactId);
    }

    if (params.relatedCompanyId) {
      list = list.filter(a => a.relatedCompanyId === params.relatedCompanyId);
    }

    if (params.relatedDealId) {
      list = list.filter(a => a.relatedDealId === params.relatedDealId);
    }

    if (params.performedById && params.performedById !== 'All') {
      list = list.filter(a => a.performedById === params.performedById);
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    const total = list.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }

    return simulateNetworkLatency({
      success: true,
      data: list,
      meta: {
        total,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
  },

  async createActivity(data: Omit<Activity, 'id' | 'organizationId'>): Promise<ApiResponse<Activity>> {
    const created = mockDb.createActivity(data);
    return simulateNetworkLatency({
      success: true,
      data: created,
      message: 'Activity recorded successfully',
    });
  },
};
