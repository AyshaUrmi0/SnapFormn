'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChangelogEntry {
  date: string;
  version: string;
  tag: 'New' | 'Improved' | 'Fixed';
  title: string;
  description: string;
}

const ENTRIES: ChangelogEntry[] = [
  {
    date: 'Apr 13, 2026',
    version: 'v0.10.0',
    tag: 'New',
    title: 'Plan limits and per-workspace upgrade pages',
    description:
      'Free plan now enforces limits on forms, submissions, and members. Each workspace has its own upgrade page showing exactly which plan it is on.',
  },
  {
    date: 'Apr 9, 2026',
    version: 'v0.9.0',
    tag: 'New',
    title: 'Stripe billing integration',
    description:
      'Upgrade workspaces to Pro or Business via Stripe checkout. Manage subscriptions through the customer portal. Webhook keeps subscription state in sync.',
  },
  {
    date: 'Apr 8, 2026',
    version: 'v0.8.0',
    tag: 'New',
    title: 'Trash and soft delete for forms',
    description:
      'Deleted forms now move to trash where they can be restored or permanently deleted. Empty trash to clean up everything at once.',
  },
  {
    date: 'Apr 7, 2026',
    version: 'v0.7.0',
    tag: 'New',
    title: 'Command palette search',
    description:
      'Press Ctrl+K (Cmd+K on Mac) to quickly search across forms, workspaces, and navigation actions from anywhere in the app.',
  },
  {
    date: 'Apr 6, 2026',
    version: 'v0.6.0',
    tag: 'New',
    title: 'Form templates',
    description:
      'Start with one of 10 pre-built templates: customer feedback, event registration, NPS, contact form, job application, and more.',
  },
  {
    date: 'Apr 5, 2026',
    version: 'v0.5.0',
    tag: 'New',
    title: 'Tally-style form editor',
    description:
      'Brand new TipTap-based editor with slash commands, inline configuration, and live preview. Press / to insert any field type.',
  },
];

const TAG_COLORS: Record<ChangelogEntry['tag'], string> = {
  New: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Improved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Fixed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function WhatsNewPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">What&apos;s New</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Latest updates, improvements, and fixes to Snapform.
        </p>
      </div>

      <div className="space-y-8">
        {ENTRIES.map((entry) => (
          <article key={entry.version} className="border-l-2 border-border pl-6 relative">
            <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-[10px] border-0 ${TAG_COLORS[entry.tag]}`}>
                {entry.tag}
              </Badge>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground font-mono">{entry.version}</span>
            </div>
            <h2 className="text-lg font-semibold mb-1">{entry.title}</h2>
            <p className="text-sm text-muted-foreground">{entry.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
