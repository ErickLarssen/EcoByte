import { Router } from "express";
import { getEcopointHandler, updateEcopointHandler } from "../controllers/ecopoint.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/authorize.js";
import { validateBody } from "../middlewares/validate-body.js";
import { updateEcopointSchema } from "../validators/ecopoint.validators.js";

// Ecoponto central (05_ROUTES §7, DEC-076): consulta pública; alteração
// somente por ADMIN, verificada no backend (RF-039, DEC-065).
export function createEcopointRouter(): Router {
  const router = Router();

  router.get("/", getEcopointHandler);
  router.patch("/", requireAuth, requireRole("ADMIN"), validateBody(updateEcopointSchema), updateEcopointHandler);

  return router;
}
