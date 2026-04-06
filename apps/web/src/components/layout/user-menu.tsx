'use client';

import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-logout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, ChevronDown } from 'lucide-react';

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

interface UserMenuProps {
  showName?: boolean;
  sidebar?: boolean;
}

export function UserMenu({ showName = false, sidebar = false }: UserMenuProps) {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          sidebar
            ? 'flex items-center gap-2 rounded-md p-1.5 hover:bg-sidebar-accent outline-none w-full text-left'
            : 'flex items-center gap-2 rounded-md p-1 hover:bg-sidebar-accent outline-none'
        }
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
          {getInitials(user.name, user.email)}
        </span>
        {showName && (
          <>
            <span className="text-[13px] font-medium truncate flex-1">
              {user.name || user.email}
            </span>
            {sidebar && (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={sidebar ? 'start' : 'end'} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="text-sm font-medium">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => logout.mutate()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
