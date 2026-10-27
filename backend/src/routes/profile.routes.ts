import { Router } from "express";
import {
  changePasswordHandler,
  deleteAccountHandler,
  exportDataHandler,
  getProfileHandler,
  updateProfileHandler,
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import { createProfileRateLimiters } from "../middlewares/rate-limit.js";
import { validateBody } from "../middlewares/validate-body.js";
import { changePasswordSchema, deleteAccountSchema, updateProfileSchema } from "../validators/profile.validators.js";

// Perfil do usuário autenticado (05_ROUTES §6, RF-055, DEC-078), de qualquer perfil.
export function createProfileRouter(): Router {
  const router = Router();
  const limiters = createProfileRateLimiters();

  router.use(requireAuth);
  router.get("/", getProfileHandler);
  router.patch("/", validateBody(updateProfileSchema), updateProfileHandler);
  router.patch("/password", limiters.changePassword, validateBody(changePasswordSchema), changePasswordHandler);

  // Direitos do titular (DEC-095).
  router.get("/export", limiters.exportData, exportDataHandler);
  router.delete("/", limiters.deleteAccount, validateBody(deleteAccountSchema), deleteAccountHandler);

  return router;
}
