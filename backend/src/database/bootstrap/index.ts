import mongoose from "mongoose";
import { z } from "zod";
import { connectDatabase, disconnectDatabase } from "../connection.js";
import { parseBootstrapEnv, runBootstrap, type BootstrapStepResult } from "./bootstrap.js";

const RESULT_LABEL: Record<BootstrapStepResult, string> = {
  CRIADO: "criado",
  JA_EXISTE: "já existia, nada alterado",
  SEM_DADOS: "não criado: variáveis não informadas",
};

// CLI da inicialização: `npm run bootstrap --workspace backend` (DEC-087).
// Valida as variáveis antes de conectar e nunca exibe a senha. Precisa só da
// conexão com o banco: as demais variáveis do servidor não são exigidas.
const connectionSchema = z.object({
  NODE_ENV: z.string().default("development"),
  MONGODB_URI: z.string({ error: "MONGODB_URI é obrigatória." }).min(1, "MONGODB_URI é obrigatória."),
});

async function main(): Promise<void> {
  const input = parseBootstrapEnv(process.env);
  const parsed = connectionSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join(" "));
  const env = parsed.data;

  await connectDatabase(env.MONGODB_URI);

  try {
    const summary = await runBootstrap(input);
    const line = "========================================";

    console.info(
      [
        line,
        "EcoByte — inicialização",
        line,
        `Ambiente:      ${env.NODE_ENV}`,
        // Nome do banco, sem host nem credenciais: confirma o alvo da execução.
        `Banco:         ${mongoose.connection.name}`,
        `Administrador: ${RESULT_LABEL[summary.admin]}`,
        `Ecoponto:      ${RESULT_LABEL[summary.ecopoint]}`,
        line,
      ].join("\n"),
    );

    if (summary.admin === "CRIADO") {
      console.info("Entre com o e-mail informado: a senha é provisória e será trocada no primeiro acesso.");
    }
    if (summary.ecopoint === "SEM_DADOS") {
      console.warn("Sem ecoponto, as entregas são recusadas. Informe as variáveis ECOPONTO_* e execute de novo.");
    }
    if (summary.admin === "SEM_DADOS") {
      console.warn("Nenhum administrador existe. Informe BOOTSTRAP_ADMIN_NOME, _EMAIL e _SENHA e execute de novo.");
    }
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  console.error("[bootstrap] Falha:", error instanceof Error ? error.message : error);
  process.exit(1);
});
