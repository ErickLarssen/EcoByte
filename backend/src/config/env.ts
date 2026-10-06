import { z } from "zod";

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
const DEVELOPMENT_FRONTEND_URL = "http://localhost:3000";

// Variáveis obrigatórias são validadas no startup (19_DEPLOYMENT §22):
// configuração ausente interrompe a inicialização com erro claro.
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string({ error: "MONGODB_URI é obrigatória." }).min(1, "MONGODB_URI é obrigatória."),
    // Origem aceita pela validação de Origin (DEC-069).
    FRONTEND_URL: z.url().optional(),
    // Assinatura do cookie de sessão (DEC-021).
    SESSION_SECRET: z
      .string({ error: "SESSION_SECRET é obrigatória." })
      .min(32, "SESSION_SECRET deve ter pelo menos 32 caracteres."),
    // Expiração da sessão em segundos, renovada a cada uso (DEC-021, OQ-062).
    SESSION_MAX_AGE: z.coerce.number().int().positive().default(SEVEN_DAYS_IN_SECONDS),
    // Proxies confiáveis à frente do backend (DEC-068).
    TRUST_PROXY: z.coerce.number().int().min(0).optional(),
    // Envio de e-mail por SMTP (DEC-082). Sem SMTP_HOST fora de produção, os
    // e-mails são exibidos no console do backend.
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    // true para conexão TLS direta (porta 465); false usa STARTTLS.
    SMTP_SECURE: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    MAIL_FROM: z.string().min(1).default("EcoByte <nao-responda@ecobyte.local>"),
    // Consulta de CEP (DEC-081).
    VIACEP_URL: z.url().default("https://viacep.com.br"),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;

    if (env.FRONTEND_URL === undefined) {
      ctx.addIssue({ code: "custom", path: ["FRONTEND_URL"], message: "FRONTEND_URL é obrigatória em produção." });
    }

    if (env.SMTP_HOST === undefined) {
      ctx.addIssue({ code: "custom", path: ["SMTP_HOST"], message: "SMTP_HOST é obrigatória em produção (DEC-082)." });
    }

    if (env.TRUST_PROXY === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["TRUST_PROXY"],
        message: "TRUST_PROXY é obrigatória em produção (DEC-068).",
      });
    }
  })
  .transform((env) => ({
    ...env,
    FRONTEND_URL: env.FRONTEND_URL ?? DEVELOPMENT_FRONTEND_URL,
    TRUST_PROXY: env.TRUST_PROXY ?? 0,
  }));

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Configuração de ambiente inválida:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
