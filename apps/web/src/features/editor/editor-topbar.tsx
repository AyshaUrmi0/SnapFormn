'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Save, Eye, ChevronRight, Globe, RotateCcw, X, Star, Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { FormStatus } from '@/modules/form/types';

interface EditorTopbarProps {
  workspaceId: string;
  formId: string;
  workspaceName: string;
  title: string;
  slug: string;
  status: FormStatus;
  isFavorite: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  isPreview?: boolean;
  onToggleFavorite: () => void;
  onSave?: () => void;
  onStatusChange?: (status: FormStatus) => void;
  onTogglePreview?: () => void;
}

const STATUS_LABELS: Record<FormStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
};

const STATUS_VARIANTS: Record<FormStatus, 'secondary' | 'default' | 'outline'> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  CLOSED: 'outline',
};

export function EditorTopbar({
  workspaceId,
  formId,
  workspaceName,
  title,
  slug,
  status,
  isFavorite,
  isDirty = false,
  isSaving = false,
  isPreview = false,
  onToggleFavorite,
  onSave,
  onStatusChange,
  onTogglePreview,
}: EditorTopbarProps) {
  const pathname = usePathname();
  const [shareCopied, setShareCopied] = useState(false);

  const editHref = ROUTES.workspace(workspaceId).form(formId).EDIT;
  const analyticsHref = ROUTES.workspace(workspaceId).form(formId).ANALYTICS;
  const settingsHref = ROUTES.workspace(workspaceId).form(formId).SETTINGS;

  const tabs: Array<{ label: string; href: string }> = [
    { label: 'Questions', href: editHref },
    { label: 'Responses', href: analyticsHref },
    { label: 'Settings', href: settingsHref },
  ];

  const formUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${slug}` : '';
  const isPublished = status === 'PUBLISHED';

  function handleCopyLink() {
    navigator.clipboard.writeText(formUrl).then(() => {
      setShareCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setShareCopied(false), 2000);
    });
  }

  return (
    <TooltipProvider>
      <div className="flex items-center border-b bg-background px-4 h-12 shrink-0">
        {/* Left: Back + Breadcrumbs */}
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <Link
            href={ROUTES.workspace(workspaceId).FORMS}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <nav className="flex items-center gap-1 text-sm min-w-0">
            <Link
              href={ROUTES.workspace(workspaceId).FORMS}
              className="text-muted-foreground hover:text-foreground truncate max-w-[120px]"
            >
              {workspaceName}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-medium truncate max-w-[200px]">{title || 'Untitled'}</span>
          </nav>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className="ml-1 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                />
              }
            >
              <Star
                className={cn(
                  'h-4 w-4 transition-colors',
                  isFavorite && 'fill-yellow-400 text-yellow-400',
                )}
              />
            </TooltipTrigger>
            <TooltipContent>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</TooltipContent>
          </Tooltip>

          <Badge variant={STATUS_VARIANTS[status]} className="text-[11px] ml-2 shrink-0">
            {STATUS_LABELS[status]}
          </Badge>

          {isDirty && (
            <span className="text-[11px] text-muted-foreground ml-1.5 shrink-0">Unsaved</span>
          )}
        </div>

        {/* Center: Tabs */}
        <nav className="flex items-center gap-1 shrink-0 mx-4">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'px-3 h-8 inline-flex items-center text-xs rounded-full transition-colors',
                  isActive
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onSave && isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="h-8 text-xs gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          <Tooltip>
            <TooltipTrigger
              render={
                <span tabIndex={isPublished ? -1 : 0} className="inline-flex">
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          disabled={!isPublished}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Share
                        </Button>
                      }
                    />
                    <PopoverContent align="end" className="w-80">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Share form</p>
                          <p className="text-xs text-muted-foreground">
                            Anyone with this link can submit a response.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={formUrl}
                            readOnly
                            className="flex-1 text-xs h-8"
                            onFocus={(e) => (e.target as HTMLInputElement).select()}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyLink}
                            className="h-8 shrink-0"
                          >
                            {shareCopied ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </span>
              }
            />
            {!isPublished && <TooltipContent>Publish to enable sharing</TooltipContent>}
          </Tooltip>

          {onTogglePreview && (
            <Button
              variant={isPreview ? 'default' : 'ghost'}
              size="sm"
              onClick={onTogglePreview}
              className="h-8 text-xs gap-1.5"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
          )}

          {onStatusChange && status === 'DRAFT' && (
            <Button
              size="sm"
              onClick={() => onStatusChange('PUBLISHED')}
              className="h-8 text-xs gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              Publish
            </Button>
          )}

          {onStatusChange && status === 'PUBLISHED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange('CLOSED')}
              className="h-8 text-xs gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Close
            </Button>
          )}

          {onStatusChange && status === 'CLOSED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange('DRAFT')}
              className="h-8 text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reopen
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
