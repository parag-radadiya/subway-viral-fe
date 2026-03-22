import api from "./api";
import {
  ApiResponse,
  InventoryItem,
  InventoryQuery,
  InventoryAuditLog,
} from "../utils/types";

export const inventoryApi = {
  // ─── Items ─────────────────────────────────────────────────────────────────
  
  getItems: async (params?: {
    shop_id?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const response = await api.get<ApiResponse<{ items: InventoryItem[]; total: number }>>(
      "/inventory/items",
      { params }
    );
    return response.data.data;
  },

  getItemById: async (id: string) => {
    const response = await api.get<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/items/${id}`
    );
    return response.data.data.item;
  },

  createItem: async (data: Partial<InventoryItem>) => {
    const response = await api.post<ApiResponse<{ item: InventoryItem }>>(
      "/inventory/items",
      data
    );
    return response.data.data.item;
  },

  updateItem: async (id: string, data: Partial<InventoryItem>) => {
    const response = await api.put<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/items/${id}`,
      data
    );
    return response.data.data.item;
  },

  deleteItem: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/inventory/items/${id}`);
    return response.data;
  },

  // ─── Queries ───────────────────────────────────────────────────────────────

  getQueries: async (params?: {
    shop_id?: string;
    item_id?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const response = await api.get<ApiResponse<{ queries: InventoryQuery[]; total: number }>>(
      "/inventory/queries",
      { params }
    );
    return response.data.data;
  },

  getQueryById: async (id: string) => {
    const response = await api.get<ApiResponse<{ query: InventoryQuery }>>(
      `/inventory/queries/${id}`
    );
    return response.data.data.query;
  },

  openQuery: async (data: { item_id: string; issue_note: string }) => {
    const response = await api.post<ApiResponse<{ query: InventoryQuery }>>(
      "/inventory/queries",
      data
    );
    return response.data.data.query;
  },

  closeQuery: async (
    id: string,
    data: { repair_cost: number; resolve_note: string }
  ) => {
    const response = await api.put<ApiResponse<{ query: InventoryQuery }>>(
      `/inventory/queries/${id}/close`,
      data
    );
    return response.data.data.query;
  },

  // ─── Audit Logs ────────────────────────────────────────────────────────────

  getAuditLogs: async (params?: {
    shop_id?: string;
    item_id?: string;
    query_id?: string;
    action?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const response = await api.get<ApiResponse<{ logs: InventoryAuditLog[]; total: number }>>(
      "/inventory/audit-logs",
      { params }
    );
    return response.data.data;
  },
};
