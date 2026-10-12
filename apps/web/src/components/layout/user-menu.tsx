'use client';

import { useRouter } from 'next/navigation';
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
import { LogOut, ChevronDown, Settings } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/constants/routes';

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
  const router = useRouter();
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          sidebar
            ? 'flex items-center gap-2 rounded-lg p-1.5 hover:bg-sidebar-accent outline-none w-full text-left transition-colors cursor-pointer group'
            : 'flex items-center gap-2 rounded-lg p-1 hover:bg-sidebar-accent outline-none transition-colors cursor-pointer'
        }
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 ring-1 ring-primary/20">
          {getInitials(user.name, user.email)}
        </span>
        {showName && (
          <>
            <span className="text-[13px] font-medium truncate flex-1 group-hover:text-foreground">
              {user.name || user.email}
            </span>
            {sidebar && (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            )}
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={sidebar ? 'start' : 'end'} className="w-60 p-1.5 shadow-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                {getInitials(user.name, user.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate leading-tight">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push(ROUTES.SETTINGS)}
            className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-xs font-medium"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Account Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex items-center gap-2.5 px-2.5 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer text-xs font-medium"
          >
            {logout.isPending ? (
              <Spinner size="xs" variant="muted" />
            ) : (
              <LogOut className="h-4 w-4 shrink-0" />
            )}
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
