'use client';

import { api } from '../api-client';
import type { Lead, OutreachStats } from '../types';
import { useApi, type ApiState } from './use-api';

export function useOutreachStats(): ApiState<OutreachStats> {
  return useApi(() => api.outreach.stats(), []);
}

export function useOutreachSequences(): ApiState<Lead[]> {
  return useApi(() => api.outreach.sequences(), []);
}
