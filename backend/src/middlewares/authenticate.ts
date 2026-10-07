import type { NextFunction, Request, Response } from "express";
import { findSessionUser } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";
import { endSession } from "../utils/session.js";

// Middleware de autenticação (09 §73): exige sessão válida e usuário ATIVO,
// e disponibiliza o usuário em req.user. A identidade vem sempre da sessão,
// nunca de ids enviados pelo frontend (05 RT-005).
// Rotas liberadas enquanto a senha provisória não for trocada.
function allowedDuringPasswordChange(url: string): boolean {
  const path = url.split("?")[0] ?? url;
  return path.startsWith("/api/v1/auth/") || path === "/api/v1/profile/password";
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.session?.userId;

  if (!userId) {
    throw new AppError(401, "UNAUTHORIZED", "Autenticação necessária.");
  }

  const found = await findSessionUser(userId);

  if (!found) {
    await endSession(req, res);
    throw new AppError(401, "UNAUTHORIZED", "Autenticação necessária.");
  }

  // Sessão emitida antes de uma troca ou redefinição de senha (DEC-088).
  if ((req.session.sessaoVersao ?? 0) !== found.sessaoVersao) {
    await endSession(req, res);
    throw new AppError(401, "UNAUTHORIZED", "Sua sessão foi encerrada. Entre novamente.");
  }

  const { user } = found;

  // Usuário desativado com sessão ativa (06_API §27.3).
  if (user.status !== "ATIVO") {
    await endSession(req, res);
    throw new AppError(403, "USER_INACTIVE", "Usuário inativo.");
  }

  // Senha provisória (DEC-083): até a troca, só autenticação e a própria troca.
  if (user.trocaSenhaObrigatoria && !allowedDuringPasswordChange(req.originalUrl)) {
    throw new AppError(403, "PASSWORD_CHANGE_REQUIRED", "Troque a senha provisória para continuar.");
  }

  req.user = user;
  next();
}
