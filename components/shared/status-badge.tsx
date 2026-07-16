import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_CLASS, STATUS_LABEL } from '@/lib/format';
import type { LeadStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="secondary" className={cn('border-transparent', STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
