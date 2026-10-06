import { z } from "zod";
import { OUTSIDE_SERVICE_AREA_MESSAGE, isWithinServiceArea } from "@/lib/service-area";
import { addressSchema, text } from "./address";

// Solicitação de coleta. Espelha as regras do backend
// (backend/src/validators/collection.validators.ts); a API é a validação
// definitiva (DEC-040). Diferença intencional: a quantidade é pedida em
// unidades inteiras no formulário (DEC-073, OQ-009).

export const wasteItemSchema = z.object({
  categoria: text("Informe a categoria.", 60),
  quantidade: z
    .number({ error: "Informe a quantidade." })
    .int("Informe um número inteiro de unidades.")
    .min(1, "A quantidade mínima é 1."),
  condicao: text("Informe a condição.", 60),
});

export const collectionRequestSchema = z.object({
  // Somente Diadema-SP (DEC-081).
  enderecoColeta: addressSchema.superRefine((endereco, ctx) => {
    if (!isWithinServiceArea(endereco.cidade, endereco.estado)) {
      ctx.addIssue({ code: "custom", path: ["cidade"], message: OUTSIDE_SERVICE_AREA_MESSAGE });
    }
  }),
  itensDescarte: z.array(wasteItemSchema).min(1, "Adicione pelo menos um item."),
  observacoes: z.string().trim().max(1000, "Máximo de 1000 caracteres."),
});

export type CollectionRequestInput = z.input<typeof collectionRequestSchema>;
export type CollectionRequestValues = z.output<typeof collectionRequestSchema>;

export const EMPTY_ITEM = { categoria: "", quantidade: 1, condicao: "" };
