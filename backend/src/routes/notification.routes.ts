import { Router } from "express";
import { listNotificationsHandler, markAsReadHandler } from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/authenticate.js";

// Notificações do usuário autenticado (05_ROUTES §14), de qualquer perfil.
// A posse é verificada no backend em cada consulta (RF-048, RF-049).
export function createNotificationRouter(): Router {
  const router = Router();

  router.use(requireAuth);
  router.get("/", listNotificationsHandler);
  router.patch("/:id/read", markAsReadHandler);

  return router;
}
