'use client';

import Link from 'next/link';
import { ArrowLeft, Save, Eye, ChevronRight, Globe, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/constants/routes';
import type { FormStatus } from '@/modules/form/types';

interface EditorTopbarProps {
  workspaceId: string;
  workspaceName: string;
  title: string;
  status: FormStatus;
  isDirty: boolean;
  isSaving: boolean;
  isPreview: boolean;
  onSave: () => void;
  onStatusChange: (status: FormStatus) => void;
  onTogglePreview: () => void;
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
  workspaceName,
  title,
  status,
  isDirty,
  isSaving,
  isPreview,
  onSave,
  onStatusChange,
  onTogglePreview,
}: EditorTopbarProps) {
  return (
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

        <Badge variant={STATUS_VARIANTS[status]} className="text-[10px] ml-2 shrink-0">
          {STATUS_LABELS[status]}
        </Badge>

        {isDirty && (
          <span className="text-[10px] text-muted-foreground ml-1.5 shrink-0">Unsaved</span>
        )}
      </div>

      {/* Right: Actions — always aligned */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isDirty && (
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

        <Button
          variant={isPreview ? 'default' : 'ghost'}
          size="sm"
          onClick={onTogglePreview}
          className="h-8 text-xs gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>

        {status === 'DRAFT' && (
          <Button
            size="sm"
            onClick={() => onStatusChange('PUBLISHED')}
            className="h-8 text-xs gap-1.5"
          >
            <Globe className="h-3.5 w-3.5" />
            Publish
          </Button>
        )}

        {status === 'PUBLISHED' && (
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

        {status === 'CLOSED' && (
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
  );
}
