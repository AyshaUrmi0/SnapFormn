export const PERMISSIONS = {
  WORKSPACE_MANAGE: 'workspace:manage',
  WORKSPACE_DELETE: 'workspace:delete',
  MEMBER_INVITE: 'member:invite',
  MEMBER_REMOVE: 'member:remove',
  MEMBER_MANAGE_ROLE: 'member:manage_role',
  FORM_CREATE: 'form:create',
  FORM_EDIT: 'form:edit',
  FORM_DELETE: 'form:delete',
  FORM_PUBLISH: 'form:publish',
  FORM_VIEW: 'form:view',
  SUBMISSION_VIEW: 'submission:view',
  SUBMISSION_DELETE: 'submission:delete',
  SUBMISSION_EXPORT: 'submission:export',
  BILLING_MANAGE: 'billing:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(userPermissions: string[], permission: string): boolean {
  return userPermissions.includes(permission);
}

export function hasAnyPermission(userPermissions: string[], permissions: string[]): boolean {
  return permissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(userPermissions: string[], permissions: string[]): boolean {
  return permissions.every((p) => userPermissions.includes(p));
}
