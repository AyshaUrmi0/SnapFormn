'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  return (
    <header className="flex h-12 items-center border-b border-border bg-background px-4 md:hidden">
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
    </header>
  );
}
