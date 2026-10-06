import { Router } from "express";
import { lookupCepHandler } from "../controllers/cep.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import type { CepProvider } from "../services/cep.service.js";

// Consulta de CEP (DEC-081). Exige sessão: é usada nos formulários da área
// autenticada e não deve servir de proxy aberto para o serviço externo.
export function createCepRouter(provider: CepProvider): Router {
  const router = Router();

  router.get("/:cep", requireAuth, lookupCepHandler(provider));

  return router;
}
