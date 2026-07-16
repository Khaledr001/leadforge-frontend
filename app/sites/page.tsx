'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Eye, Globe, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useSites } from '@/lib/hooks/use-sites';
import { shortDate } from '@/lib/format';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const TEMPLATES = ['template-trades', 'template-beauty', 'template-food', 'template-auto', 'template-home'];

export default function SitesPage() {
  const { data, loading, refetch } = useSites(1, 100);
  const [template, setTemplate] = useState('all');
  const [claimed, setClaimed] = useState('all');

  const sites = useMemo(
    () =>
      (data ?? []).filter(
        (site) =>
          (template === 'all' || site.templateId === template) &&
          (claimed === 'all' || (claimed === 'claimed') === site.isClaimed),
      ),
    [data, template, claimed],
  );

  const remove = async (id: string, subdomain: string) => {
    if (!window.confirm(`Delete site "${subdomain}"? This tears down the deployment.`)) return;
    try {
      await api.sites.remove(id);
      toast.success('Site deleted');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Sites</h1>
        <div className="flex gap-2">
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {TEMPLATES.map((t) => <SelectItem key={t} value={t}>{t.replace('template-', '')}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={claimed} onValueChange={setClaimed}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sites</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="unclaimed">Unclaimed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : sites.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No sites yet"
          description="Generate demo sites for your leads from the Leads page or the dashboard quick actions."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sites.map((site) => (
            <Card key={site.id} className="gap-3 py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-sm truncate">{site.lead?.businessName ?? site.subdomain}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{site.subdomain}</p>
              </CardHeader>
              <CardContent className="px-4 flex items-center gap-2 flex-wrap">
                <Badge variant={site.isClaimed ? 'default' : site.visitCount > 0 ? 'secondary' : 'outline'}>
                  {site.isClaimed ? 'Claimed' : site.visitCount > 0 ? 'Visited' : 'Unclaimed'}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="size-3" /> {site.visitCount}
                </span>
                <span className="text-xs text-muted-foreground">{shortDate(site.createdAt)}</span>
              </CardContent>
              <CardFooter className="px-4 gap-2">
                {site.deployUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={site.deployUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" /> Preview
                    </a>
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Not deployed</Badge>
                )}
                <Button size="sm" variant="ghost" className="text-destructive ml-auto"
                  onClick={() => remove(site.id, site.subdomain)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
