export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
  },
  users: {
    me: () => ['users', 'me'] as const,
  },
  workspaces: {
    all: () => ['workspaces'] as const,
    detail: (id: string) => ['workspaces', id] as const,
    members: (id: string) => ['workspaces', id, 'members'] as const,
  },
  forms: {
    list: (workspaceId: string) => ['forms', workspaceId] as const,
    detail: (workspaceId: string, formId: string) => ['forms', workspaceId, formId] as const,
    public: (slug: string) => ['forms', 'public', slug] as const,
    trash: (workspaceId: string) => ['forms', workspaceId, 'trash'] as const,
  },
  submissions: {
    list: (workspaceId: string, formId: string) =>
      ['submissions', workspaceId, formId] as const,
    detail: (workspaceId: string, formId: string, submissionId: string) =>
      ['submissions', workspaceId, formId, submissionId] as const,
    analytics: (workspaceId: string, formId: string) =>
      ['submissions', workspaceId, formId, 'analytics'] as const,
  },
  billing: {
    subscription: (workspaceId: string) => ['billing', 'subscription', workspaceId] as const,
  },
} as const;
