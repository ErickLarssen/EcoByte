import type { Request, Response } from "express";
import { sendError } from "../utils/api-response.js";

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 404, "Recurso não encontrado.", "RESOURCE_NOT_FOUND");
}
