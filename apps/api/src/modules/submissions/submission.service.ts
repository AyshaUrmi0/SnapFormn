import { AppError, paginate, buildPaginationMeta } from '@snapform/shared';
import { submissionRepository } from './submission.repository';
import { formRepository } from '../forms/form.repository';
import type { SubmitFormInput } from './submission.types';

export const submissionService = {
  async submit(slug: string, input: SubmitFormInput, ip?: string, userAgent?: string) {
    const form = await formRepository.findPublicBySlug(slug);
    if (!form) throw AppError.notFound('Form not found or not published');

    // Validate that all required fields are present
    const requiredFieldIds = form.fields.filter((f) => f.required).map((f) => f.id);
    const submittedFieldIds = input.fields.map((f) => f.fieldId);

    const missingRequired = requiredFieldIds.filter((id) => !submittedFieldIds.includes(id));
    if (missingRequired.length > 0) {
      const missingLabels = form.fields
        .filter((f) => missingRequired.includes(f.id))
        .map((f) => f.label);
      throw AppError.badRequest(`Missing required fields: ${missingLabels.join(', ')}`);
    }

    // Validate that all submitted field IDs belong to this form
    const validFieldIds = form.fields.map((f) => f.id);
    const invalidFields = submittedFieldIds.filter((id) => !validFieldIds.includes(id));
    if (invalidFields.length > 0) {
      throw AppError.badRequest('Submission contains invalid field IDs');
    }

    return submissionRepository.create({
      formId: form.id,
      respondentIp: ip,
      userAgent,
      fields: input.fields,
    });
  },

  async list(formId: string, page: number, limit: number) {
    const { skip, take } = paginate(page, limit);
    const [submissions, total] = await submissionRepository.findByForm(formId, { skip, take });
    const meta = buildPaginationMeta(total, page, limit);
    return { submissions, meta };
  },

  async getById(submissionId: string) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) throw AppError.notFound('Submission not found');
    return submission;
  },

  async delete(submissionId: string) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) throw AppError.notFound('Submission not found');
    await submissionRepository.delete(submissionId);
  },
};
