import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { AppError, type ErrorFields } from "../utils/app-error.js";

function toFieldErrors(error: z.ZodError): ErrorFields {
  const fields: ErrorFields = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "body";
    // Uma mensagem por campo: a primeira regra violada.
    fields[path] ??= issue.message;
  }

  return fields;
}

// Valida dados de entrada contra um schema, lançando 400 VALIDATION_ERROR.
export function parseInput<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Existem campos inválidos.", toFieldErrors(result.error));
  }

  return result.data;
}

// Validação de entrada no backend (DEC-040, 09 §39). Substitui req.body pelos
// dados normalizados do schema, descartando campos não previstos.
export function validateBody(schema: z.ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = parseInput(schema, req.body ?? {});
    next();
  };
}
