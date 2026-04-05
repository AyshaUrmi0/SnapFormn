'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAccessToken, refreshAccessToken } from '@/lib/api-client';
import { getMe } from '@/modules/auth/auth.service';
import { queryKeys } from '@/constants/query-keys';
import type { User } from '@/modules/auth/types';

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
      const userData = await getMe();
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

  // Restore session on mount — always attempt refresh via httpOnly cookie
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await refreshAccessToken();
        if (token) {
          await refreshUser();
        }
      } catch {
        // No valid session
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
