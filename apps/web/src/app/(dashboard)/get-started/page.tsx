'use client';

import Link from 'next/link';
import { Rocket, FilePlus, LayoutTemplate, Eye, Send, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { ROUTES } from '@/constants/routes';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
  cta?: { label: string; href: string };
}

export default function GetStartedPage() {
  const { data: workspaces } = useWorkspaces();
  const firstWorkspaceId = workspaces?.[0]?.id;

  const steps: Step[] = [
    {
      number: 1,
      title: 'Create your first form',
      description: 'Start from scratch or pick a template. Forms are organized by workspace.',
      icon: FilePlus,
      cta: firstWorkspaceId
        ? { label: 'Create form', href: ROUTES.workspace(firstWorkspaceId).NEW_FORM }
        : undefined,
    },
    {
      number: 2,
      title: 'Browse templates',
      description: 'Save time by starting with one of our pre-built templates.',
      icon: LayoutTemplate,
      cta: { label: 'Browse templates', href: ROUTES.TEMPLATES },
    },
    {
      number: 3,
      title: 'Customize your fields',
      description:
        'Press / in the editor to add any field type. Drag to reorder, click any field to configure label, description, and validation.',
      icon: Eye,
    },
    {
      number: 4,
      title: 'Publish and share',
      description:
        'Hit publish to get a public link. Share it anywhere — embed in your site, post on social, or include in an email.',
      icon: Send,
    },
    {
      number: 5,
      title: 'Track responses',
      description:
        'See submissions in real time, view analytics, and export your data whenever you need.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Get Started</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Follow these steps to build and ship your first form in minutes.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="rounded-xl border bg-card p-5 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                {step.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold">{step.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.cta && (
                  <Link
                    href={step.cta.href}
                    className="inline-block mt-3 text-sm text-primary hover:underline"
                  >
                    {step.cta.label} →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
