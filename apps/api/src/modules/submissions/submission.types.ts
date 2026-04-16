export interface SubmitFormInput {
  fields: Array<{
    fieldId: string;
    value: unknown;
  }>;
  recaptchaToken?: string;
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
