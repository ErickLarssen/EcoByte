import { Router } from "express";
import type { CepProvider } from "../services/cep.service.js";
import type { Mailer } from "../services/mailer.js";
import { createAdminRouter } from "./admin.routes.js";
import { createAuthRouter } from "./auth.routes.js";
import { createCepRouter } from "./cep.routes.js";
import { createCollectionRouter } from "./collection.routes.js";
import { createEcopointRouter } from "./ecopoint.routes.js";
import { createNotificationRouter } from "./notification.routes.js";
import { createProfileRouter } from "./profile.routes.js";
import { healthRouter } from "./health.routes.js";

// Serviços externos injetados (e-mail, CEP), substituídos nos testes.
export type ApiDependencies = { mailer: Mailer; cepProvider: CepProvider; frontendUrl: string };

// Rotas montadas sob /api/v1 (DEC-016).
export function createApiRouter({ mailer, cepProvider, frontendUrl }: ApiDependencies): Router {
  const router = Router();

  router.use("/health", healthRouter);
  router.use("/auth", createAuthRouter({ mailer, frontendUrl }));
  router.use("/cep", createCepRouter(cepProvider));
  router.use("/collections", createCollectionRouter(cepProvider));
  router.use("/ecopoint", createEcopointRouter());
  router.use("/notifications", createNotificationRouter());
  router.use("/profile", createProfileRouter());
  router.use("/admin", createAdminRouter());

  return router;
}
