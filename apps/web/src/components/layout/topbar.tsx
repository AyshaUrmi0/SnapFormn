'use client';

import Link from 'next/link';
import { Menu, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLogout } from '@/hooks/use-logout';
import { ROUTES } from '@/constants/routes';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const logout = useLogout();

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-1.5 font-bold text-sm text-foreground hover:opacity-85 transition-opacity"
          title="Snapform Home (http://localhost:3000/)"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>Snapform</span>
        </Link>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
        title="Log out"
      >
        {logout.isPending ? (
          <Spinner size="xs" variant="muted" />
        ) : (
          <LogOut className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">Log out</span>
      </Button>
    </header>
  );
}
