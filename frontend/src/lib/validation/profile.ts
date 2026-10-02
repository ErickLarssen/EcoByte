import { z } from "zod";
import { passwordSchema } from "./auth";

// Perfil (DEC-078). Espelha backend/src/validators/profile.validators.ts;
// a API é a validação definitiva (DEC-040).

export const profileFormSchema = z
  .object({
    tipoCadastro: z.enum(["PF", "PJ"]),
    nome: z.string().trim().min(1, "Informe o nome.").max(120, "Máximo de 120 caracteres."),
    telefone: z.string().trim().max(20, "O telefone deve ter no máximo 20 caracteres."),
    razaoSocial: z.string().trim().max(200, "Máximo de 200 caracteres."),
    nomeFantasia: z.string().trim().max(200, "Máximo de 200 caracteres."),
  })
  .superRefine((values, ctx) => {
    if (values.tipoCadastro === "PJ" && !values.razaoSocial) {
      ctx.addIssue({ code: "custom", path: ["razaoSocial"], message: "Informe a razão social." });
    }
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const passwordChangeFormSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual."),
    novaSenha: passwordSchema,
    confirmacaoNovaSenha: z.string().min(1, "Confirme a nova senha."),
  })
  .superRefine((values, ctx) => {
    if (values.confirmacaoNovaSenha && values.novaSenha !== values.confirmacaoNovaSenha) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmacaoNovaSenha"],
        message: "A confirmação deve ser igual à nova senha.",
      });
    }
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeFormSchema>;
