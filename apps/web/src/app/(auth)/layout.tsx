'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { GuestGuard } from '@/components/shared/guest-guard';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="relative flex min-h-screen flex-col items-center justify-between overflow-x-hidden bg-background px-4 py-6 sm:px-6">
        {/* Ambient Gradient Glow Orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[750px] rounded-full bg-gradient-to-tr from-primary/20 via-amber-500/10 to-transparent blur-[140px] dark:from-primary/25 dark:via-purple-500/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-10 h-[400px] w-[520px] rounded-full bg-gradient-to-tl from-accent/40 via-primary/10 to-transparent blur-[120px]"
        />

        {/* Subtle Radial Dot Pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(oklch(var(--color-foreground)/0.04)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]"
        />

        {/* Top Navigation Bar */}
        <header className="relative z-20 flex w-full max-w-5xl items-center justify-between pt-2">
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-amber-500 text-primary-foreground shadow-md shadow-primary/20 transition-all group-hover:shadow-primary/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight tracking-tight text-foreground">
                Snapform
              </span>
              <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                Form Builder
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
            <div className="h-4 w-px bg-border/60 hidden sm:block" />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative z-10 my-auto flex w-full justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {/* Bottom Micro Footer */}
        <footer className="relative z-10 py-2 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Snapform. Build modern Notion-style forms effortlessly.</p>
        </footer>
      </div>
    </GuestGuard>
  );
}

