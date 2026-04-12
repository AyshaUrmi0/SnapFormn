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

  countByWorkspaceThisMonth(workspaceId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return prisma.submission.count({
      where: {
        createdAt: { gte: startOfMonth },
        form: { workspaceId, deletedAt: null },
      },
    });
  },

  async getAnalyticsOverview(formId: string) {
    const [total, completed, agg] = await Promise.all([
      prisma.submission.count({ where: { formId } }),
      prisma.submission.count({ where: { formId, completedAt: { not: null } } }),
      prisma.submission.aggregate({
        where: { formId },
        _min: { createdAt: true },
        _max: { createdAt: true },
      }),
    ]);

    return {
      totalSubmissions: total,
      completedSubmissions: completed,
      firstSubmissionAt: agg._min.createdAt,
      lastSubmissionAt: agg._max.createdAt,
    };
  },

  async getSubmissionTimeline(formId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM "Submission"
      WHERE "formId" = ${formId} AND "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return rows.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      count: Number(r.count),
    }));
  },

  async getFieldStats(formId: string) {
    const totalSubmissions = await prisma.submission.count({ where: { formId } });
    if (totalSubmissions === 0) return { stats: [], totalSubmissions: 0 };

    const fields = await prisma.formField.findMany({
      where: { formId },
      orderBy: { order: 'asc' },
      select: { id: true, label: true, type: true },
    });

    const counts = await prisma.submissionField.groupBy({
      by: ['fieldId'],
      where: { submission: { formId } },
      _count: { id: true },
    });

    const countMap = new Map(counts.map((c) => [c.fieldId, c._count.id]));

    const stats = fields.map((f) => {
      const responseCount = countMap.get(f.id) ?? 0;
      return {
        fieldId: f.id,
        label: f.label,
        type: f.type,
        responseCount,
        responseRate: Math.round((responseCount / totalSubmissions) * 100),
      };
    });

    return { stats, totalSubmissions };
  },
};
