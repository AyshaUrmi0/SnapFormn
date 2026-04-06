'use client';

import { MoreHorizontal, Pencil, Type, Copy, CopyPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGate } from '@/components/shared/permission-gate';
import { PERMISSIONS } from '@/lib/permissions';
import { ROUTES } from '@/constants/routes';
import type { Form } from '@/modules/form/types';

interface FormActionsMenuProps {
  form: Form;
  workspaceId: string;
  userPermissions: string[];
  onEdit: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function FormActionsMenu({
  form,
  workspaceId,
  userPermissions,
  onEdit,
  onRename,
  onDuplicate,
  onDelete,
}: FormActionsMenuProps) {
  function handleCopyLink() {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard');
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <PermissionGate permissions={[PERMISSIONS.FORM_EDIT]} userPermissions={userPermissions}>
            <DropdownMenuItem onClick={onRename}>
              <Type className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
          </PermissionGate>
          {form.status === 'PUBLISHED' && (
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy link to share
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <PermissionGate permissions={[PERMISSIONS.FORM_CREATE]} userPermissions={userPermissions}>
            <DropdownMenuItem onClick={onDuplicate}>
              <CopyPlus className="mr-2 h-3.5 w-3.5" />
              Duplicate
            </DropdownMenuItem>
          </PermissionGate>
        </DropdownMenuGroup>
        <PermissionGate permissions={[PERMISSIONS.FORM_DELETE]} userPermissions={userPermissions}>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
