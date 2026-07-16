'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useClients, useClientStats } from '@/lib/hooks/use-clients';
import { money, shortDate } from '@/lib/format';
import type { Client } from '@/lib/types';
import { DataTable } from '@/components/shared/data-table';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';

const PLAN_LABEL: Record<string, string> = {
  WEBSITE_ONLY: 'Website',
  WEBSITE_PLUS_VOICE: 'Website + Voice',
  FULL_PACKAGE: 'Full Package',
};

export default function ClientsPage() {
  const router = useRouter();
  const { data, loading } = useClients(1, 100);
  const stats = useClientStats();

  const columns = useMemo<ColumnDef<Client, unknown>[]>(
    () => [
      {
        header: 'Business',
        cell: ({ row }) => <span className="font-medium">{row.original.lead?.businessName ?? '—'}</span>,
      },
      {
        header: 'Plan',
        cell: ({ row }) => <Badge variant="secondary">{PLAN_LABEL[row.original.plan] ?? row.original.plan}</Badge>,
      },
      {
        header: 'MRR',
        cell: ({ row }) => <span className="tabular-nums">{money(row.original.mrr)}</span>,
      },
      {
        header: 'Services',
        cell: ({ row }) => {
          const active = row.original.aiServices?.filter((s) => s.isActive).length ?? 0;
          return active > 0 ? `${active} active` : '—';
        },
      },
      {
        header: 'Status',
        cell: ({ row }) =>
          row.original.churnedAt
            ? <Badge variant="destructive">Churned</Badge>
            : <Badge className="bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950 dark:text-emerald-300">Active</Badge>,
      },
      {
        header: 'Started',
        cell: ({ row }) => <span className="text-muted-foreground">{shortDate(row.original.startedAt)}</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Clients</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Total" value={stats.data?.total ?? 0} icon={Users} loading={stats.loading} />
        <StatsCard label="Active" value={stats.data?.active ?? 0} icon={Building2} loading={stats.loading} />
        <StatsCard label="Churned" value={stats.data?.churned ?? 0} icon={TrendingUp} loading={stats.loading} />
        <StatsCard label="MRR" value={money(stats.data?.mrr ?? 0)} icon={DollarSign} loading={stats.loading} />
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        loading={loading}
        emptyTitle="No clients yet"
        onRowClick={(client) => router.push(`/clients/${client.id}`)}
      />
    </div>
  );
}
