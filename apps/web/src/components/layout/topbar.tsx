'use client';

import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-logout';
import { Spinner } from '@/components/ui/spinner';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const logout = useLogout();

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="ml-2 text-sm font-bold text-primary">Snapform</span>
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
        <span className="text-[11px] font-medium">Log out</span>
      </Button>
    </header>
  );
}
