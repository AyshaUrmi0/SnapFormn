import { AppError, paginate, buildPaginationMeta } from '@snapform/shared';
import { prisma } from '../../lib/prisma';
import { PLAN_LIMITS } from '../../config/planLimits';
import { submissionRepository } from './submission.repository';
import { formRepository } from '../forms/form.repository';
import { uploadService } from '../uploads/upload.service';
import { extractSchedule, getScheduleStatus } from '../forms/schedule';
import type { SubmitFormInput, FormAnalytics } from './submission.types';

// Media field value shape stored in SubmissionField.value
interface MediaValue {
  url?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

function extractMediaValues(
  fields: Array<{ value: unknown; field?: { type?: string } | null }>,
): Array<{ publicId: string; resourceType: 'image' | 'video' | 'raw' | 'auto' }> {
  const media: Array<{ publicId: string; resourceType: 'image' | 'video' | 'raw' | 'auto' }> = [];
  for (const f of fields) {
    const val = f.value as MediaValue | null;
    if (val && typeof val === 'object' && typeof val.publicId === 'string') {
      media.push({
        publicId: val.publicId,
        resourceType: val.resourceType ?? 'auto',
      });
    }
  }
  return media;
}

export const submissionService = {
  async submit(slug: string, input: SubmitFormInput, ip?: string, userAgent?: string) {
    const form = await formRepository.findPublicBySlug(slug);
    if (!form) throw AppError.notFound('Form not found or not published');

    // Enforce form schedule (start/end date + max submissions cap)
    const schedule = extractSchedule(form.settings);
    if (schedule) {
      const totalCount = await prisma.submission.count({ where: { formId: form.id } });
      const status = getScheduleStatus(schedule, totalCount);
      if (status.state === 'not_yet_open') {
        throw AppError.forbidden(
          `This form is not yet accepting responses. It opens on ${status.opensAt.toLocaleString()}.`,
        );
      }
      if (status.state === 'closed_by_date') {
        throw AppError.forbidden(
          `This form stopped accepting responses on ${status.closedAt.toLocaleString()}.`,
        );
      }
      if (status.state === 'closed_by_cap') {
        throw AppError.forbidden(
          `This form has reached its maximum of ${status.cap} responses.`,
        );
      }
    }

    // Enforce monthly submission limit based on workspace plan
    const workspace = await prisma.workspace.findUnique({
      where: { id: form.workspaceId },
      select: { plan: true },
    });
    if (workspace) {
      const limit = PLAN_LIMITS[workspace.plan].maxSubmissionsPerMonth;
      if (limit !== null) {
        const current = await submissionRepository.countByWorkspaceThisMonth(form.workspaceId);
        if (current >= limit) {
          throw AppError.planLimitExceeded(
            'This form has reached its monthly submission limit. Please try again later.',
          );
        }
      }
    }

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

    // Clean up any Cloudinary assets referenced by this submission's fields
    const mediaAssets = extractMediaValues(submission.fields ?? []);
    for (const asset of mediaAssets) {
      await uploadService.destroy(asset.publicId, asset.resourceType);
    }

    await submissionRepository.delete(submissionId);
  },

  async getAnalytics(formId: string, days: number): Promise<FormAnalytics> {
    const [overview, timeline, fieldData] = await Promise.all([
      submissionRepository.getAnalyticsOverview(formId),
      submissionRepository.getSubmissionTimeline(formId, days),
      submissionRepository.getFieldStats(formId),
    ]);

    const completionRate =
      overview.totalSubmissions > 0
        ? Math.round((overview.completedSubmissions / overview.totalSubmissions) * 100)
        : 0;

    return {
      overview: {
        totalSubmissions: overview.totalSubmissions,
        completedSubmissions: overview.completedSubmissions,
        completionRate,
        firstSubmissionAt: overview.firstSubmissionAt?.toISOString() ?? null,
        lastSubmissionAt: overview.lastSubmissionAt?.toISOString() ?? null,
      },
      timeline,
      fieldStats: fieldData.stats,
    };
  },
};
