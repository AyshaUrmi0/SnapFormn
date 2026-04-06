'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PublishSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formUrl: string;
}

export function PublishSuccessDialog({ open, onOpenChange, formUrl }: PublishSuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.querySelector<HTMLInputElement>('#publish-url-input');
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Form Published!</DialogTitle>
          <DialogDescription>
            Your form is now live. Share the link below with your audience.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            id="publish-url-input"
            value={formUrl}
            readOnly
            className="flex-1 text-sm"
            onFocus={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <a href={formUrl} target="_blank" rel="noopener noreferrer">
            <Button>
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Open form
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
