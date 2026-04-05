'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

const THEME_CYCLE = ['light', 'dark', 'system'] as const;
const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = (theme ?? 'system') as keyof typeof THEME_ICONS;
  const Icon = THEME_ICONS[currentTheme] ?? Monitor;
  const nextIndex = (THEME_CYCLE.indexOf(currentTheme) + 1) % THEME_CYCLE.length;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => setTheme(THEME_CYCLE[nextIndex])}
      title={`${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} mode`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
