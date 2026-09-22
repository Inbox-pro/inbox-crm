/**
 * Centralized API Client Layer
 *
 * In this stage, all requests are routed through this simulated service
 * layer with realistic async promise resolution.
 *
 * In production with Express + MongoDB:
 * Replace the mockDb calls with standard `fetch(`${API_BASE_URL}/api/...`)`
 * or axios requests without needing to change any component UI code.
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

// Small configurable simulated network latency (50-100ms) for realistic loading state demonstration
export const simulateNetworkLatency = <T>(result: T, delayMs: number = 60): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(result);
    }, delayMs);
  });
};
