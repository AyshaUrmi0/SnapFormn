'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { WorkspaceSwitcher } from './workspace-switcher';
import { getNavSections, getWorkspaceIdFromPath } from './sidebar';
import { ROUTES } from '@/constants/routes';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const workspaceId = getWorkspaceIdFromPath(pathname);
  const sections = getNavSections(workspaceId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-56 p-0 flex flex-col bg-sidebar text-sidebar-foreground">
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        {/* User menu at top */}
        <div className="p-3">
          <UserMenu showName sidebar />
        </div>

        <Separator />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-1">
          {sections.map((section, sIdx) => {
            if (section.label === 'Workspaces') {
              return (
                <div key="workspaces" className="mt-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">
                      Workspaces
                    </p>
                    <Link
                      href={ROUTES.NEW_WORKSPACE}
                      onClick={() => onOpenChange(false)}
                      className="p-0.5 rounded hover:bg-sidebar-accent text-muted-foreground"
                      title="Create workspace"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="px-1">
                    <WorkspaceSwitcher onNavigate={() => onOpenChange(false)} />
                  </div>
                </div>
              );
            }

            return (
              <div key={sIdx} className={sIdx > 0 ? 'mt-1' : ''}>
                {section.label && (
                  <p className="px-3 py-2 text-[12px] uppercase tracking-wider text-muted-foreground font-medium">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5 px-1">
                  {section.items.map((item) => {
                    const isActive = item.href !== '#' && pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                          item.className,
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <Separator />

        {/* Footer */}
        <div className="p-2 flex items-center justify-between">
          <Link
            href="#"
            className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <Heart className="h-4 w-4 shrink-0" />
            <span>Give Feedback</span>
            <span className="h-2 w-2 rounded-full bg-blue-500 ml-auto" />
          </Link>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
