import { createApi, methodsEnums } from '@/lib/createApi';
import type {
  Submission,
  SubmitFormKeys,
  ListSubmissionsKeys,
  GetSubmissionKeys,
  DeleteSubmissionKeys,
} from './types';

const { GET, POST, DELETE } = methodsEnums;

// ─── Public ──────────────────────────────────────────────────

function submitFormRequest({ slug, data }: SubmitFormKeys) {
  return { url: `/submissions/${slug}`, method: POST, data };
}

export const submitForm = createApi<SubmitFormKeys, Submission>({
  request: submitFormRequest,
});

// ─── Workspace-scoped ────────────────────────────────────────

function listSubmissionsRequest({ workspaceId, formId, params }: ListSubmissionsKeys) {
  return {
    url: `/submissions/workspace/${workspaceId}/forms/${formId}`,
    method: GET,
    params: params as Record<string, string | number | undefined>,
  };
}

export const listSubmissions = createApi<ListSubmissionsKeys, Submission[]>({
  request: listSubmissionsRequest,
});

function getSubmissionRequest({ workspaceId, formId, submissionId }: GetSubmissionKeys) {
  return {
    url: `/submissions/workspace/${workspaceId}/forms/${formId}/${submissionId}`,
    method: GET,
  };
}

export const getSubmission = createApi<GetSubmissionKeys, Submission>({
  request: getSubmissionRequest,
});

function deleteSubmissionRequest({ workspaceId, formId, submissionId }: DeleteSubmissionKeys) {
  return {
    url: `/submissions/workspace/${workspaceId}/forms/${formId}/${submissionId}`,
    method: DELETE,
  };
}

export const deleteSubmission = createApi<DeleteSubmissionKeys, void>({
  request: deleteSubmissionRequest,
});
