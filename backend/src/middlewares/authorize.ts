import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../domain/constants.js";
import { AppError } from "../utils/app-error.js";

// Middleware de autorização por role (09 §74). Deve ser usado após requireAuth.
// ADMIN não herda permissões de outras roles (DEC-033): cada rota lista as roles aceitas.
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Autenticação necessária.");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "FORBIDDEN", "Você não tem permissão para esta operação.");
    }

    next();
  };
}
