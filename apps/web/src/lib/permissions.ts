export { PERMISSIONS, ROLE_PERMISSIONS } from '@snapform/shared';
export type { Permission } from '@snapform/shared';

export function hasPermission(userPermissions: string[], permission: string): boolean {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(userPermissions: string[], permissions: string[]): boolean {
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
  return permissions.every((p) => userPermissions.includes(p));
}
