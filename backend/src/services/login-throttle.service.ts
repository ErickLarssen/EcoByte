import { createHash } from "node:crypto";
import { LoginThrottle } from "../models/login-throttle.model.js";
import { AppError } from "../utils/app-error.js";

// Bloqueio por conta contra força bruta (DEC-093, 09 §49): 10 senhas erradas
// em 15 minutos bloqueiam o e-mail por 15 minutos, de qualquer IP. Complementa
// o limite por IP (DEC-067), que não protege contra tentativas distribuídas
// nem contra X-Forwarded-For forjado no acesso direto à API (19 §21.2).
export const MAX_LOGIN_FAILURES = 10;
export const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_LOCK_MS = 15 * 60 * 1000;

// Mesma resposta do limite por IP: não revela se o e-mail tem conta.
const tooManyAttempts = () =>
  new AppError(429, "RATE_LIMIT_EXCEEDED", "Muitas tentativas. Aguarde alguns minutos e tente novamente.");

const throttleKey = (email: string) => createHash("sha256").update(`login:${email}`).digest("hex");

// Chamado antes de conferir a senha: conta bloqueada não chega à verificação.
export async function assertLoginAllowed(email: string): Promise<void> {
  const record = await LoginThrottle.findOne({ chave: throttleKey(email) }).select("bloqueadoAte").lean();
  if (record?.bloqueadoAte && record.bloqueadoAte.getTime() > Date.now()) throw tooManyAttempts();
}

// Registra uma falha numa única operação atômica, para que tentativas em
// paralelo não escapem da contagem. Uma janela vencida recomeça do zero.
export async function registerLoginFailure(email: string): Promise<void> {
  const now = new Date();
  const windowExpired = { $lt: [{ $ifNull: ["$janelaInicio", new Date(0)] }, new Date(now.getTime() - LOGIN_FAILURE_WINDOW_MS)] };

  await LoginThrottle.updateOne(
    { chave: throttleKey(email) },
    [
      {
        $set: {
          falhas: { $cond: [windowExpired, 1, { $add: [{ $ifNull: ["$falhas", 0] }, 1] }] },
          janelaInicio: { $cond: [windowExpired, now, "$janelaInicio"] },
        },
      },
      {
        $set: {
          bloqueadoAte: {
            $cond: [{ $gte: ["$falhas", MAX_LOGIN_FAILURES] }, new Date(now.getTime() + LOGIN_LOCK_MS), { $ifNull: ["$bloqueadoAte", null] }],
          },
          // Cobre a janela e o bloqueio; depois disso, o TTL apaga o registro.
          expiraEm: new Date(now.getTime() + LOGIN_FAILURE_WINDOW_MS + LOGIN_LOCK_MS),
        },
      },
    ],
    { upsert: true, updatePipeline: true },
  );
}

// Login correto ou senha redefinida pelo link: a contagem é zerada.
export async function clearLoginFailures(email: string): Promise<void> {
  await LoginThrottle.deleteOne({ chave: throttleKey(email) });
}
