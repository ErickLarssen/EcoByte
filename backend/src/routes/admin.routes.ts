import { Router } from "express";
import {
  createCollectorHandler,
  getCollectionHandler,
  getUserHandler,
  listCollectionsHandler,
  listUsersHandler,
  updateUserStatusHandler,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/authorize.js";
import { validateBody } from "../middlewares/validate-body.js";
import { createCollectorSchema, updateUserStatusSchema } from "../validators/admin.validators.js";

// Rotas administrativas (05_ROUTES §12–§13, RF-058). Todas exigem sessão e
// role ADMIN, verificadas no backend (BR-035, DEC-033).
export function createAdminRouter(): Router {
  const router = Router();

  router.use(requireAuth, requireRole("ADMIN"));

  router.get("/users", listUsersHandler);
  router.post("/users", validateBody(createCollectorSchema), createCollectorHandler);
  router.get("/users/:id", getUserHandler);
  router.patch("/users/:id/status", validateBody(updateUserStatusSchema), updateUserStatusHandler);

  router.get("/collections", listCollectionsHandler);
  router.get("/collections/:id", getCollectionHandler);

  return router;
}
