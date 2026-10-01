import { z } from "zod";
import { paginationQuerySchema } from "./collection.validators.js";

// GET /api/v1/notifications: paginação e filtro opcional de leitura (DEC-077).
export const notificationsQuerySchema = paginationQuerySchema.extend({
  lida: z
    .enum(["true", "false"], { error: "lida deve ser true ou false." })
    .transform((value) => value === "true")
    .optional(),
});

export type NotificationsQuery = z.infer<typeof notificationsQuerySchema>;
