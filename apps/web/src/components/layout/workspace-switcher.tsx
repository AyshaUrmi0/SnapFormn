'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Plus, MoreHorizontal, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { useForms } from '@/modules/form/form.queries';
import { ROUTES } from '@/constants/routes';
import type { Workspace } from '@/modules/workspace/types';

interface WorkspaceSwitcherProps {
  onNavigate?: () => void;
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
          isActive ? 'text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground',
          'hover:bg-sidebar-accent/50',
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

        {/* Actions: ... menu and + for new form */}
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
              const isFormActive = pathname === formHref;
              return (
                <Link
                  key={form.id}
                  href={formHref}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors',
                    isFormActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                  )}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{form.title}</span>
                </Link>
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
