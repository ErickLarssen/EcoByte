import type { Request, Response } from "express";
import { authenticate, registerClient } from "../services/auth.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { endSession, startSession } from "../utils/session.js";

// POST /api/v1/auth/register — cadastro público; o usuário já sai autenticado (CA-001, DEC-066).
export async function register(req: Request, res: Response): Promise<void> {
  const user = await registerClient(req.body);
  await startSession(req, user.id);

  sendSuccess(res, 201, "Cadastro realizado com sucesso.", { user });
}

// POST /api/v1/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const user = await authenticate(req.body);
  await startSession(req, user.id);

  sendSuccess(res, 200, "Login realizado com sucesso.", { user });
}

// POST /api/v1/auth/logout — invalida a sessão no servidor (09 §27).
export async function logout(req: Request, res: Response): Promise<void> {
  await endSession(req, res);

  sendSuccess(res, 200, "Logout realizado com sucesso.", null);
}

// GET /api/v1/auth/me
export function me(req: Request, res: Response): void {
  sendSuccess(res, 200, "Usuário autenticado.", { user: req.user });
}
