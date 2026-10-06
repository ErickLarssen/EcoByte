import { MongoStore } from "connect-mongo";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./database/connection.js";
import { createViaCepProvider } from "./services/cep.service.js";
import { createConsoleMailer, createSmtpMailer } from "./services/mailer.js";

// Sequência de startup (19_DEPLOYMENT §23):
// ambiente → validação → MongoDB → middlewares/rotas → servidor.
async function main(): Promise<void> {
  const env = loadEnv();

  await connectDatabase(env.MONGODB_URI);
  console.info("[backend] MongoDB conectado.");

  // Sessões na coleção `sessions`, com expiração automática (DEC-021).
  const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "sessions",
    ttl: env.SESSION_MAX_AGE,
  });

  // SMTP quando configurado; sem ele (só fora de produção), e-mails no console (DEC-082).
  const mailer = env.SMTP_HOST
    ? createSmtpMailer({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.MAIL_FROM,
      })
    : createConsoleMailer();

  if (!env.SMTP_HOST) console.info("[backend] SMTP não configurado: e-mails serão exibidos no console.");

  const app = createApp({
    frontendUrl: env.FRONTEND_URL,
    trustProxy: env.TRUST_PROXY,
    session: {
      secret: env.SESSION_SECRET,
      maxAgeSeconds: env.SESSION_MAX_AGE,
      secureCookies: env.NODE_ENV === "production",
      store: sessionStore,
    },
    mailer,
    cepProvider: createViaCepProvider(env.VIACEP_URL),
  });

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
