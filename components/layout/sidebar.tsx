'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2, Globe, LayoutDashboard, Mail, Settings, Users, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/sites', label: 'Sites', icon: Globe },
  { href: '/outreach', label: 'Outreach', icon: Mail },
  { href: '/clients', label: 'Clients', icon: Building2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop / tablet sidebar (icons only on tablet) */}
      <aside className="hidden md:flex md:flex-col md:w-16 lg:w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 h-14 px-4 border-b">
          <Zap className="size-5 text-primary shrink-0" />
          <span className="hidden lg:block font-semibold tracking-tight">LeadForge</span>
        </div>
        <nav className="flex-1 py-3 space-y-1 px-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur flex justify-around py-2">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 rounded-md',
              isActive(href) ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
