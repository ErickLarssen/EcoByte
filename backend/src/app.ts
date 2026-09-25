import express, { type Express } from "express";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { apiRouter } from "./routes/index.js";

// Monta a aplicação sem abrir porta nem conectar ao banco,
// permitindo testes de API com Supertest.
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  // Limite de payload (09 §89): suficiente para os JSON do domínio.
  app.use(express.json({ limit: "100kb" }));

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
