import { z } from "zod";
import { OUTSIDE_SERVICE_AREA_MESSAGE, SERVICE_AREA, isWithinServiceArea } from "../domain/service-area.js";
import { enderecoShape, localizacaoSchema, optionalText, text } from "./address.validators.js";

// Endereço da coleta: somente na área de atendimento, Diadema-SP (DEC-081).
const enderecoColetaSchema = z
  .object({ ...enderecoShape, localizacao: localizacaoSchema.optional() }, { error: "Informe o endereço da coleta." })
  .superRefine((endereco, ctx) => {
    if (!isWithinServiceArea(endereco.cidade, endereco.estado)) {
      ctx.addIssue({ code: "custom", path: ["cidade"], message: OUTSIDE_SERVICE_AREA_MESSAGE });
    }
  })
  // Grava a grafia oficial da área de atendimento.
  .transform((endereco) => ({ ...endereco, cidade: SERVICE_AREA.cidade, estado: SERVICE_AREA.estado }));

// Item de descarte (BR-014). categoria/condicao sem lista fechada enquanto
// OQ-007/OQ-010 estiverem abertas; quantidade > 0, unidade em aberto (OQ-009).
const itemDescarteSchema = z.object({
  categoria: text("a categoria", 60).toUpperCase(),
  quantidade: z
    .number({ error: "Informe a quantidade." })
    .finite("Informe uma quantidade válida.")
    .positive("A quantidade deve ser maior que zero."),
  condicao: text("a condição", 60).toUpperCase(),
});

// Criação de coleta (06_API §13.1). `dataAgendada`, `status`, `usuarioId` e
// `coletorId` não fazem parte do contrato e são descartados (OQ-020, 05 RT-005).
export const createCollectionSchema = z.object({
  enderecoColeta: enderecoColetaSchema,
  itensDescarte: z
    .array(itemDescarteSchema, { error: "Informe os itens de descarte." })
    .min(1, "Informe pelo menos um item de descarte."),
  observacoes: optionalText(1000),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

// Paginação (06_API §7).
export const paginationQuerySchema = z.object({
  page: z.coerce.number({ error: "page inválido." }).int("page inválido.").min(1, "page deve ser pelo menos 1.").default(1),
  limit: z.coerce
    .number({ error: "limit inválido." })
    .int("limit inválido.")
    .min(1, "limit deve ser pelo menos 1.")
    .max(100, "limit deve ser no máximo 100.")
    .default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// Coletas atribuídas ao coletor: grupo opcional (DEC-084). "andamento" vai de
// ACEITA a ENTREGUE_ECOPONTO; "concluidas" é CONCLUIDA.
export const ASSIGNED_GROUPS = ["andamento", "concluidas"] as const;

export const assignedQuerySchema = paginationQuerySchema.extend({
  grupo: z.enum(ASSIGNED_GROUPS, { error: "grupo deve ser andamento ou concluidas." }).optional(),
});

export type AssignedQuery = z.infer<typeof assignedQuerySchema>;
