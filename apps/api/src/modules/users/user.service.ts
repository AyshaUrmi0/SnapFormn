import { AppError } from '@snapform/shared';
import { userRepository } from './user.repository';
import type { UpdateProfileInput } from './user.types';

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    return userRepository.update(userId, data);
  },

  async deleteAccount(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    await userRepository.delete(userId);
  },
};
