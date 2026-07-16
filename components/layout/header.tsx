'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const LABELS: Record<string, string> = {
  leads: 'Leads',
  sites: 'Sites',
  outreach: 'Outreach',
  clients: 'Clients',
  settings: 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 lg:px-6 border-b bg-background/95 backdrop-blur">
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Dashboard
        </Link>
        {segments.map((segment, i) => (
          <Fragment key={i}>
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <span className={i === segments.length - 1 ? 'font-medium' : 'text-muted-foreground'}>
              {LABELS[segment] ?? segment.slice(0, 8)}
            </span>
          </Fragment>
        ))}
      </nav>
      <Avatar className="size-8">
        <AvatarFallback className="text-xs font-semibold">LF</AvatarFallback>
      </Avatar>
    </header>
  );
}
