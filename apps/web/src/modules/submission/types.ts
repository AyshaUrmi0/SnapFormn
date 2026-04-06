export interface SubmissionField {
  id: string;
  submissionId: string;
  fieldId: string;
  value: unknown;
  field?: {
    label: string;
    type: string;
  };
}

export interface Submission {
  id: string;
  formId: string;
  respondentIp: string | null;
  userAgent: string | null;
  completedAt: string | null;
  createdAt: string;
  fields?: SubmissionField[];
}

// Service input types (Keys)
export interface SubmitFormKeys {
  slug: string;
  data: { fields: Array<{ fieldId: string; value: unknown }> };
}

export interface ListSubmissionsKeys {
  workspaceId: string;
  formId: string;
  params?: { page?: number; limit?: number };
}

export interface GetSubmissionKeys {
  workspaceId: string;
  formId: string;
  submissionId: string;
}

export interface DeleteSubmissionKeys {
  workspaceId: string;
  formId: string;
  submissionId: string;
}

export interface FormAnalytics {
  overview: {
    totalSubmissions: number;
    completedSubmissions: number;
    completionRate: number;
    firstSubmissionAt: string | null;
    lastSubmissionAt: string | null;
  };
  timeline: Array<{ date: string; count: number }>;
  fieldStats: Array<{
    fieldId: string;
    label: string;
    type: string;
    responseCount: number;
    responseRate: number;
  }>;
}

export interface GetAnalyticsKeys {
  workspaceId: string;
  formId: string;
  days?: number;
}
