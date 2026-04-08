'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/constants/query-keys';
import { getErrorMessage } from '@/lib/errors';
import {
  submitForm,
  listSubmissions,
  getSubmission,
  deleteSubmission,
  getAnalytics,
} from './submission.service';
import type {
  Submission,
  FormAnalytics,
  SubmitFormKeys,
  ListSubmissionsKeys,
  GetSubmissionKeys,
  DeleteSubmissionKeys,
} from './types';

// ─── Queries ─────────────────────────────────────────────────

export const useSubmissions = (params: ListSubmissionsKeys) => {
  return useQuery<Submission[], Error>({
    queryKey: queryKeys.submissions.list(params.workspaceId, params.formId),
    queryFn: () => listSubmissions(params),
    enabled: !!params.workspaceId && !!params.formId,
  });
};

export const useSubmission = (workspaceId: string, formId: string, submissionId: string) => {
  return useQuery<Submission, Error>({
    queryKey: queryKeys.submissions.detail(workspaceId, formId, submissionId),
    queryFn: () => getSubmission({ workspaceId, formId, submissionId }),
    enabled: !!workspaceId && !!formId && !!submissionId,
  });
};

export const useFormAnalytics = (workspaceId: string, formId: string, days = 30) => {
  return useQuery<FormAnalytics, Error>({
    queryKey: queryKeys.submissions.analytics(workspaceId, formId),
    queryFn: () => getAnalytics({ workspaceId, formId, days }),
    enabled: !!workspaceId && !!formId,
  });
};

// ─── Mutations ───────────────────────────────────────────────

export const useSubmitForm = () => {
  return useMutation<Submission, Error, SubmitFormKeys>({
    mutationFn: (params: SubmitFormKeys) => submitForm(params),
    onSuccess: () => {
      toast.success('Form submitted!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteSubmissionKeys>({
    mutationFn: (params: DeleteSubmissionKeys) => deleteSubmission(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.submissions.list(variables.workspaceId, variables.formId),
      });
      toast.success('Submission deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
