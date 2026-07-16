'use client';

import { api } from '../api-client';
import type { Lead, LeadFilters, LeadStats } from '../types';
import { useApi, type ApiState } from './use-api';

export function useLeads(filters: LeadFilters): ApiState<Lead[]> {
  return useApi(() => api.leads.list(filters), [JSON.stringify(filters)]);
}

export function useLead(id: string | null): ApiState<Lead> {
  return useApi(
    () => (id ? api.leads.get(id) : Promise.resolve({ data: null as unknown as Lead })),
    [id],
  );
}

export function useLeadStats(): ApiState<LeadStats> {
  return useApi(() => api.leads.stats(), []);
}
