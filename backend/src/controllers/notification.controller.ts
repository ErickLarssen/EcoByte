import type { Request, Response } from "express";
import { parseInput } from "../middlewares/validate-body.js";
import { listNotifications, markNotificationAsRead } from "../services/notification.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { notificationsQuerySchema } from "../validators/notification.validators.js";

// GET /api/v1/notifications
export async function listNotificationsHandler(req: Request, res: Response): Promise<void> {
  const page = await listNotifications(req.user!.id, parseInput(notificationsQuerySchema, req.query));
  sendSuccess(res, 200, "Notificações encontradas.", page);
}

// PATCH /api/v1/notifications/:id/read
export async function markAsReadHandler(req: Request<{ id: string }>, res: Response): Promise<void> {
  const notification = await markNotificationAsRead(req.params.id, req.user!.id);
  sendSuccess(res, 200, "Notificação marcada como lida.", { notification });
}
