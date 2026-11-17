/**
 * Centralized API Client Layer
 *
 * Provides typed responses, base URL configuration, and authenticated header helpers.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || '/api';

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('inbox_crm_auth_token_v2');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Small configurable simulated network latency (50-100ms) for realistic loading state demonstration
export const simulateNetworkLatency = <T>(result: T, delayMs: number = 60): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, delayMs);
  });
};
