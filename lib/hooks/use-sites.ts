'use client';

import { api } from '../api-client';
import type { GeneratedSite } from '../types';
import { useApi, type ApiState } from './use-api';

export function useSites(page = 1, limit = 50): ApiState<GeneratedSite[]> {
  return useApi(() => api.sites.list(page, limit), [page, limit]);
}
