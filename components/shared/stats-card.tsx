import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsCard({
  label,
  value,
  icon: Icon,
  hint,
  loading,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        {loading ? (
          <Skeleton className="h-7 w-20 mt-1.5" />
        ) : (
          <p className="text-2xl font-semibold mt-1 tabular-nums">{value}</p>
        )}
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </CardContent>
    </Card>
  );
}
