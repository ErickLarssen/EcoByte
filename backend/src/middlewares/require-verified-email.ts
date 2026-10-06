import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

// Exige e-mail confirmado (DEC-082). Usado na solicitação de coleta: antes da
// confirmação, o cliente entra e acompanha, mas não solicita. Após requireAuth.
export function requireVerifiedEmail(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.emailVerificado) {
    throw new AppError(403, "EMAIL_NOT_VERIFIED", "Confirme seu e-mail para solicitar coletas.");
  }

  next();
}
