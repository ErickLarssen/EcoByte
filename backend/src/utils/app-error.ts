export type ErrorFields = Record<string, string>;

// Erro de domínio/HTTP esperado. O errorHandler o converte no envelope
// de erro padronizado (DEC-017). Erros que não são AppError viram 500.
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fields: ErrorFields;

  constructor(statusCode: number, code: string, message: string, fields: ErrorFields = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}
