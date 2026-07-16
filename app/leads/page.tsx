'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Globe, Search, Star } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useLeads } from '@/lib/hooks/use-leads';
import { shortDate } from '@/lib/format';
import type { Lead, LeadFilters, LeadStatus } from '@/lib/types';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadDetailSheet } from './components/lead-detail-sheet';

const STATUSES: LeadStatus[] = [
  'NEW', 'ENRICHED', 'SITE_BUILT', 'CONTACTED', 'REPLIED',
  'DEMO_BOOKED', 'CLOSED_WON', 'CLOSED_LOST', 'UNSUBSCRIBED',
];

const PAGE_SIZE = 15;

export default function LeadsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <LeadsPageInner />
    </Suspense>
  );
}

function LeadsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters: LeadFilters = useMemo(
    () => ({
      city: searchParams.get('city') ?? '',
      category: searchParams.get('category') ?? '',
      status: (searchParams.get('status') as LeadStatus) ?? '',
      hasWebsite: (searchParams.get('hasWebsite') as '' | 'true' | 'false') ?? '',
      page: Number(searchParams.get('page') ?? '1'),
      limit: PAGE_SIZE,
    }),
    [searchParams],
  );

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    router.replace(`/leads?${params.toString()}`);
  };

  const { data, meta, loading, refetch } = useLeads(filters);

  const rows = useMemo(() => {
    const list = data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((lead) => lead.businessName.toLowerCase().includes(q));
  }, [data, search]);

  const columns = useMemo<ColumnDef<Lead, unknown>[]>(
    () => [
      {
        header: 'Business',
        accessorKey: 'businessName',
        cell: ({ row }) => <span className="font-medium">{row.original.businessName}</span>,
      },
      { header: 'Category', accessorKey: 'category', cell: ({ row }) => row.original.category ?? '—' },
      { header: 'City', accessorKey: 'city', cell: ({ row }) => row.original.city ?? '—' },
      { header: 'Phone', accessorKey: 'phone', cell: ({ row }) => row.original.phone ?? '—' },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        header: 'Website',
        accessorKey: 'websiteUrl',
        cell: ({ row }) =>
          row.original.websiteUrl ? <Globe className="size-4 text-emerald-600" /> : <span className="text-muted-foreground text-xs">none</span>,
      },
      {
        header: 'Rating',
        accessorKey: 'googleRating',
        cell: ({ row }) =>
          row.original.googleRating != null ? (
            <span className="flex items-center gap-1 tabular-nums">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {Number(row.original.googleRating).toFixed(1)}
            </span>
          ) : '—',
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ row }) => <span className="text-muted-foreground">{shortDate(row.original.createdAt)}</span>,
      },
    ],
    [],
  );

  const total = meta?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Leads</h1>
        <Button size="sm" variant="outline" onClick={() => {
          api.enricher.batch({ limit: 25 })
            .then((res) => { toast.success(`Enriched ${res.data.processed} leads`); refetch(); })
            .catch((err: Error) => toast.error(err.message));
        }}>
          Enrich NEW leads
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8 w-56"
            placeholder="Search business name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input
          className="w-36"
          placeholder="City"
          defaultValue={filters.city}
          onKeyDown={(e) => e.key === 'Enter' && setFilter('city', e.currentTarget.value)}
          onBlur={(e) => setFilter('city', e.target.value)}
        />
        <Input
          className="w-36"
          placeholder="Category"
          defaultValue={filters.category}
          onKeyDown={(e) => e.key === 'Enter' && setFilter('category', e.currentTarget.value)}
          onBlur={(e) => setFilter('category', e.target.value)}
        />
        <Select value={filters.status || 'all'} onValueChange={(v) => setFilter('status', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.hasWebsite || 'all'} onValueChange={(v) => setFilter('hasWebsite', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Website" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any website</SelectItem>
            <SelectItem value="false">No website</SelectItem>
            <SelectItem value="true">Has website</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyTitle="No leads match these filters"
        onRowClick={(lead) => setSelectedId(lead.id)}
        page={filters.page}
        pageCount={pageCount}
        total={total}
        onPageChange={(p) => setFilter('page', String(p))}
      />

      <LeadDetailSheet
        leadId={selectedId}
        onClose={() => setSelectedId(null)}
        onChanged={refetch}
      />
    </div>
  );
}
