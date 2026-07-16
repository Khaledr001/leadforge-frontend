/** API types mirroring the LeadForge backend responses. */

export type LeadStatus =
  | 'NEW' | 'ENRICHED' | 'SITE_BUILT' | 'CONTACTED' | 'REPLIED'
  | 'DEMO_BOOKED' | 'CLOSED_WON' | 'CLOSED_LOST' | 'UNSUBSCRIBED';

export type ClientPlan = 'WEBSITE_ONLY' | 'WEBSITE_PLUS_VOICE' | 'FULL_PACKAGE';
export type OutreachStepStatus = 'SCHEDULED' | 'SENT' | 'FAILED' | 'CANCELLED';
export type SocialPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'GOOGLE';

export interface Lead {
  id: string;
  businessName: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  googleRating: string | number | null;
  googleReviewCount: number | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  generatedSites?: GeneratedSite[];
  outreachSteps?: OutreachStep[];
  client?: Client | null;
  analyticsEvents?: AnalyticsEvent[];
}

export interface GeneratedSite {
  id: string;
  leadId: string;
  templateId: string;
  subdomain: string;
  deployUrl: string | null;
  isClaimed: boolean;
  claimedAt: string | null;
  visitCount: number;
  lastVisitedAt: string | null;
  createdAt: string;
  lead?: Lead;
}

export interface OutreachStep {
  id: string;
  leadId: string;
  stepNumber: number;
  scheduledAt: string;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  repliedAt: string | null;
  subject: string | null;
  body: string | null;
  status: OutreachStepStatus;
}

export interface Client {
  id: string;
  leadId: string;
  stripeCustomerId: string | null;
  plan: ClientPlan;
  mrr: number;
  startedAt: string;
  churnedAt: string | null;
  lead?: Lead;
  aiServices?: AiService[];
  socialPosts?: SocialPost[];
}

export interface AiService {
  id: string;
  serviceType: 'AI_RECEPTIONIST' | 'SOCIAL_MEDIA_AGENT' | 'GBP_OPTIMIZATION';
  isActive: boolean;
  monthlyCost: number;
  monthlyPrice: number;
  vapiAssistantId: string | null;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'POSTED' | 'FAILED';
  scheduledFor: string | null;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  leadId: string | null;
  eventType: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  lead?: { id: string; businessName: string } | null;
}

export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byCity: { city: string; count: number }[];
  noWebsite: number;
}

export interface OutreachStats {
  scheduled: number; sent: number; opened: number; clicked: number;
  replied: number; failed: number; cancelled: number;
  openRate: number; clickRate: number; replyRate: number;
}

export interface ClientStats {
  total: number;
  active: number;
  churned: number;
  mrr: number;
  byPlan: Record<ClientPlan, number>;
}

export interface Meta {
  total: number;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  data: T[];
  meta: Meta;
}

export interface LeadFilters {
  city?: string;
  category?: string;
  status?: LeadStatus | '';
  hasWebsite?: '' | 'true' | 'false';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
