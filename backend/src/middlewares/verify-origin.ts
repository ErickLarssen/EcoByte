import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Proteção CSRF complementar ao SameSite=Lax (DEC-069): requisições que alteram
// estado vindas de outra origem são rejeitadas. Sem header Origin (clientes que
// não são navegadores), a requisição segue.
export function createOriginGuard(frontendUrl: string) {
  const allowedOrigin = new URL(frontendUrl).origin;

  return (req: Request, _res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;

    if (STATE_CHANGING_METHODS.has(req.method) && origin !== undefined && origin !== allowedOrigin) {
      throw new AppError(403, "INVALID_ORIGIN", "Origem da requisição não permitida.");
    }

    next();
  };
}
