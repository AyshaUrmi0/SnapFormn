import { AppError, slugify, paginate, buildPaginationMeta } from '@snapform/shared';
import type { FormStatus } from '@prisma/client';
import { formRepository } from './form.repository';
import type { CreateFormInput, UpdateFormInput, FormFieldInput } from './form.types';

export const formService = {
  async create(workspaceId: string, userId: string, input: CreateFormInput) {
    const slug = input.slug || slugify(input.title);

    const existing = await formRepository.findBySlug(workspaceId, slug);
    if (existing) throw AppError.conflict('A form with this slug already exists in this workspace');

    return formRepository.create({
      workspace: { connect: { id: workspaceId } },
      createdBy: { connect: { id: userId } },
      title: input.title,
      slug,
      description: input.description,
    });
  },

  async list(workspaceId: string, page: number, limit: number, status?: FormStatus) {
    const { skip, take } = paginate(page, limit);
    const [forms, total] = await formRepository.findByWorkspace(workspaceId, { skip, take, status });
    const meta = buildPaginationMeta(total, page, limit);
    return { forms, meta };
  },

  async getById(formId: string) {
    const form = await formRepository.findById(formId);
    if (!form) throw AppError.notFound('Form not found');
    return form;
  },

  async getPublicBySlug(slug: string) {
    const form = await formRepository.findPublicBySlug(slug);
    if (!form) throw AppError.notFound('Form not found or not published');
    return form;
  },

  async update(formId: string, input: UpdateFormInput) {
    const form = await formRepository.findById(formId);
    if (!form) throw AppError.notFound('Form not found');

    return formRepository.update(formId, {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.settings && { settings: input.settings as object }),
    });
  },

  async updateStatus(formId: string, status: FormStatus) {
    const form = await formRepository.findById(formId);
    if (!form) throw AppError.notFound('Form not found');

    return formRepository.update(formId, {
      status,
      closedAt: status === 'CLOSED' ? new Date() : null,
    });
  },

  async replaceFields(formId: string, fields: FormFieldInput[]) {
    const form = await formRepository.findById(formId);
    if (!form) throw AppError.notFound('Form not found');

    return formRepository.replaceFields(
      formId,
      fields.map((f) => ({
        ...f,
        type: f.type as string,
        required: f.required,
      })),
    );
  },

  async duplicate(formId: string, workspaceId: string, userId: string) {
    const form = await formRepository.findById(formId);
    if (!form) throw AppError.notFound('Form not found');

    const baseTitle = `${form.title} (Copy)`;
    const baseSlug = slugify(baseTitle);

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await formRepository.findBySlug(workspaceId, slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newForm = await formRepository.create({
      workspace: { connect: { id: workspaceId } },
      createdBy: { connect: { id: userId } },
      title: baseTitle,
      slug,
      description: form.description,
    });

    // Duplicate fields
    if (form.fields && form.fields.length > 0) {
      await formRepository.replaceFields(
        newForm.id,
        form.fields.map((f) => ({
          type: f.type as string,
          label: f.label,
          description: f.description ?? undefined,
          placeholder: f.placeholder ?? undefined,
          required: f.required,
          order: f.order,
          options: f.options ?? undefined,
          validations: f.validations ?? undefined,
          conditionals: f.conditionals ?? undefined,
        })),
      );
    }

    return formRepository.findById(newForm.id);
  },

  async delete(formId: string) {
    const form = await formRepository.findById(formId);
    if (!form) throw AppError.notFound('Form not found');

    const mutatedSlug = `${form.slug}-deleted-${Date.now()}`;
    await formRepository.softDelete(formId, mutatedSlug);
  },

  async listTrash(workspaceId: string) {
    return formRepository.findTrashed(workspaceId);
  },

  async restore(formId: string, workspaceId: string) {
    const form = await formRepository.findById(formId, true);
    if (!form) throw AppError.notFound('Form not found');
    if (!form.deletedAt) throw AppError.badRequest('Form is not in trash');

    // Extract original slug by stripping the -deleted-{timestamp} suffix
    const originalSlug = form.slug.replace(/-deleted-\d+$/, '');

    // Check if the original slug is taken
    const conflict = await formRepository.findBySlug(workspaceId, originalSlug);
    const restoredSlug = conflict ? `${originalSlug}-restored-${Date.now()}` : originalSlug;

    return formRepository.restore(formId, restoredSlug);
  },

  async permanentDelete(formId: string) {
    const form = await formRepository.findById(formId, true);
    if (!form) throw AppError.notFound('Form not found');
    if (!form.deletedAt) throw AppError.badRequest('Form is not in trash');

    await formRepository.permanentDelete(formId);
  },

  async emptyTrash(workspaceId: string) {
    await formRepository.emptyTrash(workspaceId);
  },
};
