import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { sendError } from "../utils/api-response.js";

// Erros lançados pelo parser de JSON do Express possuem `type`.
function isBodyParserError(error: unknown): error is { type: string } {
  return typeof error === "object" && error !== null && "type" in error && typeof error.type === "string";
}

// Converte qualquer erro no envelope padronizado (DEC-017).
// Nunca expõe stack trace, mensagens internas ou connection strings (09 §44).
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message, error.code, error.fields);
    return;
  }

  if (isBodyParserError(error)) {
    if (error.type === "entity.parse.failed") {
      sendError(res, 400, "O corpo da requisição não é um JSON válido.", "VALIDATION_ERROR");
      return;
    }

    if (error.type === "entity.too.large") {
      sendError(res, 413, "O corpo da requisição excede o tamanho permitido.", "PAYLOAD_TOO_LARGE");
      return;
    }
  }

  console.error("[backend] Erro não tratado:", error instanceof Error ? (error.stack ?? error.message) : error);
  sendError(res, 500, "Não foi possível realizar a operação.", "INTERNAL_SERVER_ERROR");
}
