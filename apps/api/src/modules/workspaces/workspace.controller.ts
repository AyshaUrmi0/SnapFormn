import type { Request, Response } from 'express';
import { workspaceService } from './workspace.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';

export const workspaceController = {
  async create(req: Request, res: Response) {
    const userId = req.user!.sub;
    const workspace = await workspaceService.create(userId, req.body);
    sendCreated(res, workspace, 'Workspace created');
  },

  async list(req: Request, res: Response) {
    const userId = req.user!.sub;
    const workspaces = await workspaceService.listByUser(userId);
    sendSuccess(res, workspaces);
  },

  async getById(req: Request, res: Response) {
    const workspace = await workspaceService.getById(req.params.workspaceId as string);
    sendSuccess(res, workspace);
  },

  async update(req: Request, res: Response) {
    const workspace = await workspaceService.update(req.params.workspaceId as string, req.body);
    sendSuccess(res, workspace, 'Workspace updated');
  },

  async delete(req: Request, res: Response) {
    const userId = req.user!.sub;
    await workspaceService.delete(req.params.workspaceId as string, userId);
    sendNoContent(res);
  },

  async inviteMember(req: Request, res: Response) {
    const { email, role } = req.body;
    const member = await workspaceService.inviteMember(req.params.workspaceId as string, email, role);
    sendCreated(res, member, 'Member invited');
  },

  async updateMemberRole(req: Request, res: Response) {
    const member = await workspaceService.updateMemberRole(req.params.memberId as string, req.body.role);
    sendSuccess(res, member, 'Member role updated');
  },

  async removeMember(req: Request, res: Response) {
    await workspaceService.removeMember(req.params.memberId as string);
    sendNoContent(res);
  },
};
