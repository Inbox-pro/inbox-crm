import { Task, TaskPriority, TaskStatus } from '../types';
import { mockDb } from '../mock/db';
import { ApiResponse, simulateNetworkLatency } from './api';
import { isDateInRange } from '../utils/dateFilter';

export interface TaskFilterParams {
  search?: string;
  status?: TaskStatus | 'All';
  priority?: TaskPriority | 'All';
  assignedToId?: string | 'All';
  dateRange?: string;
  relatedLeadId?: string;
  relatedContactId?: string;
  relatedDealId?: string;
  relatedCompanyId?: string;
  page?: number;
  pageSize?: number;
}

export const tasksService = {
  async getTasks(params: TaskFilterParams = {}): Promise<ApiResponse<Task[]>> {
    let list = mockDb.getTasks();

    if (params.dateRange && params.dateRange !== 'All') {
      list = list.filter(t => isDateInRange(t.dueDate || t.createdAt, params.dateRange!));
    }

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.assignedToName.toLowerCase().includes(q)
      );
    }

    if (params.status && params.status !== 'All') {
      list = list.filter(t => t.status === params.status);
    }

    if (params.priority && params.priority !== 'All') {
      list = list.filter(t => t.priority === params.priority);
    }

    if (params.assignedToId && params.assignedToId !== 'All') {
      list = list.filter(t => t.assignedToId === params.assignedToId);
    }

    if (params.relatedLeadId) {
      list = list.filter(t => t.relatedLeadId === params.relatedLeadId);
    }

    if (params.relatedContactId) {
      list = list.filter(t => t.relatedContactId === params.relatedContactId);
    }

    if (params.relatedDealId) {
      list = list.filter(t => t.relatedDealId === params.relatedDealId);
    }

    if (params.relatedCompanyId) {
      list = list.filter(t => t.relatedCompanyId === params.relatedCompanyId);
    }

    // Sort by due date
    list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

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

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    const task = mockDb.getTaskById(id);
    if (!task) throw new Error(`Task ${id} not found`);
    return simulateNetworkLatency({
      success: true,
      data: task,
    });
  },

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): Promise<ApiResponse<Task>> {
    const created = mockDb.createTask(data);
    return simulateNetworkLatency({
      success: true,
      data: created,
      message: 'Task created successfully',
    });
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    const updated = mockDb.updateTask(id, updates);
    return simulateNetworkLatency({
      success: true,
      data: updated,
      message: 'Task updated successfully',
    });
  },

  async toggleTaskComplete(id: string): Promise<ApiResponse<Task>> {
    const task = mockDb.getTaskById(id);
    if (!task) throw new Error('Task not found');
    const newStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    const updated = mockDb.updateTask(id, { status: newStatus });
    return simulateNetworkLatency({
      success: true,
      data: updated,
      message: newStatus === 'Completed' ? 'Task completed' : 'Task marked pending',
    });
  },

  async deleteTask(id: string): Promise<ApiResponse<{ id: string }>> {
    mockDb.deleteTask(id);
    return simulateNetworkLatency({
      success: true,
      data: { id },
      message: 'Task deleted successfully',
    });
  },
};
