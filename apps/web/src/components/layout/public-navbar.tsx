'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, ArrowRight, Menu, X, LayoutTemplate, BookOpen, HelpCircle, Map, Newspaper, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-logout';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Sandbox', href: ROUTES.SANDBOX, icon: Sparkles },
  { label: 'Templates', href: ROUTES.TEMPLATES, icon: LayoutTemplate },
  { label: 'Pricing', href: '/pricing', icon: Sparkles },
  { label: 'Guides', href: ROUTES.GUIDES, icon: BookOpen },
  { label: 'Help Center', href: ROUTES.HELP_CENTER, icon: HelpCircle },
  { label: 'Roadmap', href: ROUTES.ROADMAP, icon: Map },
  { label: "What's New", href: ROUTES.WHATS_NEW, icon: Newspaper },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight">Snapform</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Form Builder</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isLoading ? (
            <div className="h-8 w-28 rounded-lg bg-muted/40 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden lg:inline-block">
                Signed in as <strong className="text-foreground">{user?.name || user?.email}</strong>
              </span>
              <Link
                href={ROUTES.WORKSPACES}
                className={cn(buttonVariants({ size: 'sm' }), 'flex items-center gap-1.5')}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
                title="Log out"
              >
                {logout.isPending ? (
                  <Spinner size="xs" variant="muted" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>Log out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.LOGIN}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                Log in
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className={cn(buttonVariants({ size: 'sm' }), 'flex items-center gap-1.5 shadow-sm')}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isLoading ? (
              <div className="h-10 w-full rounded-md bg-muted/40 animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={ROUTES.WORKSPACES}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(buttonVariants(), 'w-full justify-center')}
                >
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout.mutate();
                  }}
                  disabled={logout.isPending}
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive justify-center gap-1.5 cursor-pointer"
                >
                  {logout.isPending ? (
                    <Spinner size="xs" variant="muted" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>Log out</span>
                </Button>
              </div>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}
                >
                  Log in
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(buttonVariants(), 'w-full justify-center')}
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
