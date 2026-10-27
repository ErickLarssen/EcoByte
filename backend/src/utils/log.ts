// Mensagens de erro de serviços externos (SMTP, por exemplo) podem trazer o
// e-mail do destinatário. Nos logs, o endereço vira um marcador (09 §97, DEC-095).
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export function errorMessageForLog(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(EMAIL_PATTERN, "<e-mail>");
}
