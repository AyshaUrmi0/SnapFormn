'use client';

import { BookOpen, FileText, Share2, Code, Mail, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Guide {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  readTime: string;
}

const GUIDES: Guide[] = [
  {
    title: 'Building your first form',
    description: 'Learn how to create a form from scratch using the slash command editor.',
    icon: FileText,
    category: 'Getting Started',
    readTime: '3 min',
  },
  {
    title: 'Choosing the right field type',
    description: 'A guide to all 16 field types and when to use each one.',
    icon: FileText,
    category: 'Getting Started',
    readTime: '5 min',
  },
  {
    title: 'Sharing your form',
    description: 'Get a public link, embed your form on a website, or share via email.',
    icon: Share2,
    category: 'Sharing',
    readTime: '2 min',
  },
  {
    title: 'Embedding forms in your website',
    description: 'Step-by-step guide to embedding a Snapform form using an iframe.',
    icon: Code,
    category: 'Sharing',
    readTime: '4 min',
  },
  {
    title: 'Setting up email notifications',
    description: 'Get notified by email every time someone submits your form.',
    icon: Mail,
    category: 'Notifications',
    readTime: '3 min',
  },
  {
    title: 'Managing form settings',
    description: 'Customize your thank-you page, password protection, and submission limits.',
    icon: Settings,
    category: 'Configuration',
    readTime: '4 min',
  },
  {
    title: 'Inviting team members',
    description: 'Add collaborators to your workspace and assign roles.',
    icon: Users,
    category: 'Collaboration',
    readTime: '3 min',
  },
  {
    title: 'Understanding analytics',
    description: 'Track submissions, completion rates, and field-by-field response stats.',
    icon: FileText,
    category: 'Analytics',
    readTime: '5 min',
  },
];

export default function GuidesPage() {
  // Group guides by category
  const grouped = GUIDES.reduce<Record<string, Guide[]>>((acc, guide) => {
    if (!acc[guide.category]) acc[guide.category] = [];
    acc[guide.category].push(guide);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">How-to Guides</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Step-by-step tutorials to help you get the most out of Snapform.
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([category, guides]) => (
          <section key={category}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {category}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {guides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <a
                    key={guide.title}
                    href="#"
                    className="rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {guide.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-2">{guide.readTime} read</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
