import { prisma } from '../../lib/prisma';

export const submissionRepository = {
  create(data: {
    formId: string;
    respondentIp?: string;
    userAgent?: string;
    fields: Array<{ fieldId: string; value: unknown }>;
  }) {
    return prisma.submission.create({
      data: {
        formId: data.formId,
        respondentIp: data.respondentIp,
        userAgent: data.userAgent,
        completedAt: new Date(),
        fields: {
          create: data.fields.map((f) => ({
            fieldId: f.fieldId,
            value: f.value as any,
          })),
        },
      },
      include: { fields: true },
    });
  },

  findByForm(formId: string, options: { skip: number; take: number }) {
    return Promise.all([
      prisma.submission.findMany({
        where: { formId },
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
        include: {
          fields: {
            include: { field: { select: { label: true, type: true } } },
          },
        },
      }),
      prisma.submission.count({ where: { formId } }),
    ]);
  },

  findById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        fields: {
          include: { field: { select: { label: true, type: true } } },
        },
      },
    });
  },

  delete(id: string) {
    return prisma.submission.delete({ where: { id } });
  },
};
