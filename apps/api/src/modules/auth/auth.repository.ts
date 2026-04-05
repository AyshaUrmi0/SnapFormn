import { prisma } from '../../lib/prisma';
import type { OtpPurpose, Prisma } from '@prisma/client';

export const authRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  createOtp(data: { userId: string; code: string; purpose: OtpPurpose; expiresAt: Date }) {
    return prisma.otpCode.create({
      data: {
        user: { connect: { id: data.userId } },
        code: data.code,
        purpose: data.purpose,
        expiresAt: data.expiresAt,
      },
    });
  },

  findValidOtp(userId: string, code: string, purpose: OtpPurpose) {
    return prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  markOtpUsed(id: string) {
    return prisma.otpCode.update({ where: { id }, data: { used: true } });
  },

  createRefreshToken(data: { userId: string; token: string; family: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data: {
        user: { connect: { id: data.userId } },
        token: data.token,
        family: data.family,
        expiresAt: data.expiresAt,
      },
    });
  },

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  revokeTokenFamily(family: string) {
    return prisma.refreshToken.updateMany({
      where: { family },
      data: { revoked: true },
    });
  },
};
