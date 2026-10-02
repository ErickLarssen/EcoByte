import { z } from "zod";
import { passwordSchema, requiredText } from "./auth.validators.js";

// Texto opcional em que vazio ou null remove o valor.
const clearableText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .nullable()
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null));

// PATCH /api/v1/profile (06 §11.2, DEC-078): somente nome, telefone e, para
// PJ, dados da empresa. E-mail, role, tipoCadastro, status e documento não
// fazem parte do contrato e são descartados (OQ-041).
export const updateProfileSchema = z
  .object({
    nome: requiredText("Informe o nome.", 120).optional(),
    telefone: clearableText(20, "O telefone deve ter no máximo 20 caracteres."),
    dadosEmpresa: z
      .object({
        razaoSocial: requiredText("Informe a razão social.", 200),
        nomeFantasia: clearableText(200, "Máximo de 200 caracteres."),
      })
      .optional(),
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: "Informe ao menos um campo para atualizar.",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// PATCH /api/v1/profile/password (DEC-078): exige a senha atual; a nova segue
// a política do cadastro (DEC-019).
export const changePasswordSchema = z
  .object({
    senhaAtual: z.string({ error: "Informe a senha atual." }).min(1, "Informe a senha atual.").max(128, "Senha atual incorreta."),
    novaSenha: passwordSchema,
    confirmacaoNovaSenha: z.string({ error: "Confirme a nova senha." }),
  })
  .superRefine((data, ctx) => {
    if (data.novaSenha !== data.confirmacaoNovaSenha) {
      ctx.addIssue({ code: "custom", path: ["confirmacaoNovaSenha"], message: "A confirmação deve ser igual à nova senha." });
    }
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
