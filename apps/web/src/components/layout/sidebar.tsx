'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Users,
  Globe,
  Settings,
  Sparkles,
  LayoutTemplate,
  Newspaper,
  Map,
  MessageSquare,
  Gift,
  Trash2,
  Rocket,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Heart,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';
import { WorkspaceSwitcher } from './workspace-switcher';
import { ROUTES } from '@/constants/routes';

function getWorkspaceIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (!segments[0] || segments[0] === 'workspaces') return null;
  return segments[0];
}

export { getWorkspaceIdFromPath };

interface NavItemDef {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

interface NavSectionDef {
  label?: string;
  items: NavItemDef[];
}

function getNavSections(workspaceId: string | null): NavSectionDef[] {
  const ws = workspaceId ? ROUTES.workspace(workspaceId) : null;

  const mainNav: NavItemDef[] = [
    { label: 'Home', href: ws?.ROOT ?? ROUTES.WORKSPACES, icon: Home },
    { label: 'Search', href: '#', icon: Search },
    { label: 'Members', href: ws?.MEMBERS ?? '#', icon: Users },
    { label: 'Domains', href: '#', icon: Globe },
    { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
    { label: 'Upgrade plan', href: '#', icon: Sparkles, className: 'text-primary' },
  ];

  const productNav: NavItemDef[] = [
    { label: 'Templates', href: '#', icon: LayoutTemplate },
    { label: "What's new", href: '#', icon: Newspaper },
    { label: 'Roadmap', href: '#', icon: Map },
    { label: 'Feature requests', href: '#', icon: MessageSquare },
    { label: 'Rewards', href: '#', icon: Gift },
    { label: 'Trash', href: '#', icon: Trash2 },
  ];

  const helpNav: NavItemDef[] = [
    { label: 'Get started', href: '#', icon: Rocket },
    { label: 'How-to guides', href: '#', icon: BookOpen },
    { label: 'Help center', href: '#', icon: HelpCircle },
    { label: 'Contact support', href: '#', icon: MessageCircle },
  ];

  return [
    { items: mainNav },
    { label: 'Workspaces', items: [] },
    { label: 'Product', items: productNav },
    { label: 'Help', items: helpNav },
  ];
}

export { getNavSections };

function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItemDef;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
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
}

function SectionLabel({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      {action}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const workspaceId = getWorkspaceIdFromPath(pathname);
  const sections = getNavSections(workspaceId);

  return (
    <aside className="flex flex-col w-56 border-r border-sidebar-border bg-sidebar text-sidebar-foreground h-screen overflow-y-auto shrink-0">
      {/* User menu at top */}
      <div className="p-3">
        <UserMenu showName sidebar />
      </div>

      <Separator />

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-1">
        {sections.map((section, sIdx) => {
          if (section.label === 'Workspaces') {
            return (
              <div key="workspaces" className="mt-1">
                <SectionLabel
                  label="Workspaces"
                  action={
                    <Link
                      href={ROUTES.NEW_WORKSPACE}
                      className="p-0.5 rounded hover:bg-sidebar-accent text-muted-foreground"
                      title="Create workspace"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Link>
                  }
                />
                <div className="px-1">
                  <WorkspaceSwitcher />
                </div>
              </div>
            );
          }

          return (
            <div key={sIdx} className={sIdx > 0 ? 'mt-1' : ''}>
              {section.label && <SectionLabel label={section.label} />}
              <div className="space-y-0.5 px-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href !== '#' && pathname === item.href;
                  return (
                    <NavItem key={item.label} item={item} isActive={isActive} />
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
    </aside>
  );
}
