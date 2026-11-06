import mongoose from "mongoose";
import { z } from "zod";
import { connectDatabase, disconnectDatabase } from "../connection.js";
import { PURGE_CONFIRMATION, executePurge, parsePurgeEnv, planPurge } from "./purge.js";

// CLI da remoção definitiva: `npm run purge --workspace backend` (DEC-096).
// Sem PURGE_CONFIRMAR=APAGAR, só mostra o que seria apagado.
const connectionSchema = z.object({
  MONGODB_URI: z.string({ error: "MONGODB_URI é obrigatória." }).min(1, "MONGODB_URI é obrigatória."),
});

async function main(): Promise<void> {
  const input = parsePurgeEnv(process.env);
  const parsed = connectionSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(parsed.error.issues.map((issue) => issue.message).join(" "));

  await connectDatabase(parsed.data.MONGODB_URI);

  try {
    const plan = await planPurge(input.emails);
    const line = "========================================";

    console.info(
      [
        line,
        `EcoByte — remoção definitiva (${input.confirmar ? "EXECUÇÃO" : "SIMULAÇÃO"})`,
        line,
        // Servidor e banco, sem credenciais: confirma o alvo (local e Atlas
        // podem ter o mesmo nome de banco).
        `Servidor: ${mongoose.connection.host}`,
        `Banco:    ${mongoose.connection.name}`,
        "",
        "Perfis encontrados:",
        ...(plan.users.length > 0 ? plan.users.map((user) => `  - ${user.email} (${user.role}) — ${user.nome}`) : ["  (nenhum)"]),
        ...(plan.naoEncontrados.length > 0 ? ["", "Não encontrados:", ...plan.naoEncontrados.map((email) => `  - ${email}`)] : []),
        "",
        "Também seriam apagados:",
        `  Coletas solicitadas por eles: ${plan.coletas}`,
        `  Notificações:                 ${plan.notificacoes}`,
        `  Sessões abertas:              ${plan.sessoes}`,
        line,
      ].join("\n"),
    );

    if (plan.bloqueios.length > 0) {
      console.error(["Remoção bloqueada. Nada foi apagado:", ...plan.bloqueios.map((reason) => `  - ${reason}`)].join("\n"));
      process.exitCode = 1;
      return;
    }

    if (!input.confirmar) {
      console.info(`Nada foi apagado. Para apagar, execute de novo com PURGE_CONFIRMAR=${PURGE_CONFIRMATION}.`);
      return;
    }

    const result = await executePurge(plan);
    console.info(
      `Apagado: ${result.usuarios} perfil(is), ${result.coletas} coleta(s), ${result.notificacoes} notificação(ões), ${result.sessoes} sessão(ões).`,
    );
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  console.error("[purge] Falha:", error instanceof Error ? error.message : error);
  process.exit(1);
});
