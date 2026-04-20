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
import { useCommandPalette } from '@/providers/command-palette-provider';
import { useCreateWorkspaceHref } from '@/hooks/use-creation-hrefs';
import { ROUTES } from '@/constants/routes';

const NON_WORKSPACE_ROUTES = [
  'workspaces', 'settings', 'search', 'domains', 'upgrade', 'members',
  'templates', 'whats-new', 'roadmap', 'feature-requests', 'rewards', 'trash',
  'get-started', 'guides', 'help-center', 'contact-support',
  'login', 'register', 'verify-otp', 'complete-profile', 'forgot-password', 'reset-password', 'f',
];

function getWorkspaceIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (!segments[0] || NON_WORKSPACE_ROUTES.includes(segments[0])) return null;
  return segments[0];
}

export { getWorkspaceIdFromPath };

interface NavItemDef {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  exact?: boolean;
  action?: () => void;
}

interface NavSectionDef {
  label?: string;
  items: NavItemDef[];
}

function getNavSections(workspaceId: string | null, options?: { onSearchClick?: () => void }): NavSectionDef[] {
  const ws = workspaceId ? ROUTES.workspace(workspaceId) : null;

  const mainNav: NavItemDef[] = [
    { label: 'Home', href: ROUTES.WORKSPACES, icon: Home, exact: true },
    { label: 'Search', href: '#', icon: Search, action: options?.onSearchClick },
    { label: 'Members', href: ws?.MEMBERS ?? ROUTES.MEMBERS, icon: Users },
    { label: 'Domains', href: ROUTES.DOMAINS, icon: Globe },
    { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
    { label: 'Upgrade plan', href: ws?.UPGRADE ?? '/upgrade', icon: Sparkles, className: 'text-primary' },
  ];

  const productNav: NavItemDef[] = [
    { label: 'Templates', href: ROUTES.TEMPLATES, icon: LayoutTemplate },
    { label: "What's new", href: ROUTES.WHATS_NEW, icon: Newspaper },
    { label: 'Roadmap', href: ROUTES.ROADMAP, icon: Map },
    { label: 'Feature requests', href: ROUTES.FEATURE_REQUESTS, icon: MessageSquare },
    { label: 'Rewards', href: ROUTES.REWARDS, icon: Gift },
    { label: 'Trash', href: ROUTES.TRASH, icon: Trash2 },
  ];

  const helpNav: NavItemDef[] = [
    { label: 'Get started', href: ROUTES.GET_STARTED, icon: Rocket },
    { label: 'How-to guides', href: ROUTES.GUIDES, icon: BookOpen },
    { label: 'Help center', href: ROUTES.HELP_CENTER, icon: HelpCircle },
    { label: 'Contact support', href: ROUTES.CONTACT_SUPPORT, icon: MessageCircle },
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
  const classes = cn(
    'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors w-full',
    isActive
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
      : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
    item.className,
  );

  // If the item has an action callback, render a button instead of a link
  if (item.action) {
    return (
      <button type="button" onClick={item.action} className={classes}>
        <item.icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <Link href={item.href} onClick={onClick} className={classes}>
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

function SectionLabel({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      {action}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { open: openSearch } = useCommandPalette();
  const workspaceId = getWorkspaceIdFromPath(pathname);
  const sections = getNavSections(workspaceId, { onSearchClick: openSearch });
  const newWorkspaceHref = useCreateWorkspaceHref();

  return (
    <aside className="flex flex-col w-56 border-r border-sidebar-border bg-sidebar text-sidebar-foreground h-screen shrink-0">
      {/* User menu at top */}
      <div className="p-3">
        <UserMenu showName sidebar />
      </div>

      <Separator />

      {/* Main nav */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-1">
        {sections.map((section, sIdx) => {
          if (section.label === 'Workspaces') {
            return (
              <div key="workspaces" className="mt-1">
                <SectionLabel
                  label="Workspaces"
                  action={
                    <Link
                      href={newWorkspaceHref}
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
                    item.href !== '#' &&
                    (item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(item.href + '/'));
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
