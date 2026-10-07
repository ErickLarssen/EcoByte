import { Router } from "express";
import {
  forgotPasswordHandler,
  login,
  logout,
  me,
  register,
  resendVerificationHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";
import { createAuthRateLimiters } from "../middlewares/rate-limit.js";
import { validateBody } from "../middlewares/validate-body.js";
import type { VerificationContext } from "../services/email-verification.service.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validators.js";

// Rotas de autenticação (05_ROUTES §5).
export function createAuthRouter(context: VerificationContext): Router {
  const router = Router();
  const limiters = createAuthRateLimiters();

  router.post("/register", limiters.register, validateBody(registerSchema), register(context));
  router.post("/login", limiters.login, validateBody(loginSchema), login);
  router.post("/logout", requireAuth, logout);
  router.get("/me", requireAuth, me);

  // Verificação de e-mail (DEC-082).
  router.post("/verify-email", limiters.verifyEmail, validateBody(verifyEmailSchema), verifyEmailHandler);
  router.post("/verify-email/resend", requireAuth, limiters.resendVerification, resendVerificationHandler(context));

  // Recuperação de senha por link (DEC-088).
  router.post("/forgot-password", limiters.forgotPassword, validateBody(forgotPasswordSchema), forgotPasswordHandler(context));
  router.post("/reset-password", limiters.resetPassword, validateBody(resetPasswordSchema), resetPasswordHandler);

  return router;
}
