import type {
  AnalyticsEvent, Client, ClientPlan, ClientStats, GeneratedSite, Lead,
  LeadFilters, LeadStats, OutreachStats, SocialPlatform,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | ''>;
}

/** Typed fetch wrapper. Unwraps the backend's { data, meta } envelope. */
export async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<{ data: T; meta?: { total: number; page?: number; limit?: number } }> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(json.message) ? json.message.join('; ') : (json.message ?? res.statusText);
    throw new ApiError(res.status, message);
  }
  // Envelope: { data, meta? }. Raw endpoints (DELETE, health) return the body itself.
  if (json && typeof json === 'object' && 'data' in json) {
    return json as { data: T; meta?: { total: number; page?: number; limit?: number } };
  }
  return { data: json as T };
}

export const api = {
  health: () => fetchApi<{ status: string }>('/health'),

  leads: {
    list: (filters: LeadFilters) => fetchApi<Lead[]>('/leads', { params: { ...filters } }),
    get: (id: string) => fetchApi<Lead>(`/leads/${id}`),
    stats: () => fetchApi<LeadStats>('/leads/stats'),
    create: (data: Partial<Lead>) => fetchApi<Lead>('/leads', { method: 'POST', body: data }),
    update: (id: string, data: Partial<Lead>) => fetchApi<Lead>(`/leads/${id}`, { method: 'PATCH', body: data }),
    remove: (id: string) => fetchApi<{ success: boolean }>(`/leads/${id}`, { method: 'DELETE' }),
  },

  scraper: {
    run: (data: { query: string; maxResults?: number; mode?: 'api' | 'outscraper' }) =>
      fetchApi<{ found: number; new: number; withoutWebsite: number; duplicatesSkipped: number }>('/scraper/run', { method: 'POST', body: data }),
  },

  enricher: {
    run: (leadId: string) => fetchApi<unknown>('/enricher/run', { method: 'POST', body: { leadId } }),
    batch: (data: { city?: string; category?: string; limit?: number }) =>
      fetchApi<{ matched: number; processed: number; emailsFound: number }>('/enricher/batch', { method: 'POST', body: data }),
  },

  sites: {
    list: (page = 1, limit = 50) => fetchApi<GeneratedSite[]>('/sites', { params: { page, limit } }),
    get: (id: string) => fetchApi<GeneratedSite>(`/sites/${id}`),
    generate: (leadId: string) => fetchApi<GeneratedSite>('/sites/generate', { method: 'POST', body: { leadId } }),
    batchGenerate: (data: { city?: string; category?: string; limit?: number }) =>
      fetchApi<unknown>('/sites/generate-batch', { method: 'POST', body: data }),
    remove: (id: string) => fetchApi<{ success: boolean }>(`/sites/${id}`, { method: 'DELETE' }),
  },

  outreach: {
    start: (data: { leadId?: string; city?: string; category?: string; limit?: number }) =>
      fetchApi<unknown>('/outreach/start', { method: 'POST', body: data }),
    stats: () => fetchApi<OutreachStats>('/outreach/stats'),
    sequences: () => fetchApi<Lead[]>('/outreach/sequences'),
    pause: () => fetchApi<{ paused: boolean }>('/outreach/pause', { method: 'POST' }),
    resume: () => fetchApi<{ resumed: boolean }>('/outreach/resume', { method: 'POST' }),
  },

  clients: {
    list: (page = 1, limit = 50) => fetchApi<Client[]>('/clients', { params: { page, limit } }),
    get: (id: string) => fetchApi<Client>(`/clients/${id}`),
    stats: () => fetchApi<ClientStats>('/clients/stats'),
    create: (data: { leadId: string; plan: ClientPlan }) => fetchApi<Client>('/clients', { method: 'POST', body: data }),
    socialGenerate: (data: { clientId: string; count: number; platform: SocialPlatform }) =>
      fetchApi<SocialPlatform[]>('/ai-services/social/generate', { method: 'POST', body: data }),
  },

  analytics: {
    events: (limit = 20) => fetchApi<AnalyticsEvent[]>('/analytics/events', { params: { limit } }),
  },
};
