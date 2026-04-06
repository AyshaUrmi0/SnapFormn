'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PermissionGate } from '@/components/shared/permission-gate';
import { PageHeader } from '@/components/layout/page-header';
import { useModal } from '@/providers/modal-provider';
import { useWorkspaceContext } from '@/providers/workspace-provider';
import { useAuth } from '@/hooks/use-auth';
import {
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
} from '@/modules/workspace/workspace.queries';
import { inviteMemberSchema, type InviteMemberValues } from '@/modules/workspace/schemas';
import { PERMISSIONS } from '@/lib/permissions';
import type { WorkspaceMember, WorkspaceRole } from '@/modules/workspace/types';

const ASSIGNABLE_ROLES: WorkspaceRole[] = ['ADMIN', 'EDITOR', 'VIEWER'];

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export default function WorkspaceMembersPage() {
  const { workspace, currentUserPermissions } = useWorkspaceContext();
  const { user } = useAuth();
  const inviteMember = useInviteMember();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const { confirm } = useModal();

  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'EDITOR',
    },
  });

  function onInvite(values: InviteMemberValues) {
    inviteMember.mutate(
      { workspaceId: workspace.id, data: values },
      { onSuccess: () => form.reset() },
    );
  }

  async function handleRoleChange(member: WorkspaceMember, role: WorkspaceRole) {
    const confirmed = await confirm({
      title: 'Change member role',
      description: `Are you sure you want to change ${member.user?.name || member.user?.email}'s role to ${role}?`,
      confirmLabel: 'Change role',
    });
    if (confirmed) {
      updateMemberRole.mutate({
        workspaceId: workspace.id,
        memberId: member.id,
        data: { role },
      });
    }
  }

  async function handleRemove(member: WorkspaceMember) {
    const confirmed = await confirm({
      title: 'Remove member',
      description: `Are you sure you want to remove ${member.user?.name || member.user?.email} from this workspace?`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (confirmed) {
      removeMember.mutate({ workspaceId: workspace.id, memberId: member.id });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Members" description={`Manage members of ${workspace.name}`} />

      <PermissionGate
        permissions={[PERMISSIONS.MEMBER_INVITE]}
        userPermissions={currentUserPermissions}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invite member</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onInvite)} className="flex gap-3 items-end">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="colleague@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          {...field}
                        >
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={inviteMember.isPending}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </PermissionGate>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Members ({workspace.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workspace.members.map((member) => {
            const isOwner = member.role === 'OWNER';
            const isSelf = member.userId === user?.id;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user?.name, member.user?.email ?? '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user?.name ?? member.user?.email}
                      {isSelf && (
                        <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isOwner ? 'default' : 'secondary'}>{member.role}</Badge>

                  {!isOwner && !isSelf && (
                    <PermissionGate
                      permissions={[PERMISSIONS.MEMBER_MANAGE_ROLE]}
                      userPermissions={currentUserPermissions}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            {ASSIGNABLE_ROLES.map((role) => (
                              <DropdownMenuItem
                                key={role}
                                disabled={member.role === role}
                                onClick={() => handleRoleChange(member, role)}
                              >
                                Set as {role}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemove(member)}
                            >
                              Remove member
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </PermissionGate>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

    </div>
  );
}
