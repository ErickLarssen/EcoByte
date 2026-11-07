import { z } from "zod";
import { COLLECTION_STATUSES } from "../domain/collection-status.js";
import { RECORD_STATUSES } from "../domain/constants.js";
import { emailSchema, passwordSchema, requiredText } from "./auth.validators.js";
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

// POST /api/v1/admin/users (DEC-083): cadastro de coletor pelo administrador,
// com senha provisória (política do DEC-019) e telefone obrigatório.
export const createCollectorSchema = z
  .object({
    nome: requiredText("Informe o nome.", 120),
    email: emailSchema,
    telefone: requiredText("Informe o telefone.", 20),
    senha: passwordSchema,
    confirmacaoSenha: z.string({ error: "Confirme a senha." }),
  })
  .superRefine((data, ctx) => {
    if (data.senha !== data.confirmacaoSenha) {
      ctx.addIssue({ code: "custom", path: ["confirmacaoSenha"], message: "A confirmação deve ser igual à senha." });
    }
  });

export type CreateCollectorInput = z.infer<typeof createCollectorSchema>;

// GET /api/v1/admin/reports (RF-046, DEC-098): período opcional pela data da
// solicitação, em AAAA-MM-DD; `fim` é inclusivo.
const reportDate = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} deve estar no formato AAAA-MM-DD.`)
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
    }, `${label} não é uma data válida.`)
    .optional();

export const reportsQuerySchema = z
  .object({ inicio: reportDate("inicio"), fim: reportDate("fim") })
  .refine((query) => !query.inicio || !query.fim || query.inicio <= query.fim, {
    path: ["fim"],
    message: "fim deve ser igual ou posterior a inicio.",
  });

export type ReportsQuery = z.infer<typeof reportsQuerySchema>;
