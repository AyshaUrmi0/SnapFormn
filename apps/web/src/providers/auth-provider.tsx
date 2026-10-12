'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAccessToken, getAccessToken, refreshAccessToken } from '@/lib/api-client';
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
    async (accessToken: string) => {
      setAccessToken(accessToken);
      await refreshUser();
    },
    [refreshUser],
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const restore = async () => {
      try {
        const storedToken = getAccessToken();
        if (storedToken) {
          try {
            const userData = await getMe();
            setUser(userData);
            queryClient.setQueryData(queryKeys.users.me(), userData);
            setIsLoading(false);
            return;
          } catch {
            // Token expired, attempt refresh token exchange below
          }
        }

        const token = await refreshAccessToken();
        if (token) {
          await refreshUser();
        } else {
          setAccessToken(null);
          setUser(null);
        }
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, [queryClient, refreshUser]);

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
