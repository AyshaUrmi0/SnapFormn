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
  DeleteFormKeys,
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

function updateFormFieldsRequest({ workspaceId, formId, fields }: UpdateFormFieldsKeys) {
  return {
    url: `/forms/workspace/${workspaceId}/${formId}/fields`,
    method: PUT,
    data: { fields },
  };
}

export const updateFormFields = createApi<UpdateFormFieldsKeys, FormField[]>({
  request: updateFormFieldsRequest,
});

function deleteFormRequest({ workspaceId, formId }: DeleteFormKeys) {
  return { url: `/forms/workspace/${workspaceId}/${formId}`, method: DELETE };
}

export const deleteForm = createApi<DeleteFormKeys, void>({
  request: deleteFormRequest,
});
