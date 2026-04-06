'use client';

import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGate } from '@/components/shared/permission-gate';
import { FormStatusBadge } from './form-status-badge';
import { PERMISSIONS } from '@/lib/permissions';
import { ROUTES } from '@/constants/routes';
import type { Form, FormStatus } from '@/modules/form/types';

interface FormCardProps {
  form: Form;
  workspaceId: string;
  onDelete: (form: Form) => void;
  onStatusChange: (form: Form, status: FormStatus) => void;
  userPermissions: string[];
}

export function FormCard({ form, workspaceId, onDelete, onStatusChange, userPermissions }: FormCardProps) {
  const submissions = form._count?.submissions ?? 0;

  return (
    <Link href={ROUTES.workspace(workspaceId).form(form.id).EDIT}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full relative">
        <CardHeader className="pb-2 pr-10">
          <CardTitle className="text-base truncate">{form.title}</CardTitle>
          <p className="text-xs text-muted-foreground">/{form.slug}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <FormStatusBadge status={form.status} />
            <span className="text-xs text-muted-foreground">
              {submissions} submission{submissions !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(form.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>

        <div
          className="absolute top-3 right-3"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PermissionGate permissions={[PERMISSIONS.FORM_PUBLISH]} userPermissions={userPermissions}>
                <DropdownMenuGroup>
                  {form.status !== 'DRAFT' && (
                    <DropdownMenuItem onClick={() => onStatusChange(form, 'DRAFT')}>
                      Set as Draft
                    </DropdownMenuItem>
                  )}
                  {form.status !== 'PUBLISHED' && (
                    <DropdownMenuItem onClick={() => onStatusChange(form, 'PUBLISHED')}>
                      Publish
                    </DropdownMenuItem>
                  )}
                  {form.status !== 'CLOSED' && (
                    <DropdownMenuItem onClick={() => onStatusChange(form, 'CLOSED')}>
                      Close
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </PermissionGate>
              <PermissionGate permissions={[PERMISSIONS.FORM_DELETE]} userPermissions={userPermissions}>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(form)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </Link>
  );
}
