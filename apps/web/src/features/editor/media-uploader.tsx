'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary, type ResourceType } from '@/lib/cloudinary-upload';
import { useParams } from 'next/navigation';
import type { MediaOptions } from './types';

interface MediaUploaderProps {
  /** Current media options object */
  value: MediaOptions;
  /** Called whenever src/publicId changes */
  onChange: (next: MediaOptions) => void;
  /** The editor field id — used as folder segment when signing */
  fieldId: string;
  /** Which Cloudinary resource type to request */
  resourceType: ResourceType;
  /** Optional label override (e.g. "Image" or "Video") */
  label?: string;
  /** If true, also accepts external URLs via a text input (for Video/Audio/Embed) */
  allowExternalUrl?: boolean;
}

export function MediaUploader({
  value,
  onChange,
  fieldId,
  resourceType,
  label = 'Source',
  allowExternalUrl = false,
}: MediaUploaderProps) {
  const params = useParams<{ formId?: string }>();
  const formId = params?.formId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(file: File) {
    if (!formId) {
      toast.error('Open a form in the editor to upload media');
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, {
        mode: 'owner',
        formId,
        fieldId,
        resourceType,
        onProgress: setProgress,
      });
      onChange({
        src: result.secureUrl,
        publicId: result.publicId,
        resourceType: result.resourceType,
      });
      toast.success('Uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const hasMedia = !!value.src;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Preview / current value */}
      {hasMedia && (
        <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <a
              href={value.src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate text-xs font-mono"
            >
              {value.src}
            </a>
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
          </div>
          <button
            type="button"
            onClick={() => onChange({})}
            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={
          resourceType === 'image' ? 'image/*'
          : resourceType === 'video' ? 'video/*'
          : resourceType === 'raw' ? 'audio/*,application/pdf'
          : undefined
        }
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          // reset so the same file can be picked again
          e.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Uploading {progress}%
          </>
        ) : (
          <>
            <Upload className="mr-1.5 h-4 w-4" />
            {hasMedia ? 'Replace' : 'Upload'}
          </>
        )}
      </Button>

      {/* External URL input */}
      {allowExternalUrl && (
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">or paste a URL</p>
          <Input
            value={value.src ?? ''}
            onChange={(e) => onChange({ ...value, src: (e.target as HTMLInputElement).value })}
            placeholder="https://..."
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
}
