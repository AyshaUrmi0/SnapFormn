'use client';

import { Map as MapIcon, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
}

interface RoadmapColumn {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  items: RoadmapItem[];
}

const COLUMNS: RoadmapColumn[] = [
  {
    title: 'Shipped',
    description: 'Already in production',
    icon: CheckCircle2,
    iconClass: 'text-green-600 dark:text-green-400',
    items: [
      { title: 'Form templates', description: '10 pre-built templates across 5 categories.' },
      { title: 'Trash & restore', description: 'Soft delete for forms with restore.' },
      { title: 'Stripe billing', description: 'Pro and Business subscriptions.' },
      { title: 'Plan limits', description: 'Per-workspace usage enforcement.' },
      { title: 'Command palette', description: 'Ctrl+K search across the app.' },
    ],
  },
  {
    title: 'In Progress',
    description: 'Building right now',
    icon: Loader2,
    iconClass: 'text-blue-600 dark:text-blue-400',
    items: [
      { title: 'Email notifications', description: 'Notify form owners on new submissions.' },
      { title: 'API keys', description: 'Programmatic access to forms and submissions.' },
    ],
  },
  {
    title: 'Planned',
    description: 'Coming soon',
    icon: Circle,
    iconClass: 'text-muted-foreground',
    items: [
      { title: 'Custom domains', description: 'Map your own domain to public forms.' },
      { title: 'Webhooks', description: 'Push submissions to external URLs.' },
      { title: 'Conditional logic', description: 'Show or hide fields based on answers.' },
      { title: 'Multi-page forms', description: 'Split long forms across multiple pages.' },
      { title: 'Slack integration', description: 'Send submissions to a Slack channel.' },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapIcon className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Roadmap</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          What we&apos;re building, in progress, and planned for Snapform.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.title} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${col.iconClass}`} />
                <h2 className="font-semibold">{col.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{col.description}</p>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.title} className="rounded-lg border bg-background p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
