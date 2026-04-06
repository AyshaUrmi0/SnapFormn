'use client';

import { MoreHorizontal, Pencil, Type, Link2, CopyPlus, Trash2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { PermissionGate } from '@/components/shared/permission-gate';
import { PERMISSIONS } from '@/lib/permissions';
import type { Form } from '@/modules/form/types';

interface FormActionsMenuProps {
  form: Form;
  workspaceId: string;
  userPermissions: string[];
  onEdit: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAnalytics?: () => void;
}

export function FormActionsMenu({
  form,
  userPermissions,
  onEdit,
  onRename,
  onDuplicate,
  onDelete,
  onAnalytics,
}: FormActionsMenuProps) {
  function handleCopyLink() {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard');
    });
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
              />
            }
          >
            <Pencil className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        {form.status === 'PUBLISHED' && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopyLink(); }}
                />
              }
            >
              <Link2 className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Copy link</TooltipContent>
          </Tooltip>
        )}

        <PermissionGate permissions={[PERMISSIONS.FORM_DELETE]} userPermissions={userPermissions}>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                />
              }
            >
              <Trash2 className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </PermissionGate>

        <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <DropdownMenuGroup>
            <PermissionGate permissions={[PERMISSIONS.FORM_EDIT]} userPermissions={userPermissions}>
              <DropdownMenuItem onClick={onRename}>
                <Type className="mr-2 h-3.5 w-3.5" />
                Rename
              </DropdownMenuItem>
            </PermissionGate>
            {onAnalytics && (
              <DropdownMenuItem onClick={onAnalytics}>
                <BarChart3 className="mr-2 h-3.5 w-3.5" />
                Analytics
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <PermissionGate permissions={[PERMISSIONS.FORM_CREATE]} userPermissions={userPermissions}>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onDuplicate}>
                <CopyPlus className="mr-2 h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </PermissionGate>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
