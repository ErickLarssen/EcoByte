import { Router } from "express";
import { createAdminRouter } from "./admin.routes.js";
import { createAuthRouter } from "./auth.routes.js";
import { createCollectionRouter } from "./collection.routes.js";
import { createEcopointRouter } from "./ecopoint.routes.js";
import { healthRouter } from "./health.routes.js";

// Rotas montadas sob /api/v1 (DEC-016).
export function createApiRouter(): Router {
  const router = Router();

  router.use("/health", healthRouter);
  router.use("/auth", createAuthRouter());
  router.use("/collections", createCollectionRouter());
  router.use("/ecopoint", createEcopointRouter());
  router.use("/admin", createAdminRouter());

  return router;
}
