import { z } from "zod";
import { RECORD_STATUSES } from "../domain/constants.js";
import { enderecoShape, localizacaoSchema, text } from "./address.validators.js";

// PATCH /api/v1/ecopoint (DEC-065, DEC-076): alteração parcial. `horarios`
// não faz parte do contrato enquanto OQ-005 estiver aberta e é descartado,
// como qualquer campo não previsto.
export const updateEcopointSchema = z
  .object({
    nome: text("o nome", 120).optional(),
    // Texto vazio remove a descrição.
    descricao: z
      .string()
      .trim()
      .max(500, "Máximo de 500 caracteres.")
      .nullable()
      .optional()
      .transform((value) => (value === undefined ? undefined : value || null)),
    endereco: z.object(enderecoShape, { error: "Informe o endereço." }).optional(),
    // null remove a localização (RF-037: "quando configuradas").
    localizacao: localizacaoSchema.nullable().optional(),
    status: z.enum(RECORD_STATUSES, { error: "Informe ATIVO ou INATIVO." }).optional(),
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: "Informe ao menos um campo para atualizar.",
  });

export type UpdateEcopointInput = z.infer<typeof updateEcopointSchema>;
