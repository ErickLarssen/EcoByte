import { z } from "zod";
import { addressSchema, text } from "./address";

// Edição do ecoponto (DEC-076). Espelha backend/src/validators/ecopoint.validators.ts;
// a API é a validação definitiva (DEC-040). Latitude e longitude são digitadas
// separadamente (vírgula ou ponto) e enviadas como GeoJSON [longitude, latitude].

const coordinate = (label: string, limit: number) =>
  z
    .string()
    .trim()
    .transform((value) => value.replace(",", "."))
    .refine((value) => value === "" || (Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit), {
      message: `${label} inválida.`,
    });

export const ecopointFormSchema = z
  .object({
    nome: text("Informe o nome.", 120),
    descricao: z.string().trim().max(500, "Máximo de 500 caracteres."),
    endereco: addressSchema,
    latitude: coordinate("Latitude", 90),
    longitude: coordinate("Longitude", 180),
  })
  .superRefine((values, context) => {
    // Localização completa ou nenhuma (RF-037: "quando configuradas").
    if ((values.latitude === "") !== (values.longitude === "")) {
      const missing = values.latitude === "" ? "latitude" : "longitude";
      context.addIssue({ code: "custom", path: [missing], message: "Informe latitude e longitude, ou deixe as duas em branco." });
    }
  });

export type EcopointFormInput = z.input<typeof ecopointFormSchema>;
export type EcopointFormValues = z.output<typeof ecopointFormSchema>;
