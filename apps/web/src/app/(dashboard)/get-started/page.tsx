'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Rocket, FilePlus, LayoutTemplate, Eye, Send, BarChart3,
  Sparkles, Users, CreditCard, Check, ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { ROUTES } from '@/constants/routes';

interface Step {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
  cta?: { label: string; href: string };
}

const STORAGE_KEY = 'snapform:onboarding-checklist';

export default function GetStartedPage() {
  const { data: workspaces } = useWorkspaces();
  const firstWorkspaceId = workspaces?.[0]?.id;

  // Persisted checklist state — survives page reloads
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  function toggleStep(id: string) {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const steps: Step[] = [
    {
      id: 'create-form',
      number: 1,
      title: 'Create your first form',
      description: 'Start from scratch with a blank form. Forms live inside workspaces.',
      icon: FilePlus,
      cta: firstWorkspaceId
        ? { label: 'Create form', href: ROUTES.workspace(firstWorkspaceId).NEW_FORM }
        : undefined,
    },
    {
      id: 'browse-templates',
      number: 2,
      title: 'Or start with a template',
      description: 'Pick from 10 pre-built templates: feedback, RSVP, NPS, contact, job application, and more.',
      icon: LayoutTemplate,
      cta: { label: 'Browse templates', href: ROUTES.TEMPLATES },
    },
    {
      id: 'add-fields',
      number: 3,
      title: 'Add fields with the slash command',
      description: 'Press / in the editor to insert any of the 36 field types. Click any field to configure it in the right sidebar.',
      icon: Sparkles,
    },
    {
      id: 'preview',
      number: 4,
      title: 'Preview before publishing',
      description: 'Click Preview in the editor topbar to see and fill out the form exactly as your respondents will. File uploads and signatures work in preview too.',
      icon: Eye,
    },
    {
      id: 'publish',
      number: 5,
      title: 'Publish and share',
      description: 'Click Publish in the topbar to get a public URL. Share it anywhere — embed it, email it, or post on social.',
      icon: Send,
    },
    {
      id: 'view-submissions',
      number: 6,
      title: 'Track responses in real time',
      description: 'See submissions and analytics from the form dashboard. Export to CSV anytime.',
      icon: BarChart3,
    },
    {
      id: 'invite-team',
      number: 7,
      title: 'Invite your team',
      description: 'Add collaborators to your workspace with Owner, Admin, Editor, or Viewer roles. Free plan supports up to 2 members.',
      icon: Users,
      cta: firstWorkspaceId
        ? { label: 'Open members', href: ROUTES.workspace(firstWorkspaceId).MEMBERS }
        : undefined,
    },
    {
      id: 'upgrade',
      number: 8,
      title: 'Upgrade for unlimited forms',
      description: 'Free plan caps at 3 forms and 100 submissions/month. Upgrade to Pro for unlimited forms, custom domains, and more.',
      icon: CreditCard,
      cta: firstWorkspaceId
        ? { label: 'See pricing', href: ROUTES.workspace(firstWorkspaceId).UPGRADE }
        : undefined,
    },
  ];

  const completedCount = steps.filter((s) => completed[s.id]).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Get Started</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Follow these steps to build, publish, and share your first form.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Your progress</p>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {steps.length} done
          </p>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 && (
          <p className="mt-3 text-sm text-primary flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            All set! You&apos;re ready to ship forms.
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = !!completed[step.id];
          return (
            <div
              key={step.id}
              className={cn(
                'rounded-xl border bg-card p-5 flex gap-4 transition-colors',
                isDone && 'bg-primary/5 border-primary/30',
              )}
            >
              {/* Checkbox + step number */}
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold transition-colors',
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary hover:bg-primary/20',
                )}
                aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
              >
                {isDone ? <Check className="h-5 w-5" /> : step.number}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className={cn('font-semibold', isDone && 'line-through text-muted-foreground')}>
                    {step.title}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.cta && (
                  <Link
                    href={step.cta.href}
                    className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                  >
                    {step.cta.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick links section */}
      <div className="mt-10 rounded-xl border border-dashed bg-muted/30 p-6">
        <h3 className="font-semibold mb-3">Useful shortcuts</h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between rounded-md bg-background border px-3 py-2">
            <span className="text-muted-foreground">Open command palette</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">Ctrl K</kbd>
          </div>
          <div className="flex items-center justify-between rounded-md bg-background border px-3 py-2">
            <span className="text-muted-foreground">Insert a form block</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">/</kbd>
          </div>
          <div className="flex items-center justify-between rounded-md bg-background border px-3 py-2">
            <span className="text-muted-foreground">Save form</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">Ctrl S</kbd>
          </div>
          <div className="flex items-center justify-between rounded-md bg-background border px-3 py-2">
            <span className="text-muted-foreground">Toggle preview</span>
            <span className="text-xs text-muted-foreground">Topbar button</span>
          </div>
        </div>
      </div>
    </div>
  );
}
