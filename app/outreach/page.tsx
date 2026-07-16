'use client';

import { useMemo } from 'react';
import { CheckCircle2, Circle, Mail, MailOpen, MousePointerClick, Pause, Play, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useOutreachSequences, useOutreachStats } from '@/lib/hooks/use-outreach';
import { timeAgo } from '@/lib/format';
import type { Lead, OutreachStep } from '@/lib/types';
import { StatsCard } from '@/components/shared/stats-card';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function OutreachPage() {
  const stats = useOutreachStats();
  const sequences = useOutreachSequences();

  const replied = useMemo(
    () => (sequences.data ?? []).filter((lead) => lead.outreachSteps?.some((s) => s.repliedAt)),
    [sequences.data],
  );

  const control = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      toast.success(label);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Outreach</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => control('Queue paused', api.outreach.pause)}>
            <Pause className="size-3.5" /> Pause
          </Button>
          <Button size="sm" variant="outline" onClick={() => control('Queue resumed', api.outreach.resume)}>
            <Play className="size-3.5" /> Resume
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatsCard label="Sent" value={stats.data?.sent ?? 0} icon={Mail} loading={stats.loading} />
        <StatsCard label="Scheduled" value={stats.data?.scheduled ?? 0} icon={Circle} loading={stats.loading} />
        <StatsCard label="Opened" value={`${stats.data?.openRate ?? 0}%`} hint={`${stats.data?.opened ?? 0} opens`} icon={MailOpen} loading={stats.loading} />
        <StatsCard label="Clicked" value={`${stats.data?.clickRate ?? 0}%`} hint={`${stats.data?.clicked ?? 0} clicks`} icon={MousePointerClick} loading={stats.loading} />
        <StatsCard label="Replied" value={`${stats.data?.replyRate ?? 0}%`} hint={`${stats.data?.replied ?? 0} replies`} icon={Reply} loading={stats.loading} />
      </div>

      <Tabs defaultValue="sequences">
        <TabsList>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="inbox">Reply inbox {replied.length > 0 && `(${replied.length})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="sequences">
          <Card className="py-0">
            <CardContent className="px-0">
              {sequences.loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : !sequences.data?.length ? (
                <EmptyState title="No sequences yet" description="Start outreach from the Leads page." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Steps (1–4)</TableHead>
                      <TableHead className="text-right">Last activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sequences.data.map((lead) => (
                      <SequenceRow key={lead.id} lead={lead} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox">
          {replied.length === 0 ? (
            <EmptyState icon={Reply} title="No replies yet" description="Replies from leads will appear here." />
          ) : (
            <div className="space-y-3">
              {replied.map((lead) => {
                const step = lead.outreachSteps?.find((s) => s.repliedAt);
                return (
                  <Card key={lead.id} className="py-4">
                    <CardContent className="px-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{lead.businessName}</p>
                        <span className="text-xs text-muted-foreground">{step?.repliedAt ? timeAgo(step.repliedAt) : ''}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                      {step?.body && <p className="text-sm border-l-2 pl-3 italic">{step.body}</p>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StepDot({ step }: { step: OutreachStep | undefined }) {
  if (!step) return <Circle className="size-4 text-muted-foreground/30" />;
  if (step.repliedAt) return <CheckCircle2 className="size-4 text-emerald-500" aria-label="replied" />;
  if (step.clickedAt) return <MousePointerClick className="size-4 text-cyan-500" aria-label="clicked" />;
  if (step.openedAt) return <MailOpen className="size-4 text-amber-500" aria-label="opened" />;
  if (step.sentAt) return <Mail className="size-4 text-primary" aria-label="sent" />;
  return (
    <Circle
      className={cn('size-4', step.status === 'CANCELLED' ? 'text-muted-foreground/30' : 'text-muted-foreground')}
      aria-label={step.status.toLowerCase()}
    />
  );
}

function SequenceRow({ lead }: { lead: Lead }) {
  const steps = lead.outreachSteps ?? [];
  const lastActivity = steps
    .flatMap((s) => [s.repliedAt, s.clickedAt, s.openedAt, s.sentAt])
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  return (
    <TableRow>
      <TableCell className="font-medium">{lead.businessName}</TableCell>
      <TableCell><StatusBadge status={lead.status} /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((n) => (
            <StepDot key={n} step={steps.find((s) => s.stepNumber === n)} />
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        {lastActivity ? timeAgo(lastActivity) : '—'}
      </TableCell>
    </TableRow>
  );
}
