import { z } from "zod";
import { COLLECTION_STATUSES } from "../domain/collection-status.js";
import { RECORD_STATUSES } from "../domain/constants.js";
import { paginationQuerySchema } from "./collection.validators.js";

// Lista administrativa de coletas: paginação e filtro opcional por status (05 §16, DEC-075).
export const adminCollectionsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(COLLECTION_STATUSES, { error: "status inválido." }).optional(),
});

export type AdminCollectionsQuery = z.infer<typeof adminCollectionsQuerySchema>;

// PATCH /api/v1/admin/users/:id/status (05 §13.3): somente ATIVO ou INATIVO.
export const updateUserStatusSchema = z.object({
  status: z.enum(RECORD_STATUSES, { error: "Informe ATIVO ou INATIVO." }),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
