'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PermissionGate } from '@/components/shared/permission-gate';
import { PageHeader } from '@/components/layout/page-header';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useUpdateWorkspace, useDeleteWorkspace } from '@/modules/workspace/workspace.queries';
import { updateWorkspaceSchema, type UpdateWorkspaceValues } from '@/modules/workspace/schemas';
import { PERMISSIONS } from '@/lib/permissions';
import { ROUTES } from '@/constants/routes';

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { workspace, currentUserPermissions } = useWorkspaceContext();
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<UpdateWorkspaceValues>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      slug: workspace.slug,
    },
  });

  function onSubmit(values: UpdateWorkspaceValues) {
    updateWorkspace.mutate({
      id: workspace.id,
      data: values,
    });
  }

  function handleDelete() {
    deleteWorkspace.mutate(
      { id: workspace.id },
      { onSuccess: () => router.push(ROUTES.WORKSPACES) },
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description={`Manage ${workspace.name} settings`} />

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your workspace details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateWorkspace.isPending}>
                {updateWorkspace.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <PermissionGate
        permissions={[PERMISSIONS.WORKSPACE_DELETE]}
        userPermissions={currentUserPermissions}
      >
        <Separator />

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardDescription>
              Deleting a workspace will permanently remove all forms, submissions, and members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete workspace
            </Button>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete workspace"
          description={`Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          loading={deleteWorkspace.isPending}
          variant="destructive"
        />
      </PermissionGate>
    </div>
  );
}
