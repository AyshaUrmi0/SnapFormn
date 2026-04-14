'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/constants/query-keys';
import { getErrorMessage } from '@/lib/errors';
import {
  getFormBySlug,
  listForms,
  getForm,
  createForm,
  updateForm,
  updateFormStatus,
  updateFormFields,
  duplicateForm,
  deleteForm,
  listTrash,
  restoreForm,
  permanentDeleteForm,
  emptyTrash,
} from './form.service';
import type {
  Form,
  FormField,
  GetFormBySlugKeys,
  ListFormsKeys,
  GetFormKeys,
  CreateFormKeys,
  UpdateFormKeys,
  UpdateFormStatusKeys,
  UpdateFormFieldsKeys,
  DuplicateFormKeys,
  DeleteFormKeys,
  ListTrashKeys,
  RestoreFormKeys,
  PermanentDeleteFormKeys,
  EmptyTrashKeys,
} from './types';

// ─── Queries ─────────────────────────────────────────────────

export const useFormBySlug = (slug: string) => {
  return useQuery<Form & { fields: FormField[] }, Error>({
    queryKey: queryKeys.forms.public(slug),
    queryFn: () => getFormBySlug({ slug }),
    enabled: !!slug,
  });
};

export const useForms = (params: ListFormsKeys) => {
  return useQuery<Form[], Error>({
    queryKey: queryKeys.forms.list(params.workspaceId, params.params?.status),
    queryFn: () => listForms(params),
    enabled: !!params.workspaceId,
  });
};

export const useForm = (workspaceId: string, formId: string) => {
  return useQuery<Form & { fields: FormField[] }, Error>({
    queryKey: queryKeys.forms.detail(workspaceId, formId),
    queryFn: () => getForm({ workspaceId, formId }),
    enabled: !!workspaceId && !!formId,
  });
};

// ─── Mutations ───────────────────────────────────────────────

export const useCreateForm = () => {
  const queryClient = useQueryClient();

  return useMutation<Form, Error, CreateFormKeys>({
    mutationFn: (params: CreateFormKeys) => createForm(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.list(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.usage(variables.workspaceId),
      });
      toast.success('Form created!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();

  return useMutation<Form, Error, UpdateFormKeys>({
    mutationFn: (params: UpdateFormKeys) => updateForm(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.list(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.detail(variables.workspaceId, variables.formId),
      });
      toast.success('Form updated!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateFormStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Form, Error, UpdateFormStatusKeys>({
    mutationFn: (params: UpdateFormStatusKeys) => updateFormStatus(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.list(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.detail(variables.workspaceId, variables.formId),
      });
      toast.success('Form status updated!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useUpdateFormFields = () => {
  const queryClient = useQueryClient();

  return useMutation<FormField[], Error, UpdateFormFieldsKeys>({
    mutationFn: (params: UpdateFormFieldsKeys) => updateFormFields(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.detail(variables.workspaceId, variables.formId),
      });
      toast.success('Fields updated!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDuplicateForm = () => {
  const queryClient = useQueryClient();

  return useMutation<Form, Error, DuplicateFormKeys>({
    mutationFn: (params: DuplicateFormKeys) => duplicateForm(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.list(variables.workspaceId),
      });
      toast.success('Form duplicated!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteFormKeys>({
    mutationFn: (params: DeleteFormKeys) => deleteForm(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.list(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.usage(variables.workspaceId),
      });
      toast.success('Form moved to trash.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

// ─── Trash ──────────────────────────────────────────────────

export const useTrash = (workspaceId: string) => {
  return useQuery<Form[], Error>({
    queryKey: queryKeys.forms.trash(workspaceId),
    queryFn: () => listTrash({ workspaceId }),
    enabled: !!workspaceId,
  });
};

export const useRestoreForm = () => {
  const queryClient = useQueryClient();

  return useMutation<Form, Error, RestoreFormKeys>({
    mutationFn: (params: RestoreFormKeys) => restoreForm(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.list(variables.workspaceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.trash(variables.workspaceId),
      });
      toast.success('Form restored.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const usePermanentDeleteForm = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, PermanentDeleteFormKeys>({
    mutationFn: (params: PermanentDeleteFormKeys) => permanentDeleteForm(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.trash(variables.workspaceId),
      });
      toast.success('Form permanently deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

export const useEmptyTrash = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, EmptyTrashKeys>({
    mutationFn: (params: EmptyTrashKeys) => emptyTrash(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.forms.trash(variables.workspaceId),
      });
      toast.success('Trash emptied.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
