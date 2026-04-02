import type { Request, Response } from 'express';
import { AppError } from '@snapform/shared';
import { userService } from './user.service';
import { sendSuccess, sendNoContent } from '../../utils/response';

export const userController = {
  async getMe(req: Request, res: Response) {
    const userId = req.user!.sub;
    const profile = await userService.getProfile(userId);
    sendSuccess(res, profile);
  },

  async updateMe(req: Request, res: Response) {
    const userId = req.user!.sub;
    const updated = await userService.updateProfile(userId, req.body);
    sendSuccess(res, updated, 'Profile updated');
  },

  async deleteMe(req: Request, res: Response) {
    const userId = req.user!.sub;
    await userService.deleteAccount(userId);
    sendNoContent(res);
  },
};
