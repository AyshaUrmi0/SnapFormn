'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Submission } from '@/modules/submission/types';

interface SubmissionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission | null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function SubmissionDetailDialog({ open, onOpenChange, submission }: SubmissionDetailDialogProps) {
  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
          <DialogDescription>
            Submitted {formatDate(submission.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          {submission.fields?.map((sf) => (
            <div key={sf.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{sf.field?.label ?? 'Unknown field'}</p>
                {sf.field?.type && (
                  <Badge variant="outline" className="text-[11px] px-1.5 capitalize">
                    {sf.field.type.replace(/_/g, ' ').toLowerCase()}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground bg-muted/50 rounded-md px-3 py-2">
                {formatValue(sf.value)}
              </p>
            </div>
          ))}

          {(!submission.fields || submission.fields.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No field data available.
            </p>
          )}
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>ID: {submission.id}</p>
          {submission.respondentIp && <p>IP: {submission.respondentIp}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
