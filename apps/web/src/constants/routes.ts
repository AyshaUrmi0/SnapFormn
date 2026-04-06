export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  COMPLETE_PROFILE: '/complete-profile',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Dashboard
  HOME: '/',
  SETTINGS: '/settings',
  SEARCH: '/search',
  DOMAINS: '/domains',
  UPGRADE: '/upgrade',
  TEMPLATES: '/templates',
  WHATS_NEW: '/whats-new',
  ROADMAP: '/roadmap',
  FEATURE_REQUESTS: '/feature-requests',
  REWARDS: '/rewards',
  TRASH: '/trash',
  GET_STARTED: '/get-started',
  GUIDES: '/guides',
  HELP_CENTER: '/help-center',
  CONTACT_SUPPORT: '/contact-support',
  MEMBERS: '/members',
  WORKSPACES: '/workspaces',
  NEW_WORKSPACE: '/workspaces/new',

  // Workspace-scoped
  workspace: (workspaceId: string) => ({
    ROOT: `/${workspaceId}`,
    FORMS: `/${workspaceId}/forms`,
    NEW_FORM: `/${workspaceId}/forms/new`,
    form: (formId: string) => ({
      ROOT: `/${workspaceId}/forms/${formId}`,
      EDIT: `/${workspaceId}/forms/${formId}/edit`,
      SUBMISSIONS: `/${workspaceId}/forms/${formId}/submissions`,
      ANALYTICS: `/${workspaceId}/forms/${formId}/analytics`,
      SETTINGS: `/${workspaceId}/forms/${formId}/settings`,
    }),
    MEMBERS: `/${workspaceId}/members`,
    SETTINGS: `/${workspaceId}/settings`,
    BILLING: `/${workspaceId}/billing`,
  }),

  // Public
  publicForm: (slug: string) => `/f/${slug}`,
  publicFormSuccess: (slug: string) => `/f/${slug}/success`,
} as const;
