import { Router } from "express";
import {
  collectorAction,
  create,
  getById,
  listAssigned,
  listAvailable,
  listMine,
} from "../controllers/collection.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/authorize.js";
import { validateBody } from "../middlewares/validate-body.js";
import { createCollectionSchema } from "../validators/collection.validators.js";

// Rotas de coleta (05_ROUTES §8–§9, DEC-064). Todas exigem autenticação;
// a role de cada rota é verificada no backend (BR-032).
export function createCollectionRouter(): Router {
  const router = Router();

  router.use(requireAuth);

  // Cliente
  router.post("/", requireRole("CLIENTE"), validateBody(createCollectionSchema), create);
  router.get("/", requireRole("CLIENTE"), listMine);

  // Coletor — registradas antes de "/:id" (05_ROUTES §9.1.1).
  router.get("/available", requireRole("COLETOR"), listAvailable);
  router.get("/assigned", requireRole("COLETOR"), listAssigned);

  router.get("/:id", requireRole("CLIENTE", "COLETOR"), getById);

  router.post("/:id/accept", requireRole("COLETOR"), collectorAction("accept"));
  router.post("/:id/start", requireRole("COLETOR"), collectorAction("start"));
  router.post("/:id/collect", requireRole("COLETOR"), collectorAction("collect"));
  router.post("/:id/deliver", requireRole("COLETOR"), collectorAction("deliver"));
  router.post("/:id/complete", requireRole("COLETOR"), collectorAction("complete"));

  return router;
}
