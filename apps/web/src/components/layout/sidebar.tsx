'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  CreditCard,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { WorkspaceSwitcher } from './workspace-switcher';
import { ROUTES } from '@/constants/routes';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

function getNavItems(workspaceId: string | null): NavItem[] {
  if (!workspaceId) {
    return [
      { label: 'Workspaces', href: ROUTES.WORKSPACES, icon: LayoutDashboard },
    ];
  }
  const ws = ROUTES.workspace(workspaceId);
  return [
    { label: 'Forms', href: ws.FORMS, icon: FileText },
    { label: 'Members', href: ws.MEMBERS, icon: Users },
    { label: 'Settings', href: ws.SETTINGS, icon: Settings },
    { label: 'Billing', href: ws.BILLING, icon: CreditCard },
  ];
}

function getWorkspaceIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  // If first segment is 'workspaces', we're at workspace-list level
  if (!segments[0] || segments[0] === 'workspaces') return null;
  return segments[0];
}

export { getNavItems, getWorkspaceIdFromPath };

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  const workspaceId = getWorkspaceIdFromPath(pathname);
  const navItems = getNavItems(workspaceId);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        {workspaceId ? (
          <WorkspaceSwitcher collapsed={collapsed} />
        ) : (
          !collapsed && (
            <span className="text-lg font-bold text-primary px-2">Snapform</span>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                collapsed && 'justify-center px-0',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Footer */}
      <div className={cn('p-3 flex items-center', collapsed ? 'flex-col gap-2' : 'justify-between')}>
        <ThemeToggle />
        <UserMenu showName={!collapsed} />
      </div>
    </aside>
  );
}
