'use client';

import { useState, useMemo } from 'react';
import {
  BookOpen, FileText, Share2, Code, Mail, Settings, Users, BarChart3,
  Clock, Search, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Guide {
  id: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  category: string;
  readTime: string;
  steps: string[];
}

const GUIDES: Guide[] = [
  {
    id: 'first-form',
    title: 'Building your first form',
    summary: 'Learn how to create a form from scratch using the slash command editor.',
    icon: FileText,
    category: 'Getting Started',
    readTime: '3 min',
    steps: [
      'Open any workspace and click "+ New form" in the top right.',
      'Give it a title — this is what respondents see at the top of the form.',
      'In the editor, press / to open the slash command menu and pick a field type.',
      'Click any inserted block to configure label, placeholder, and required toggle in the right sidebar.',
      'Click Save in the topbar to persist your changes.',
    ],
  },
  {
    id: 'field-types',
    title: 'Choosing the right field type',
    summary: 'A guide to all 36 field types and when to use each one.',
    icon: FileText,
    category: 'Getting Started',
    readTime: '5 min',
    steps: [
      'Use Short answer for names, titles, single lines of text.',
      'Use Long answer for paragraphs, feedback, or open-ended responses.',
      'Use Multiple choice (Radio) when respondents pick exactly one option.',
      'Use Checkboxes when respondents can pick multiple options.',
      'Use Dropdown for long lists where you want to save vertical space.',
      'Use Rating or Linear scale for numeric scoring (NPS, CSAT, etc.).',
      'Use File upload for resumes, photos, or documents (uploads to Cloudinary).',
      'Use Layout blocks (Heading, Divider, Title, Label) to structure long forms.',
    ],
  },
  {
    id: 'share-form',
    title: 'Sharing your form',
    summary: 'Get a public link, embed your form on a website, or share via email.',
    icon: Share2,
    category: 'Sharing',
    readTime: '2 min',
    steps: [
      'Publish your form by clicking "Publish" in the editor topbar.',
      'Open the form Settings page to copy the public share link.',
      'Send the link via email, paste in social posts, or include in your bio.',
      'For embedding, copy the iframe snippet from the Embed section in Settings.',
    ],
  },
  {
    id: 'embed',
    title: 'Embedding forms in your website',
    summary: 'Step-by-step guide to embedding a Snapform form using an iframe.',
    icon: Code,
    category: 'Sharing',
    readTime: '4 min',
    steps: [
      'Open the form Settings page.',
      'Scroll to the Embed section and copy the iframe code.',
      'Paste the iframe into your HTML where you want the form to appear.',
      'Adjust the height attribute if your form is long — the iframe doesn\'t auto-resize.',
      'The embedded form appends ?embedded=true so it renders without the Snapform header.',
    ],
  },
  {
    id: 'schedule',
    title: 'Scheduling form submissions',
    summary: 'Open and close your form automatically based on date or submission count.',
    icon: Clock,
    category: 'Configuration',
    readTime: '3 min',
    steps: [
      'Open the form Settings page.',
      'In the Schedule section, set "Opens at" to start accepting responses on a specific date.',
      'Set "Closes at" to stop accepting responses after a specific date.',
      'Set "Maximum submissions" to auto-close after N responses (e.g. first 100 RSVPs).',
      'Save changes — visitors before/after the schedule see a clean "form is closed" message.',
    ],
  },
  {
    id: 'thank-you',
    title: 'Customizing the thank-you page',
    summary: 'Replace the default success message with your own branded message or redirect.',
    icon: Settings,
    category: 'Configuration',
    readTime: '3 min',
    steps: [
      'Open the form Settings page.',
      'In the Thank You Page section, write a custom success message.',
      'Optionally enable "Show submit another response" for forms that should accept multiple submissions per user.',
      'For redirecting to your own page (e.g. a thank-you page on your website), paste a URL into the Redirect URL field.',
      'Alternatively, add a THANK_YOU_PAGE block in the form editor for richer customization.',
    ],
  },
  {
    id: 'invite-members',
    title: 'Inviting team members',
    summary: 'Add collaborators to your workspace and assign roles.',
    icon: Users,
    category: 'Collaboration',
    readTime: '3 min',
    steps: [
      'Open your workspace and click Members in the sidebar.',
      'Click "Invite member" and enter the email address.',
      'Pick a role: Owner (full access), Admin (manage forms + members), Editor (create/edit forms), Viewer (read only).',
      'They\'ll get an invite email — once they accept, they appear in the members list.',
      'Free plan caps at 2 members per workspace. Upgrade to Pro for unlimited.',
    ],
  },
  {
    id: 'analytics',
    title: 'Understanding analytics',
    summary: 'Track submissions, completion rates, and field-by-field response stats.',
    icon: BarChart3,
    category: 'Analytics',
    readTime: '5 min',
    steps: [
      'Open any form and click the Analytics tab from the topbar or sidebar.',
      'The Overview shows total submissions, completion rate, and recent activity timeline.',
      'The timeline chart shows submissions per day over the last 30 days.',
      'Field-by-field stats show response counts and completion rates for each field.',
      'Use these insights to identify drop-off points and improve your forms.',
    ],
  },
  {
    id: 'notifications',
    title: 'Setting up email notifications',
    summary: 'Get notified by email every time someone submits your form.',
    icon: Mail,
    category: 'Notifications',
    readTime: '2 min',
    steps: [
      'Email notifications are coming soon as part of the Pro plan.',
      'For now, you can check the submissions page directly to see new responses.',
      'Or use the analytics dashboard timeline to spot recent activity.',
    ],
  },
];

const CATEGORIES = ['Getting Started', 'Sharing', 'Configuration', 'Collaboration', 'Analytics', 'Notifications'];

export default function GuidesPage() {
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Filter by search query (matches title + summary + category)
  const filtered = useMemo(() => {
    if (!query.trim()) return GUIDES;
    const q = query.toLowerCase();
    return GUIDES.filter((g) =>
      `${g.title} ${g.summary} ${g.category}`.toLowerCase().includes(q),
    );
  }, [query]);

  // Group filtered guides by category, preserving the canonical category order
  const grouped = useMemo(() => {
    return CATEGORIES
      .map((cat) => ({
        category: cat,
        items: filtered.filter((g) => g.category === cat),
      }))
      .filter((group) => group.items.length > 0);
  }, [filtered]);

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">How-to Guides</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Step-by-step tutorials to help you get the most out of Snapform.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides..."
          className="pl-9"
        />
      </div>

      {/* Empty state */}
      {grouped.length === 0 && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No guides match &ldquo;{query}&rdquo;. Try a different search.
          </p>
        </div>
      )}

      {/* Grouped accordion */}
      <div className="space-y-8">
        {grouped.map((group) => (
          <section key={group.category}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {group.category}
            </h2>
            <div className="space-y-2">
              {group.items.map((guide) => {
                const Icon = guide.icon;
                const isOpen = openIds.has(guide.id);
                return (
                  <div key={guide.id} className="rounded-xl border bg-card overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggle(guide.id)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{guide.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {guide.summary}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-2">
                          {guide.readTime} read
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground shrink-0 transition-transform mt-1',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t px-4 py-4 bg-muted/20">
                        <ol className="space-y-2.5">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                                {i + 1}
                              </span>
                              <span className="text-muted-foreground leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
