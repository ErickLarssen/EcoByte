import express, { type Express } from "express";
import type { Store } from "express-session";
import { createSessionMiddleware } from "./config/session.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { createOriginGuard } from "./middlewares/verify-origin.js";
import { createApiRouter } from "./routes/index.js";

export type AppOptions = {
  frontendUrl: string;
  trustProxy: number;
  session: {
    secret: string;
    maxAgeSeconds: number;
    secureCookies: boolean;
    store: Store;
  };
};

// Monta a aplicação sem abrir porta nem conectar ao banco,
// permitindo testes de API com Supertest.
export function createApp(options: AppOptions): Express {
  const app = express();

  app.disable("x-powered-by");

  // Quantos proxies confiáveis existem à frente do backend (DEC-068).
  app.set("trust proxy", options.trustProxy);

  app.use(createOriginGuard(options.frontendUrl));

  // Limite de payload (09 §89): suficiente para os JSON do domínio.
  app.use(express.json({ limit: "100kb" }));

  app.use("/api/v1", createSessionMiddleware(options.session), createApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
