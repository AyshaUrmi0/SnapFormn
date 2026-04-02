import { prisma } from '../../lib/prisma';
import type { Prisma } from '@prisma/client';

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        systemRole: true,
        createdAt: true,
      },
    });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  },

  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
