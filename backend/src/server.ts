import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./database/connection.js";

// Sequência de startup (19_DEPLOYMENT §23):
// ambiente → validação → MongoDB → middlewares/rotas → servidor.
async function main(): Promise<void> {
  const env = loadEnv();

  await connectDatabase(env.MONGODB_URI);
  console.info("[backend] MongoDB conectado.");

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.info(`[backend] API ouvindo na porta ${env.PORT} (${env.NODE_ENV}).`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.info(`[backend] ${signal} recebido, encerrando...`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error: unknown) => {
  // Mensagem sem connection string ou segredos (09 §44).
  console.error("[backend] Falha na inicialização:", error instanceof Error ? error.message : error);
  process.exit(1);
});
