'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { FORM_TEMPLATES, TEMPLATE_CATEGORIES } from '@/constants/form-templates';
import { TEMPLATE_ICON_MAP } from '@/constants/icon-map';
import { TemplatePreviewDialog } from '@/features/templates/template-preview-dialog';
import type { FormTemplate, TemplateCategory } from '@/constants/form-templates';

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  feedback: 'Feedback',
  registration: 'Registration',
  survey: 'Survey',
  business: 'Business',
  other: 'Other',
};

function TemplatesContent() {
  const searchParams = useSearchParams();
  const templateQuery = searchParams.get('template');

  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  useEffect(() => {
    if (templateQuery) {
      const match = FORM_TEMPLATES.find((t) => t.id === templateQuery);
      if (match) setSelectedTemplate(match);
    }
  }, [templateQuery]);

  const filtered =
    categoryFilter === 'all'
      ? FORM_TEMPLATES
      : FORM_TEMPLATES.filter((t) => t.category === categoryFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Badge variant="outline" className="mb-2">10+ Ready-Made Forms</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Explore Form Templates
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Start with a pre-built form and customize it to your needs. Preview anytime without signing in.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <Button
          variant={categoryFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategoryFilter('all')}
        >
          All Templates
        </Button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={categoryFilter === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((template) => {
          const Icon = TEMPLATE_ICON_MAP[template.icon] ?? Type;
          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="rounded-xl border border-border/70 bg-card p-5 cursor-pointer hover:border-primary/60 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {template.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] mt-1 capitalize">
                      {CATEGORY_LABELS[template.category]}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground mt-4">
                <span>{template.fields.length} fields</span>
                <span className="text-primary font-medium group-hover:underline">Preview →</span>
              </div>
            </div>
          );
        })}
      </div>

      <TemplatePreviewDialog
        template={selectedTemplate}
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
      />
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-12 text-center text-muted-foreground">Loading templates...</div>}>
      <TemplatesContent />
    </Suspense>
  );
}
