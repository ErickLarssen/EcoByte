import type { Request, Response } from "express";
import { ADMIN_IDLE_TIMEOUT_MS, sessionCookieName, sessionCookieOptions } from "../config/session.js";
import type { UserRole } from "../domain/constants.js";

// Versões com Promise das operações de sessão do express-session.

// Novo identificador de sessão no login/cadastro, evitando fixação de sessão (09 §20).
// A versão permite encerrar as sessões antigas após uma troca de senha (DEC-088).
export function startSession(req: Request, userId: string, sessaoVersao: number, role: UserRole): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError);

      req.session.userId = userId;
      req.session.sessaoVersao = sessaoVersao;
      applyRoleSessionLimit(req, role);
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve()));
    });
  });
}

// Limite de inatividade do administrador (DEC-092): vale para o cookie e para a
// expiração da sessão no store, que acompanham o maxAge desta sessão.
export function applyRoleSessionLimit(req: Request, role: UserRole): void {
  if (role === "ADMIN" && req.session.cookie.originalMaxAge !== ADMIN_IDLE_TIMEOUT_MS) {
    req.session.cookie.maxAge = ADMIN_IDLE_TIMEOUT_MS;
  }
}

// Remove a sessão do store e o cookie do navegador (09 §27).
export function endSession(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) return reject(error);

      // Mesmo nome e opções da criação (app.locals, definido em createApp).
      const secureCookies = req.app.locals.secureCookies === true;
      res.clearCookie(sessionCookieName(secureCookies), sessionCookieOptions(secureCookies));
      resolve();
    });
  });
}
