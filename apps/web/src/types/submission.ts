export interface SubmissionField {
  id: string;
  submissionId: string;
  fieldId: string;
  value: unknown;
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
