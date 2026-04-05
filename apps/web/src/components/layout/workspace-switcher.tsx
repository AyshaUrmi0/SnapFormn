'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Briefcase, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspaces } from '@/modules/workspace/workspace.queries';
import { ROUTES } from '@/constants/routes';

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
  const pathname = usePathname();
  const { data: workspaces } = useWorkspaces();

  // Extract workspaceId from pathname: /[workspaceId]/...
  const segments = pathname.split('/').filter(Boolean);
  const workspaceId = segments[0] !== 'workspaces' ? segments[0] : null;
  const currentWorkspace = workspaces?.find((ws) => ws.id === workspaceId);

  if (!currentWorkspace) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent outline-none w-full text-left"
        title={collapsed ? currentWorkspace.name : undefined}
      >
        <Briefcase className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="text-sm font-semibold truncate flex-1">
              {currentWorkspace.name}
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          {workspaces?.map((ws) => (
            <DropdownMenuItem key={ws.id} disabled={ws.id === workspaceId}>
              <Link
                href={ROUTES.workspace(ws.id).FORMS}
                className="flex items-center gap-2 w-full"
              >
                <Briefcase className="h-4 w-4" />
                <span className="truncate">{ws.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={ROUTES.WORKSPACES} className="flex items-center gap-2 w-full">
              All workspaces
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={ROUTES.NEW_WORKSPACE} className="flex items-center gap-2 w-full">
              <Plus className="h-4 w-4" />
              Create workspace
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
