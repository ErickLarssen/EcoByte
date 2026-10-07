import { z } from "zod";

// Regras de senha (DEC-019), com as mesmas mensagens do backend
// (backend/src/validators/auth.validators.ts). O backend é a validação
// definitiva; aqui elas servem ao feedback imediato (DEC-040).
export const PASSWORD_RULES = [
  { id: "length", label: "Pelo menos 8 caracteres", test: (value: string) => value.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lower", label: "Uma letra minúscula", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", label: "Um número", test: (value: string) => /\d/.test(value) },
  { id: "special", label: "Um caractere especial", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(128, "A senha deve ter no máximo 128 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/\d/, "A senha deve conter pelo menos um número.")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial.");

const emailSchema = z.string().trim().min(1, "Informe o e-mail.").pipe(z.email("Informe um e-mail válido."));

export const loginFormSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, "Informe a senha."),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

// Recuperação de senha (DEC-088).
export const forgotPasswordFormSchema = z.object({ email: emailSchema });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    novaSenha: passwordSchema,
    confirmacaoSenha: z.string().min(1, "Confirme a nova senha."),
  })
  .superRefine((values, ctx) => {
    if (values.confirmacaoSenha && values.novaSenha !== values.confirmacaoSenha) {
      ctx.addIssue({ code: "custom", path: ["confirmacaoSenha"], message: "A confirmação deve ser igual à nova senha." });
    }
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

// Campos do formulário de cadastro (DEC-066). Razão social só é exigida para PJ.
export const registrationFormSchema = z
  .object({
    tipoCadastro: z.enum(["PF", "PJ"]),
    nome: z.string().trim().min(1, "Informe o nome.").max(120, "Máximo de 120 caracteres."),
    email: emailSchema,
    telefone: z.string().trim().max(20, "O telefone deve ter no máximo 20 caracteres."),
    razaoSocial: z.string().trim().max(200, "Máximo de 200 caracteres."),
    nomeFantasia: z.string().trim().max(200, "Máximo de 200 caracteres."),
    senha: passwordSchema,
    confirmacaoSenha: z.string().min(1, "Confirme a senha."),
  })
  .superRefine((values, ctx) => {
    if (values.confirmacaoSenha && values.senha !== values.confirmacaoSenha) {
      ctx.addIssue({ code: "custom", path: ["confirmacaoSenha"], message: "A confirmação deve ser igual à senha." });
    }

    if (values.tipoCadastro === "PJ" && !values.razaoSocial) {
      ctx.addIssue({ code: "custom", path: ["razaoSocial"], message: "Informe a razão social." });
    }
  });

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;
