'use client';

import { useState } from 'react';
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

export default function TemplatesPage() {
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const filtered =
    categoryFilter === 'all'
      ? FORM_TEMPLATES
      : FORM_TEMPLATES.filter((t) => t.category === categoryFilter);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Templates"
        description="Start with a pre-built form and customize it to your needs."
        className="mb-6"
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => {
          const Icon = TEMPLATE_ICON_MAP[template.icon] ?? Type;
          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="rounded-lg border p-4 cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {template.title}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {CATEGORY_LABELS[template.category]}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-2">
                {template.fields.length} fields
              </p>
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
