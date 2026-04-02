'use client';

import type { ReactNode } from 'react';

interface PermissionGateProps {
  permissions: string[];
  userPermissions: string[];
  mode?: 'any' | 'all';
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permissions,
  userPermissions,
  mode = 'any',
  fallback = null,
  children,
}: PermissionGateProps) {
  const hasAccess =
    mode === 'any'
      ? permissions.some((p) => userPermissions.includes(p))
      : permissions.every((p) => userPermissions.includes(p));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
