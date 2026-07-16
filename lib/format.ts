import { format, formatDistanceToNow } from 'date-fns';
import type { LeadStatus } from './types';

export const money = (cents: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);

export const shortDate = (iso: string | null | undefined): string =>
  iso ? format(new Date(iso), 'MMM d, yyyy') : '—';

export const timeAgo = (iso: string | null | undefined): string =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : '—';

export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: 'New',
  ENRICHED: 'Enriched',
  SITE_BUILT: 'Site Built',
  CONTACTED: 'Contacted',
  REPLIED: 'Replied',
  DEMO_BOOKED: 'Demo Booked',
  CLOSED_WON: 'Won',
  CLOSED_LOST: 'Lost',
  UNSUBSCRIBED: 'Unsubscribed',
};

export const STATUS_CLASS: Record<LeadStatus, string> = {
  NEW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  ENRICHED: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  SITE_BUILT: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  CONTACTED: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  REPLIED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  DEMO_BOOKED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  CLOSED_WON: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  CLOSED_LOST: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  UNSUBSCRIBED: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

export const EVENT_LABEL: Record<string, string> = {
  lead_enriched: 'Lead enriched',
  site_generated: 'Site generated',
  email_sent: 'Email sent',
  email_open: 'Email opened',
  email_click: 'Link clicked',
  checkout_completed: 'Checkout completed',
  invoice_paid: 'Invoice paid',
  subscription_churned: 'Subscription churned',
  vapi_call: 'Receptionist call',
};
