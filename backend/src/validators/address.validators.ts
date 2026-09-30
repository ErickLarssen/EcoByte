import { z } from "zod";

// Regras de entrada compartilhadas por coleta e ecoponto (DEC-040).

export const text = (label: string, max: number) =>
  z
    .string({ error: `Informe ${label}.` })
    .trim()
    .min(1, `Informe ${label}.`)
    .max(max, `Máximo de ${max} caracteres.`);

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .optional()
    .transform((value) => (value ? value : undefined));

// GeoJSON Point [longitude, latitude] (DEC-012, BR-039).
export const localizacaoSchema = z.object({
  type: z.literal("Point", { error: "localizacao.type deve ser Point." }),
  coordinates: z.tuple(
    [
      z.number().min(-180, "Longitude inválida.").max(180, "Longitude inválida."),
      z.number().min(-90, "Latitude inválida.").max(90, "Latitude inválida."),
    ],
    { error: "Informe [longitude, latitude]." },
  ),
});

// Campos de endereço (DEC-061).
export const enderecoShape = {
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
};
