import { MongoStore } from "connect-mongo";
import session, { type Store } from "express-session";
import mongoose from "mongoose";
import { createApp, type AppOptions } from "../../src/app.js";

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
  });
}

// Store real na coleção `sessions` (DEC-021), sobre a conexão Mongoose de teste.
export function createMongoSessionStore(): Store {
  return MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "sessions",
    ttl: TEST_SESSION_MAX_AGE,
  });
}
