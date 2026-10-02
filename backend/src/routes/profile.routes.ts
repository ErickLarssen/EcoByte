import { Router } from "express";
import { changePasswordHandler, getProfileHandler, updateProfileHandler } from "../controllers/profile.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import { createProfileRateLimiters } from "../middlewares/rate-limit.js";
import { validateBody } from "../middlewares/validate-body.js";
import { changePasswordSchema, updateProfileSchema } from "../validators/profile.validators.js";

// Perfil do usuário autenticado (05_ROUTES §6, RF-055, DEC-078), de qualquer perfil.
export function createProfileRouter(): Router {
  const router = Router();
  const limiters = createProfileRateLimiters();

  router.use(requireAuth);
  router.get("/", getProfileHandler);
  router.patch("/", validateBody(updateProfileSchema), updateProfileHandler);
  router.patch("/password", limiters.changePassword, validateBody(changePasswordSchema), changePasswordHandler);

  return router;
}
