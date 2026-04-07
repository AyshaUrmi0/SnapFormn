'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Plus, MoreHorizontal, FileText, Pencil, Type, Link2, CopyPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useModal } from '@/providers/modal-provider';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { useForms, useDeleteForm, useUpdateForm, useDuplicateForm } from '@/modules/form/form.queries';
import { RenameFormDialog } from '@/features/forms/rename-form-dialog';
import { ROUTES } from '@/constants/routes';
import type { Workspace } from '@/modules/workspace/types';
import type { Form } from '@/modules/form/types';

interface WorkspaceSwitcherProps {
  onNavigate?: () => void;
}

function FormItemMenu({
  form,
  workspaceId,
  onNavigate,
}: {
  form: Form;
  workspaceId: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { confirm } = useModal();
  const deleteForm = useDeleteForm();
  const duplicateForm = useDuplicateForm();
  const updateForm = useUpdateForm();
  const [showRename, setShowRename] = useState(false);

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete form',
      description: `Are you sure you want to delete "${form.title}"? All submissions will be permanently lost.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (confirmed) {
      deleteForm.mutate({ workspaceId, formId: form.id });
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard');
    });
  }

  function handleRename(newTitle: string) {
    updateForm.mutate(
      { workspaceId, formId: form.id, data: { title: newTitle } },
      { onSuccess: () => setShowRename(false) },
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="p-0.5 rounded hover:bg-sidebar-accent opacity-0 group-hover/form:opacity-100 transition-opacity shrink-0"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => { router.push(ROUTES.workspace(workspaceId).form(form.id).EDIT); onNavigate?.(); }}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowRename(true)}>
              <Type className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            {form.status === 'PUBLISHED' && (
              <DropdownMenuItem onClick={handleCopyLink}>
                <Link2 className="mr-2 h-3.5 w-3.5" />
                Copy link
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => duplicateForm.mutate({ workspaceId, formId: form.id })}>
              <CopyPlus className="mr-2 h-3.5 w-3.5" />
              Duplicate
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameFormDialog
        open={showRename}
        onOpenChange={setShowRename}
        currentTitle={form.title}
        onRename={handleRename}
        loading={updateForm.isPending}
      />
    </>
  );
}

function WorkspaceItem({
  workspace,
  isActive,
  onNavigate,
}: {
  workspace: Workspace;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const pathname = usePathname();

  const { data: forms } = useForms({ workspaceId: workspace.id });

  const wsRoutes = ROUTES.workspace(workspace.id);

  return (
    <div>
      {/* Workspace row */}
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] transition-colors',
          isActive
            ? 'bg-sidebar-accent/70 text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 p-0.5 rounded hover:bg-sidebar-accent"
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 text-muted-foreground transition-transform',
              expanded && 'rotate-90',
            )}
          />
        </button>

        <Link href={wsRoutes.FORMS} onClick={onNavigate} className="flex-1 truncate">
          {workspace.name}
        </Link>

        {/* Actions: + for new form */}
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <Link
            href={wsRoutes.NEW_FORM}
            onClick={onNavigate}
            className="p-0.5 rounded hover:bg-sidebar-accent"
            title="Create form"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Forms list (expanded) */}
      {expanded && (
        <div className="ml-3 border-l border-sidebar-border pl-2 mt-0.5 space-y-0.5">
          {forms && forms.length > 0 ? (
            forms.map((form) => {
              const formHref = wsRoutes.form(form.id).EDIT;
              const formBase = `/${workspace.id}/forms/${form.id}`;
              const isFormActive = pathname.startsWith(formBase);
              return (
                <div
                  key={form.id}
                  className={cn(
                    'group/form flex items-center gap-1 rounded-md pr-1 transition-colors',
                    isFormActive ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50',
                  )}
                >
                  <Link
                    href={formHref}
                    onClick={onNavigate}
                    className={cn(
                      'flex-1 flex items-center gap-2 rounded-md px-2 py-1 text-[13px] min-w-0 transition-colors',
                      isFormActive
                        ? 'text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground',
                    )}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{form.title}</span>
                  </Link>
                  <FormItemMenu
                    form={form}
                    workspaceId={workspace.id}
                    onNavigate={onNavigate}
                  />
                </div>
              );
            })
          ) : (
            <p className="px-2 py-1 text-[12px] text-muted-foreground italic">No forms yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkspaceSwitcher({ onNavigate }: WorkspaceSwitcherProps) {
  const pathname = usePathname();
  const { data: workspaces } = useWorkspaces();

  // Extract current workspaceId from pathname
  const segments = pathname.split('/').filter(Boolean);
  const currentWorkspaceId = segments[0] !== 'workspaces' ? segments[0] : null;

  if (!workspaces || workspaces.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {workspaces.map((ws) => (
        <WorkspaceItem
          key={ws.id}
          workspace={ws}
          isActive={ws.id === currentWorkspaceId}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
