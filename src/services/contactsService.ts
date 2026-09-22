import { Contact } from '../types';
import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';

export interface ContactFilterParams {
  search?: string;
  companyId?: string;
  status?: string;
  ownerId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Contact;
  sortOrder?: 'asc' | 'desc';
}

export const contactsService = {
  async getContacts(params: ContactFilterParams = {}): Promise<ApiResponse<Contact[]>> {
    let list = mockDb.getContacts();

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.companyName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.jobTitle.toLowerCase().includes(q)
      );
    }

    if (params.companyId) {
      list = list.filter(c => c.companyId === params.companyId);
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

  async getContactById(id: string): Promise<ApiResponse<Contact>> {
    const contact = mockDb.getContactById(id);
    if (!contact) throw new Error(`Contact ${id} not found`);
    return simulateNetworkLatency({
      success: true,
      data: contact,
    });
  },

  async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Promise<ApiResponse<Contact>> {
    const created = mockDb.createContact(data);
    return simulateNetworkLatency({
      success: true,
      data: created,
      message: 'Contact created successfully',
    });
  },

  async updateContact(id: string, updates: Partial<Contact>): Promise<ApiResponse<Contact>> {
    const updated = mockDb.updateContact(id, updates);
    return simulateNetworkLatency({
      success: true,
      data: updated,
      message: 'Contact updated successfully',
    });
  },

  async deleteContact(id: string): Promise<ApiResponse<{ id: string }>> {
    mockDb.deleteContact(id);
    return simulateNetworkLatency({
      success: true,
      data: { id },
      message: 'Contact deleted successfully',
    });
  },
};
