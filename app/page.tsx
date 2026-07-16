'use client';

import { useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, Building2, DollarSign, Globe, Mail, MailOpen, Reply, Search, Users, Zap,
} from 'lucide-react';
import { format, subMonths, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useApi } from '@/lib/hooks/use-api';
import { useLeadStats } from '@/lib/hooks/use-leads';
import { useOutreachStats } from '@/lib/hooks/use-outreach';
import { useClients, useClientStats } from '@/lib/hooks/use-clients';
import { useSites } from '@/lib/hooks/use-sites';
import { money, timeAgo, EVENT_LABEL } from '@/lib/format';
import { StatsCard } from '@/components/shared/stats-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const FUNNEL: { key: string; label: string }[] = [
  { key: 'NEW', label: 'New' },
  { key: 'ENRICHED', label: 'Enriched' },
  { key: 'SITE_BUILT', label: 'Site Built' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'REPLIED', label: 'Replied' },
  { key: 'CLOSED_WON', label: 'Won' },
];

export default function DashboardPage() {
  const leadStats = useLeadStats();
  const outreach = useOutreachStats();
  const clientStats = useClientStats();
  const sites = useSites(1, 1);
  const clients = useClients(1, 100);
  const events = useApi(() => api.analytics.events(20), []);

  const byStatus = leadStats.data?.byStatus;
  const funnelData = useMemo(
    () =>
      FUNNEL.map(({ key, label }) => ({
        name: label,
        count: byStatus?.[key as keyof typeof byStatus] ?? 0,
      })),
    [byStatus],
  );

  const mrrTrend = useMemo(() => {
    const list = clients.data ?? [];
    return Array.from({ length: 12 }, (_, i) => {
      const monthEnd = endOfMonth(subMonths(new Date(), 11 - i));
      const mrr = list.reduce((sum, c) => {
        const started = new Date(c.startedAt) <= monthEnd;
        const stillActive = !c.churnedAt || new Date(c.churnedAt) > monthEnd;
        return started && stillActive ? sum + c.mrr : sum;
      }, 0);
      return { name: format(monthEnd, 'MMM'), mrr: mrr / 100 };
    });
  }, [clients.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <QuickActions />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatsCard label="Total Leads" value={leadStats.data?.total ?? 0} icon={Users} loading={leadStats.loading} />
        <StatsCard label="Sites" value={sites.meta?.total ?? 0} icon={Globe} loading={sites.loading} />
        <StatsCard label="Emails Sent" value={outreach.data?.sent ?? 0} icon={Mail} loading={outreach.loading} />
        <StatsCard label="Open Rate" value={`${outreach.data?.openRate ?? 0}%`} icon={MailOpen} loading={outreach.loading} />
        <StatsCard label="Reply Rate" value={`${outreach.data?.replyRate ?? 0}%`} icon={Reply} loading={outreach.loading} />
        <StatsCard label="Active Clients" value={clientStats.data?.active ?? 0} icon={Building2} loading={clientStats.loading} />
        <StatsCard label="MRR" value={money(clientStats.data?.mrr ?? 0)} icon={DollarSign} loading={clientStats.loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Leads Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {leadStats.loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'var(--muted)' }} />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">MRR Trend (12 months)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {clients.loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrTrend} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'MRR']} />
                  <Area type="monotone" dataKey="mrr" stroke="var(--chart-2)" strokeWidth={2} fill="url(#mrrFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="size-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
            </div>
          ) : !events.data?.length ? (
            <EmptyState title="No activity yet" description="Scrape leads and start outreach to see events here." />
          ) : (
            <ul className="divide-y">
              {events.data.map((event) => (
                <li key={event.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <span className="font-medium">{EVENT_LABEL[event.eventType] ?? event.eventType}</span>
                    {event.lead && <span className="text-muted-foreground"> · {event.lead.businessName}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-3">{timeAgo(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActions() {
  const [scrapeOpen, setScrapeOpen] = useState(false);
  const [query, setQuery] = useState('plumbers in Austin TX');
  const [busy, setBusy] = useState(false);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      toast.success(`${label} started`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${label} failed`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={scrapeOpen} onOpenChange={setScrapeOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Search className="size-4" /> Scrape new leads
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scrape leads</DialogTitle>
          </DialogHeader>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='e.g. "plumbers in Austin TX"' />
          <DialogFooter>
            <Button
              disabled={busy || !query.trim()}
              onClick={() =>
                run('Scrape', () => api.scraper.run({ query, maxResults: 20 })).then(() => setScrapeOpen(false))
              }
            >
              Run scraper
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="outline" disabled={busy}
        onClick={() => run('Site generation', () => api.sites.batchGenerate({ limit: 5 }))}>
        <Zap className="size-4" /> Generate sites
      </Button>
      <Button size="sm" variant="outline" disabled={busy}
        onClick={() => run('Outreach', () => api.outreach.start({ limit: 10 }))}>
        <Mail className="size-4" /> Start outreach
      </Button>
    </div>
  );
}
