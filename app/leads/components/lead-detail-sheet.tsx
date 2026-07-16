'use client';

import { useState } from 'react';
import { ExternalLink, Globe, Mail, Phone, Sparkles, UserPlus, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useLead } from '@/lib/hooks/use-leads';
import { money, shortDate, timeAgo, EVENT_LABEL } from '@/lib/format';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function LeadDetailSheet({
  leadId,
  onClose,
  onChanged,
}: {
  leadId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { data: lead, loading, refetch } = useLead(leadId);
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try {
      await fn();
      toast.success(`${label} done`);
      refetch();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `${label} failed`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet open={Boolean(leadId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {loading || !lead ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 flex-wrap">
                {lead.businessName} <StatusBadge status={lead.status} />
              </SheetTitle>
              <SheetDescription>
                {[lead.category, lead.city, lead.state].filter(Boolean).join(' · ') || 'No details'}
              </SheetDescription>
            </SheetHeader>

            <div className="px-4 pb-6 space-y-5">
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={busy !== null}
                  onClick={() => act('Enrich', () => api.enricher.run(lead.id))}>
                  <Sparkles className="size-3.5" /> Enrich
                </Button>
                <Button size="sm" variant="outline" disabled={busy !== null}
                  onClick={() => act('Generate site', () => api.sites.generate(lead.id))}>
                  <Zap className="size-3.5" /> Generate site
                </Button>
                <Button size="sm" variant="outline" disabled={busy !== null}
                  onClick={() => act('Start outreach', () => api.outreach.start({ leadId: lead.id }))}>
                  <Mail className="size-3.5" /> Start outreach
                </Button>
                {!lead.client && (
                  <Button size="sm" variant="outline" disabled={busy !== null}
                    onClick={() => act('Convert to client', () => api.clients.create({ leadId: lead.id, plan: 'WEBSITE_ONLY' }))}>
                    <UserPlus className="size-3.5" /> Convert to client
                  </Button>
                )}
              </div>

              <Separator />

              {/* Details */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground flex items-center gap-1.5"><Phone className="size-3.5" /> Phone</dt>
                <dd>{lead.phone ?? '—'}</dd>
                <dt className="text-muted-foreground flex items-center gap-1.5"><Mail className="size-3.5" /> Email</dt>
                <dd className="truncate">{lead.email ?? '—'}</dd>
                <dt className="text-muted-foreground flex items-center gap-1.5"><Globe className="size-3.5" /> Website</dt>
                <dd className="truncate">
                  {lead.websiteUrl ? (
                    <a href={lead.websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {lead.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  ) : 'None'}
                </dd>
                <dt className="text-muted-foreground">Address</dt>
                <dd>{[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', ') || '—'}</dd>
                <dt className="text-muted-foreground">Rating</dt>
                <dd>{lead.googleRating != null ? `${Number(lead.googleRating).toFixed(1)} ★ (${lead.googleReviewCount ?? 0} reviews)` : '—'}</dd>
                <dt className="text-muted-foreground">Created</dt>
                <dd>{shortDate(lead.createdAt)}</dd>
              </dl>

              {/* Client */}
              {lead.client && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <h3 className="font-medium mb-1.5">Client</h3>
                    <p className="flex items-center gap-2">
                      <Badge>{lead.client.plan}</Badge>
                      <span className="tabular-nums">{money(lead.client.mrr)}/mo</span>
                      {lead.client.churnedAt && <Badge variant="destructive">Churned</Badge>}
                    </p>
                  </div>
                </>
              )}

              {/* Generated site */}
              {(lead.generatedSites?.length ?? 0) > 0 && (
                <>
                  <Separator />
                  <div className="text-sm space-y-1.5">
                    <h3 className="font-medium">Generated site</h3>
                    {lead.generatedSites!.map((site) => (
                      <div key={site.id} className="flex items-center justify-between gap-2">
                        <span className="truncate text-muted-foreground">{site.subdomain}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <Badge variant={site.isClaimed ? 'default' : 'secondary'}>
                            {site.isClaimed ? 'Claimed' : 'Unclaimed'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{site.visitCount} visits</span>
                          {site.deployUrl && (
                            <a href={site.deployUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="size-3.5 text-primary" />
                            </a>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Outreach history */}
              {(lead.outreachSteps?.length ?? 0) > 0 && (
                <>
                  <Separator />
                  <div className="text-sm space-y-1.5">
                    <h3 className="font-medium">Outreach</h3>
                    {lead.outreachSteps!.map((step) => (
                      <div key={step.id} className="flex items-center justify-between">
                        <span className="text-muted-foreground">Step {step.stepNumber}</span>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline">{step.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {step.repliedAt ? `replied ${timeAgo(step.repliedAt)}`
                              : step.openedAt ? `opened ${timeAgo(step.openedAt)}`
                              : step.sentAt ? `sent ${timeAgo(step.sentAt)}`
                              : `scheduled ${shortDate(step.scheduledAt)}`}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Timeline */}
              <Separator />
              <div className="text-sm">
                <h3 className="font-medium mb-1.5">Timeline</h3>
                {(lead.analyticsEvents?.length ?? 0) === 0 ? (
                  <EmptyState title="No events yet" />
                ) : (
                  <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {lead.analyticsEvents!.map((event) => (
                      <li key={event.id} className="flex items-center justify-between">
                        <span>{EVENT_LABEL[event.eventType] ?? event.eventType}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(event.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
