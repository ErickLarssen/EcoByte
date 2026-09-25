import { z } from "zod";

// Variáveis obrigatórias são validadas no startup (19_DEPLOYMENT §22):
// configuração ausente interrompe a inicialização com erro claro.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string({ error: "MONGODB_URI é obrigatória." }).min(1, "MONGODB_URI é obrigatória."),
  FRONTEND_URL: z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    throw new Error(`Configuração de ambiente inválida:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
