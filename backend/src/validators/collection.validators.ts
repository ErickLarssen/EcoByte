import { z } from "zod";

const text = (label: string, max: number) =>
  z
    .string({ error: `Informe ${label}.` })
    .trim()
    .min(1, `Informe ${label}.`)
    .max(max, `Máximo de ${max} caracteres.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .optional()
    .transform((value) => (value ? value : undefined));

// GeoJSON Point [longitude, latitude] (DEC-012, BR-039).
const localizacaoSchema = z.object({
  type: z.literal("Point", { error: "localizacao.type deve ser Point." }),
  coordinates: z.tuple(
    [
      z.number().min(-180, "Longitude inválida.").max(180, "Longitude inválida."),
      z.number().min(-90, "Latitude inválida.").max(90, "Latitude inválida."),
    ],
    { error: "Informe [longitude, latitude]." },
  ),
});

const enderecoColetaSchema = z.object(
  {
    logradouro: text("o logradouro", 120),
    numero: text("o número", 20),
    complemento: optionalText(120),
    bairro: text("o bairro", 120),
    cidade: text("a cidade", 120),
    estado: z
      .string({ error: "Informe a UF." })
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, "Informe a sigla da UF com 2 letras."),
    // CEP normalizado: hífen e pontos removidos, 8 dígitos (07 §14).
    cep: z
      .string({ error: "Informe o CEP." })
      .transform((value) => value.replace(/[\s.-]/g, ""))
      .pipe(z.string().regex(/^\d{8}$/, "O CEP deve ter 8 dígitos.")),
    localizacao: localizacaoSchema.optional(),
  },
  { error: "Informe o endereço da coleta." },
);

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
