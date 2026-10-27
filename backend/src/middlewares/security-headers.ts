import type { NextFunction, Request, Response } from "express";

// Cabeçalhos de segurança da API (09 §60, DEC-091). A API responde só JSON,
// então a política pode ser a mais restrita: nada é executado, embutido nem
// guardado em cache. Sem biblioteca: cada cabeçalho tem efeito conhecido.
const HEADERS: Record<string, string> = {
  // Respostas com dados pessoais nunca ficam no cache do navegador, de proxies
  // ou da CDN da Vercel, que fica à frente da API (DEC-086).
  "Cache-Control": "no-store",
  Pragma: "no-cache",
  // O navegador não reinterpreta o JSON como outro tipo de conteúdo.
  "X-Content-Type-Options": "nosniff",
  // Nenhuma resposta da API é documento: sem scripts, recursos nem iframes.
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  // Só a própria origem lê as respostas (o frontend acessa pela mesma origem, DEC-063).
  "Cross-Origin-Resource-Policy": "same-origin",
};

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.set(HEADERS);
  next();
}
