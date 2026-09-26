import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import { createAuthRateLimiters } from "../middlewares/rate-limit.js";
import { validateBody } from "../middlewares/validate-body.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";

// Rotas de autenticação (05_ROUTES §5). Recuperação de senha depende de
// OQ-014/OQ-015 e ainda não está disponível.
export function createAuthRouter(): Router {
  const router = Router();
  const limiters = createAuthRateLimiters();

  router.post("/register", limiters.register, validateBody(registerSchema), register);
  router.post("/login", limiters.login, validateBody(loginSchema), login);
  router.post("/logout", requireAuth, logout);
  router.get("/me", requireAuth, me);

  return router;
}
