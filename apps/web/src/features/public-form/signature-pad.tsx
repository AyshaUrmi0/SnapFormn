'use client';

import { useEffect, useRef, useState } from 'react';
import { Eraser, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary, type UploadResult } from '@/lib/cloudinary-upload';

interface SignaturePadProps {
  slug: string;
  fieldId: string;
  value: UploadResult | null;
  onChange: (value: UploadResult | null) => void;
}

/**
 * HTML canvas signature pad with mouse + touch support.
 * On save, converts canvas to a PNG blob and uploads to Cloudinary
 * via the public sign endpoint.
 */
export function SignaturePad({ slug, fieldId, value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Initialize canvas context on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scale for retina / high-DPI
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111827'; // dark gray (same as foreground)
  }, []);

  function getPoint(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const t = e.touches[0] ?? e.changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    drawing.current = true;
    lastPoint.current = getPoint(e);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getPoint(e);
    const prev = lastPoint.current;
    if (prev) {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    lastPoint.current = point;
    if (!hasStrokes) setHasStrokes(true);
  }

  function endDraw() {
    drawing.current = false;
    lastPoint.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setUploading(true);
    try {
      // Convert the canvas to a PNG blob
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not export signature');

      const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });
      const result = await uploadToCloudinary(file, {
        mode: 'respondent',
        slug,
        fieldId,
        resourceType: 'image',
      });

      onChange(result);
      toast.success('Signature saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save signature');
    } finally {
      setUploading(false);
    }
  }

  // If already signed, show the stored signature image with a "re-sign" button
  if (value) {
    return (
      <div className="rounded-md border border-input bg-background p-3 flex items-center justify-between gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value.secureUrl} alt="Signature" className="h-16 bg-white rounded" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
          aria-label="Clear signature"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-md border-2 border-dashed border-input bg-background overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-32 touch-none cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasStrokes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-sm">
            Sign here
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          disabled={!hasStrokes || uploading}
        >
          <Eraser className="mr-1.5 h-3.5 w-3.5" />
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={save}
          disabled={!hasStrokes || uploading}
        >
          {uploading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Save signature
        </Button>
      </div>
    </div>
  );
}
