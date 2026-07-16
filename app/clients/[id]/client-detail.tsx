'use client';

import Link from 'next/link';
import { ArrowLeft, Bot, Megaphone, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useClient } from '@/lib/hooks/use-clients';
import { money, shortDate } from '@/lib/format';
import { EmptyState } from '@/components/shared/empty-state';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SERVICE_LABEL: Record<string, string> = {
  AI_RECEPTIONIST: 'AI Receptionist',
  SOCIAL_MEDIA_AGENT: 'Social Media Agent',
  GBP_OPTIMIZATION: 'GBP Optimization',
};

export function ClientDetail({ id }: { id: string }) {
  const { data: client, loading, error, refetch } = useClient(id);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error || !client) {
    return <EmptyState title="Client not found" description={error ?? undefined} />;
  }

  const activeServices = client.aiServices?.filter((s) => s.isActive) ?? [];

  const setupReceptionist = async () => {
    try {
      await api.clients.socialGenerate({ clientId: client.id, count: 5, platform: 'FACEBOOK' });
      toast.success('5 Facebook posts generated');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients"><ArrowLeft className="size-4" /> Back</Link>
        </Button>
        <h1 className="text-xl font-semibold">{client.lead?.businessName ?? 'Client'}</h1>
        {client.churnedAt
          ? <Badge variant="destructive">Churned {shortDate(client.churnedAt)}</Badge>
          : <Badge className="bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-300">Active</Badge>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Plan" value={client.plan.replace(/_/g, ' ')} />
        <StatsCard label="MRR" value={money(client.mrr)} />
        <StatsCard label="Active services" value={activeServices.length} />
        <StatsCard label="Client since" value={shortDate(client.startedAt)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="size-4" /> AI Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(client.aiServices?.length ?? 0) === 0 ? (
              <EmptyState icon={PhoneCall} title="No services yet" description="Set up the AI receptionist or social agent for this client." />
            ) : (
              <ul className="space-y-2 text-sm">
                {client.aiServices!.map((service) => (
                  <li key={service.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <span className="font-medium">{SERVICE_LABEL[service.serviceType] ?? service.serviceType}</span>
                    <span className="flex items-center gap-2">
                      <span className="tabular-nums text-muted-foreground">{money(service.monthlyPrice)}/mo</span>
                      <Badge variant={service.isActive ? 'default' : 'secondary'}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Megaphone className="size-4" /> Social posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" variant="outline" onClick={setupReceptionist}>
              Generate 5 Facebook posts
            </Button>
            {(client.socialPosts?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              <ul className="space-y-2 text-sm max-h-72 overflow-y-auto pr-1">
                {client.socialPosts!.map((post) => (
                  <li key={post.id} className="border rounded-md px-3 py-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{post.platform}</Badge>
                      <Badge variant="secondary">{post.status}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
