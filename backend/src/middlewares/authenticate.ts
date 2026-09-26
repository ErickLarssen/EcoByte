import type { NextFunction, Request, Response } from "express";
import { findSessionUser } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";
import { endSession } from "../utils/session.js";

// Middleware de autenticação (09 §73): exige sessão válida e usuário ATIVO,
// e disponibiliza o usuário em req.user. A identidade vem sempre da sessão,
// nunca de ids enviados pelo frontend (05 RT-005).
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = req.session?.userId;

  if (!userId) {
    throw new AppError(401, "UNAUTHORIZED", "Autenticação necessária.");
  }

  const user = await findSessionUser(userId);

  if (!user) {
    await endSession(req, res);
    throw new AppError(401, "UNAUTHORIZED", "Autenticação necessária.");
  }

  // Usuário desativado com sessão ativa (06_API §27.3).
  if (user.status !== "ATIVO") {
    await endSession(req, res);
    throw new AppError(403, "USER_INACTIVE", "Usuário inativo.");
  }

  req.user = user;
  next();
}
