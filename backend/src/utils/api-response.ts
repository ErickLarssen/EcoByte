import type { Response } from "express";
import type { ErrorFields } from "./app-error.js";

// Envelope padronizado de resposta (DEC-017, 06_API §5).

export function sendSuccess<T>(res: Response, statusCode: number, message: string, data: T): Response {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code: string,
  fields: ErrorFields = {},
): Response {
  return res.status(statusCode).json({
    status: "error",
    message,
    error: {
      code,
      fields,
    },
    data: null,
  });
}
