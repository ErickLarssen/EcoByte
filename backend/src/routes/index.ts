import { Router } from "express";
import { createAuthRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";

// Rotas montadas sob /api/v1 (DEC-016).
export function createApiRouter(): Router {
  const router = Router();

  router.use("/health", healthRouter);
  router.use("/auth", createAuthRouter());

  return router;
}
