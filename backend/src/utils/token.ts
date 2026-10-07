import { createHash, randomBytes } from "node:crypto";

// Tokens de link enviados por e-mail (DEC-082, DEC-088): 32 bytes aleatórios,
// e só o hash SHA-256 é guardado no banco (09 §51).
export function createLinkToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashLinkToken(token) };
}

export const hashLinkToken = (token: string) => createHash("sha256").update(token).digest("hex");

// Texto inserido no HTML dos e-mails.
export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
