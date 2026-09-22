import { Company } from '../types';
import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';

export interface CompanyFilterParams {
  search?: string;
  industry?: string;
  status?: string;
  ownerId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Company;
  sortOrder?: 'asc' | 'desc';
}

export const companiesService = {
  async getCompanies(params: CompanyFilterParams = {}): Promise<ApiResponse<Company[]>> {
    let list = mockDb.getCompanies();

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    if (params.industry && params.industry !== 'All') {
      list = list.filter(c => c.industry === params.industry);
    }

    if (params.status && params.status !== 'All') {
      list = list.filter(c => c.status === params.status);
    }

    if (params.ownerId && params.ownerId !== 'All') {
      list = list.filter(c => c.ownerId === params.ownerId);
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

  async getCompanyById(id: string): Promise<ApiResponse<Company>> {
    const company = mockDb.getCompanyById(id);
    if (!company) throw new Error(`Company ${id} not found`);
    return simulateNetworkLatency({
      success: true,
      data: company,
    });
  },

  async createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Promise<ApiResponse<Company>> {
    const created = mockDb.createCompany(data);
    return simulateNetworkLatency({
      success: true,
      data: created,
      message: 'Company created successfully',
    });
  },

  async updateCompany(id: string, updates: Partial<Company>): Promise<ApiResponse<Company>> {
    const updated = mockDb.updateCompany(id, updates);
    return simulateNetworkLatency({
      success: true,
      data: updated,
      message: 'Company updated successfully',
    });
  },

  async deleteCompany(id: string): Promise<ApiResponse<{ id: string }>> {
    mockDb.deleteCompany(id);
    return simulateNetworkLatency({
      success: true,
      data: { id },
      message: 'Company deleted successfully',
    });
  },
};
