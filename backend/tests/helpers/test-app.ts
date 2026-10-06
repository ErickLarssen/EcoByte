import { MongoStore } from "connect-mongo";
import session, { type Store } from "express-session";
import mongoose from "mongoose";
import { createApp, type AppOptions } from "../../src/app.js";
import type { CepProvider } from "../../src/services/cep.service.js";
import type { MailMessage, Mailer } from "../../src/services/mailer.js";

export const TEST_FRONTEND_URL = "http://localhost:3000";
export const TEST_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

type TestAppOverrides = Partial<Omit<AppOptions, "session">> & {
  session?: Partial<AppOptions["session"]>;
};

// Aplicação com as opções de produção, trocando apenas o necessário para testes.
// Sem store informado, usa MemoryStore (testes que não dependem do banco).
export function createTestApp(overrides: TestAppOverrides = {}) {
  return createApp({
    frontendUrl: overrides.frontendUrl ?? TEST_FRONTEND_URL,
    trustProxy: overrides.trustProxy ?? 0,
    session: {
      secret: "segredo-de-teste-com-pelo-menos-32-caracteres",
      maxAgeSeconds: TEST_SESSION_MAX_AGE,
      secureCookies: false,
      store: new session.MemoryStore(),
      ...overrides.session,
    },
    mailer: overrides.mailer ?? createTestMailer(),
    cepProvider: overrides.cepProvider ?? diademaCepProvider,
  });
}

// Mailer que guarda as mensagens em memória, para inspeção nos testes.
export type TestMailer = Mailer & { messages: MailMessage[] };

export function createTestMailer(): TestMailer {
  const messages: MailMessage[] = [];
  return {
    messages,
    async send(message) {
      messages.push(message);
    },
  };
}

// Token presente no link do e-mail de verificação.
export function tokenFromMessage(message: MailMessage | undefined): string {
  const match = message?.text.match(/token=(\S+)/);
  if (!match?.[1]) throw new Error("Link de verificação não encontrado no e-mail.");
  return decodeURIComponent(match[1]);
}

// CEP fictício de Diadema-SP, sem rede.
export const diademaCepProvider: CepProvider = async (cep) => ({
  cep,
  logradouro: "Rua das Palmeiras",
  bairro: "Centro",
  cidade: "Diadema",
  estado: "SP",
});

// Store real na coleção `sessions` (DEC-021), sobre a conexão Mongoose de teste.
export function createMongoSessionStore(): Store {
  return MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "sessions",
    ttl: TEST_SESSION_MAX_AGE,
  });
}
