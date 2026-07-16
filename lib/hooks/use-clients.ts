'use client';

import { api } from '../api-client';
import type { Client, ClientStats } from '../types';
import { useApi, type ApiState } from './use-api';

export function useClients(page = 1, limit = 50): ApiState<Client[]> {
  return useApi(() => api.clients.list(page, limit), [page, limit]);
}

export function useClient(id: string | null): ApiState<Client> {
  return useApi(
    () => (id ? api.clients.get(id) : Promise.resolve({ data: null as unknown as Client })),
    [id],
  );
}

export function useClientStats(): ApiState<ClientStats> {
  return useApi(() => api.clients.stats(), []);
}
