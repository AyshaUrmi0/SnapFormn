'use client';

import { Badge } from '@/components/ui/badge';
import type { FormStatus } from '@/modules/form/types';

const STATUS_CONFIG: Record<FormStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  PUBLISHED: { label: 'Published', variant: 'default' },
  CLOSED: { label: 'Closed', variant: 'outline' },
};

export function FormStatusBadge({ status }: { status: FormStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
