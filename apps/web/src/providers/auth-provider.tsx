'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAccessToken, getAccessToken } from '@/lib/api-client';
import { userService } from '@/services/auth.service';
import { queryKeys } from '@/constants/query-keys';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  setSession: (accessToken: string) => void;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
}

export type AuthContextValue = AuthState & AuthActions;

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await userService.getMe();
      setUser(userData);
      queryClient.setQueryData(queryKeys.users.me(), userData);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, [queryClient]);

  const setSession = useCallback(
    (accessToken: string) => {
      setAccessToken(accessToken);
      refreshUser();
    },
    [refreshUser],
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // Try to restore session on mount
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      setSession,
      clearSession,
      refreshUser,
    }),
    [user, isLoading, setSession, clearSession, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
