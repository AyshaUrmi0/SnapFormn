import { prisma } from '../../lib/prisma';
import type { FormStatus, Prisma } from '@prisma/client';

export const formRepository = {
  create(data: Prisma.FormCreateInput) {
    return prisma.form.create({ data, include: { fields: true } });
  },

  findById(id: string, includeDeleted = false) {
    const where: Prisma.FormWhereUniqueInput = { id };
    if (!includeDeleted) {
      (where as any).deletedAt = null;
    }
    return prisma.form.findFirst({
      where: where as Prisma.FormWhereInput,
      include: {
        fields: { orderBy: { order: 'asc' } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  },

  findBySlug(workspaceId: string, slug: string) {
    return prisma.form.findFirst({
      where: { workspaceId, slug, deletedAt: null },
    });
  },

  findPublicBySlug(slug: string) {
    return prisma.form.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: {
        fields: { orderBy: { order: 'asc' } },
      },
    });
  },

  findByWorkspace(
    workspaceId: string,
    options: { skip: number; take: number; status?: FormStatus },
  ) {
    const where: Prisma.FormWhereInput = { workspaceId, deletedAt: null };
    if (options.status) where.status = options.status;

    return Promise.all([
      prisma.form.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { submissions: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.form.count({ where }),
    ]);
  },

  update(id: string, data: Prisma.FormUpdateInput) {
    return prisma.form.update({
      where: { id },
      data,
      include: { fields: { orderBy: { order: 'asc' } } },
    });
  },

  softDelete(id: string, mutatedSlug: string) {
    return prisma.form.update({
      where: { id },
      data: { deletedAt: new Date(), slug: mutatedSlug },
    });
  },

  findTrashed(workspaceId: string) {
    return prisma.form.findMany({
      where: { workspaceId, deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  },

  restore(id: string, slug: string) {
    return prisma.form.update({
      where: { id },
      data: { deletedAt: null, slug },
      include: { fields: { orderBy: { order: 'asc' } } },
    });
  },

  permanentDelete(id: string) {
    return prisma.form.delete({ where: { id } });
  },

  emptyTrash(workspaceId: string) {
    return prisma.form.deleteMany({
      where: { workspaceId, deletedAt: { not: null } },
    });
  },

  countByWorkspace(workspaceId: string) {
    return prisma.form.count({
      where: { workspaceId, deletedAt: null },
    });
  },

  // Bulk upsert fields in a transaction
  async replaceFields(
    formId: string,
    fields: Array<{
      id?: string;
      type: string;
      label: string;
      description?: string;
      placeholder?: string;
      required: boolean;
      order: number;
      options?: unknown;
      validations?: unknown;
      conditionals?: unknown;
    }>,
  ) {
    return prisma.$transaction(async (tx) => {
      // Delete existing fields not in the new list
      const existingIds = fields.filter((f) => f.id).map((f) => f.id!);
      await tx.formField.deleteMany({
        where: {
          formId,
          ...(existingIds.length > 0 ? { id: { notIn: existingIds } } : {}),
        },
      });

      // Upsert each field
      for (const field of fields) {
        if (field.id) {
          await tx.formField.update({
            where: { id: field.id },
            data: {
              type: field.type as any,
              label: field.label,
              description: field.description,
              placeholder: field.placeholder,
              required: field.required,
              order: field.order,
              options: field.options as any,
              validations: field.validations as any,
              conditionals: field.conditionals as any,
            },
          });
        } else {
          await tx.formField.create({
            data: {
              formId,
              type: field.type as any,
              label: field.label,
              description: field.description,
              placeholder: field.placeholder,
              required: field.required,
              order: field.order,
              options: field.options as any,
              validations: field.validations as any,
              conditionals: field.conditionals as any,
            },
          });
        }
      }

      return tx.formField.findMany({
        where: { formId },
        orderBy: { order: 'asc' },
      });
    });
  },
};
