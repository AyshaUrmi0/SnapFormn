import { createApi, methodsEnums } from '@/lib/createApi';
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

const { GET, POST, PUT, PATCH, DELETE } = methodsEnums;

// ─── Public ──────────────────────────────────────────────────

function getFormBySlugRequest({ slug }: GetFormBySlugKeys) {
  return { url: `/forms/${slug}`, method: GET };
}

export const getFormBySlug = createApi<GetFormBySlugKeys, Form & { fields: FormField[] }>({
  request: getFormBySlugRequest,
});

// ─── Workspace-scoped ────────────────────────────────────────

function listFormsRequest({ workspaceId, params }: ListFormsKeys) {
  return {
    url: `/forms/workspace/${workspaceId}`,
    method: GET,
    params: params as Record<string, string | number | undefined>,
  };
}

export const listForms = createApi<ListFormsKeys, Form[]>({
  request: listFormsRequest,
});

function getFormRequest({ workspaceId, formId }: GetFormKeys) {
  return { url: `/forms/workspace/${workspaceId}/${formId}`, method: GET };
}

export const getForm = createApi<GetFormKeys, Form & { fields: FormField[] }>({
  request: getFormRequest,
});

function createFormRequest({ workspaceId, data }: CreateFormKeys) {
  return { url: `/forms/workspace/${workspaceId}`, method: POST, data };
}

export const createForm = createApi<CreateFormKeys, Form>({
  request: createFormRequest,
});

function updateFormRequest({ workspaceId, formId, data }: UpdateFormKeys) {
  return { url: `/forms/workspace/${workspaceId}/${formId}`, method: PATCH, data };
}

export const updateForm = createApi<UpdateFormKeys, Form>({
  request: updateFormRequest,
});

function updateFormStatusRequest({ workspaceId, formId, data }: UpdateFormStatusKeys) {
  return { url: `/forms/workspace/${workspaceId}/${formId}/status`, method: PATCH, data };
}

export const updateFormStatus = createApi<UpdateFormStatusKeys, Form>({
  request: updateFormStatusRequest,
});

function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null) result[key] = value;
  }
  return result;
}

function updateFormFieldsRequest({ workspaceId, formId, fields }: UpdateFormFieldsKeys) {
  return {
    url: `/forms/workspace/${workspaceId}/${formId}/fields`,
    method: PUT,
    data: {
      fields: fields.map((f) => stripNulls(f as unknown as Record<string, unknown>)),
    },
  };
}

export const updateFormFields = createApi<UpdateFormFieldsKeys, FormField[]>({
  request: updateFormFieldsRequest,
});

function duplicateFormRequest({ workspaceId, formId }: DuplicateFormKeys) {
  return { url: `/forms/workspace/${workspaceId}/${formId}/duplicate`, method: POST };
}

export const duplicateForm = createApi<DuplicateFormKeys, Form>({
  request: duplicateFormRequest,
});

function deleteFormRequest({ workspaceId, formId }: DeleteFormKeys) {
  return { url: `/forms/workspace/${workspaceId}/${formId}`, method: DELETE };
}

export const deleteForm = createApi<DeleteFormKeys, void>({
  request: deleteFormRequest,
});

// ─── Trash ──────────────────────────────────────────────────

function listTrashRequest({ workspaceId }: ListTrashKeys) {
  return { url: `/forms/workspace/${workspaceId}/trash`, method: GET };
}

export const listTrash = createApi<ListTrashKeys, Form[]>({
  request: listTrashRequest,
});

function restoreFormRequest({ workspaceId, formId }: RestoreFormKeys) {
  return { url: `/forms/workspace/${workspaceId}/${formId}/restore`, method: POST };
}

export const restoreForm = createApi<RestoreFormKeys, Form>({
  request: restoreFormRequest,
});

function permanentDeleteFormRequest({ workspaceId, formId }: PermanentDeleteFormKeys) {
  return { url: `/forms/workspace/${workspaceId}/${formId}/permanent`, method: DELETE };
}

export const permanentDeleteForm = createApi<PermanentDeleteFormKeys, void>({
  request: permanentDeleteFormRequest,
});

function emptyTrashRequest({ workspaceId }: EmptyTrashKeys) {
  return { url: `/forms/workspace/${workspaceId}/trash`, method: DELETE };
}

export const emptyTrash = createApi<EmptyTrashKeys, void>({
  request: emptyTrashRequest,
});
