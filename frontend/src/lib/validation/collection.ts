import { z } from "zod";

// Solicitação de coleta. Espelha as regras do backend
// (backend/src/validators/collection.validators.ts); a API é a validação
// definitiva (DEC-040). Diferença intencional: a quantidade é pedida em
// unidades inteiras no formulário (DEC-073, OQ-009).

const text = (message: string, max: number) =>
  z.string().trim().min(1, message).max(max, `Máximo de ${max} caracteres.`);

export const addressSchema = z.object({
  cep: z
    .string()
    .transform((value) => value.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(/^\d{8}$/, "O CEP deve ter 8 dígitos.")),
  logradouro: text("Informe o logradouro.", 120),
  numero: text("Informe o número.", 20),
  complemento: z.string().trim().max(120, "Máximo de 120 caracteres."),
  bairro: text("Informe o bairro.", 120),
  cidade: text("Informe a cidade.", 120),
  estado: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Informe a sigla da UF com 2 letras."),
});

export const wasteItemSchema = z.object({
  categoria: text("Informe a categoria.", 60),
  quantidade: z
    .number({ error: "Informe a quantidade." })
    .int("Informe um número inteiro de unidades.")
    .min(1, "A quantidade mínima é 1."),
  condicao: text("Informe a condição.", 60),
});

export const collectionRequestSchema = z.object({
  enderecoColeta: addressSchema,
  itensDescarte: z.array(wasteItemSchema).min(1, "Adicione pelo menos um item."),
  observacoes: z.string().trim().max(1000, "Máximo de 1000 caracteres."),
});

export type CollectionRequestInput = z.input<typeof collectionRequestSchema>;
export type CollectionRequestValues = z.output<typeof collectionRequestSchema>;

export const EMPTY_ITEM = { categoria: "", quantidade: 1, condicao: "" };
