import type { Request, Response } from "express";
import { changePassword, getProfile, updateProfile } from "../services/profile.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { deleteOwnAccount, exportUserData } from "../services/privacy.service.js";
import { endSession, startSession } from "../utils/session.js";

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
// identificador (09 §20); as demais são encerradas (DEC-088).
export async function changePasswordHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const sessaoVersao = await changePassword(userId, req.body);
  await startSession(req, userId, sessaoVersao, req.user!.role);
  sendSuccess(res, 200, "Senha alterada com sucesso.", null);
}

// GET /api/v1/profile/export — cópia dos dados do titular (LGPD art. 18, DEC-095).
export async function exportDataHandler(req: Request, res: Response): Promise<void> {
  const data = await exportUserData(req.user!.id);
  res.attachment("ecobyte-meus-dados.json");
  sendSuccess(res, 200, "Dados exportados.", data);
}

// DELETE /api/v1/profile — exclusão da conta pelo titular, com anonimização (DEC-095).
export async function deleteAccountHandler(req: Request, res: Response): Promise<void> {
  await deleteOwnAccount(req.user!.id, req.body.senha);
  await endSession(req, res);
  sendSuccess(res, 200, "Conta excluída. Seus dados pessoais foram removidos.", null);
}
