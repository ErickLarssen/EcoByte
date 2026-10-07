import { rateLimit } from "express-rate-limit";
import { sendError } from "../utils/api-response.js";

const MINUTE_MS = 60 * 1000;

type LimiterOptions = {
  windowMs: number;
  limit: number;
};

// Limitador por IP (DEC-067). O IP vem de req.ip, que só considera
// X-Forwarded-For quando TRUST_PROXY está configurado (DEC-068).
function createLimiter({ windowMs, limit }: LimiterOptions) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    // Com TRUST_PROXY=0 o header é ignorado de propósito (DEC-068);
    // não é um erro de configuração.
    validate: { xForwardedForHeader: false },
    handler: (_req, res) => {
      sendError(res, 429, "Muitas tentativas. Aguarde alguns minutos e tente novamente.", "RATE_LIMIT_EXCEEDED");
    },
  });
}

// Contadores em memória, novos a cada instância da aplicação.
export function createAuthRateLimiters() {
  return {
    login: createLimiter({ windowMs: 15 * MINUTE_MS, limit: 10 }),
    register: createLimiter({ windowMs: 60 * MINUTE_MS, limit: 5 }),
    // Verificação de e-mail (DEC-082): tentativas de token e reenvios.
    verifyEmail: createLimiter({ windowMs: 15 * MINUTE_MS, limit: 20 }),
    resendVerification: createLimiter({ windowMs: 60 * MINUTE_MS, limit: 5 }),
    // Recuperação de senha (DEC-088): pedidos de link e tentativas de token.
    forgotPassword: createLimiter({ windowMs: 60 * MINUTE_MS, limit: 5 }),
    resetPassword: createLimiter({ windowMs: 15 * MINUTE_MS, limit: 20 }),
  };
}

// Troca de senha: limita tentativas de adivinhar a senha atual (DEC-078).
export function createProfileRateLimiters() {
  return {
    changePassword: createLimiter({ windowMs: 15 * MINUTE_MS, limit: 10 }),
  };
}
