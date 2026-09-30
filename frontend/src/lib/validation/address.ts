import { z } from "zod";

// Endereço, compartilhado pela solicitação de coleta e pelo ecoponto. Espelha
// backend/src/validators/address.validators.ts; a API é a validação definitiva (DEC-040).

export const text = (message: string, max: number) =>
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
