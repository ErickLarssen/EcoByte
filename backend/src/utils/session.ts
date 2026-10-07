import type { Request, Response } from "express";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "../config/session.js";

// Versões com Promise das operações de sessão do express-session.

// Novo identificador de sessão no login/cadastro, evitando fixação de sessão (09 §20).
// A versão permite encerrar as sessões antigas após uma troca de senha (DEC-088).
export function startSession(req: Request, userId: string, sessaoVersao: number): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError);

      req.session.userId = userId;
      req.session.sessaoVersao = sessaoVersao;
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve()));
    });
  });
}

// Remove a sessão do store e o cookie do navegador (09 §27).
export function endSession(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) return reject(error);

      res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions(req.secure));
      resolve();
    });
  });
}
