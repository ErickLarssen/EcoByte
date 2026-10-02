import type { Request, Response } from "express";
import { changePassword, getProfile, updateProfile } from "../services/profile.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { startSession } from "../utils/session.js";

// GET /api/v1/profile
export async function getProfileHandler(req: Request, res: Response): Promise<void> {
  const user = await getProfile(req.user!.id);
  sendSuccess(res, 200, "Perfil encontrado.", { user });
}

// PATCH /api/v1/profile
export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  const user = await updateProfile(req.user!.id, req.body);
  sendSuccess(res, 200, "Perfil atualizado.", { user });
}

// PATCH /api/v1/profile/password — a sessão atual continua, com novo
// identificador (09 §20); as demais sessões dependem de OQ-060.
export async function changePasswordHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  await changePassword(userId, req.body);
  await startSession(req, userId);
  sendSuccess(res, 200, "Senha alterada com sucesso.", null);
}
