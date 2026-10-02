import { z } from "zod";
import { TIPOS_CADASTRO } from "../domain/constants.js";

// Política de senha (DEC-019, BR-006). O limite superior evita
// custo excessivo de hash com entradas muito grandes.
export const passwordSchema = z
  .string({ error: "Informe a senha." })
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(128, "A senha deve ter no máximo 128 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/\d/, "A senha deve conter pelo menos um número.")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial.");

// E-mail normalizado em minúsculas (BR-005, 09 §11).
const emailSchema = z
  .string({ error: "Informe o e-mail." })
  .trim()
  .toLowerCase()
  .max(254, "O e-mail deve ter no máximo 254 caracteres.")
  .pipe(z.email("Informe um e-mail válido."));

export const requiredText = (message: string, max: number) =>
  z.string({ error: message }).trim().min(1, message).max(max, `Máximo de ${max} caracteres.`);

// Cadastro público (DEC-066). Campos não previstos, como `role`, são descartados.
export const registerSchema = z
  .object({
    nome: requiredText("Informe o nome.", 120),
    email: emailSchema,
    senha: passwordSchema,
    confirmacaoSenha: z.string({ error: "Confirme a senha." }),
    tipoCadastro: z.enum(TIPOS_CADASTRO, { error: "Selecione PF ou PJ." }),
    telefone: z
      .string()
      .trim()
      .max(20, "O telefone deve ter no máximo 20 caracteres.")
      .optional()
      .transform((value) => (value ? value : undefined)),
    dadosEmpresa: z
      .object({
        razaoSocial: requiredText("Informe a razão social.", 200),
        nomeFantasia: z
          .string()
          .trim()
          .max(200, "Máximo de 200 caracteres.")
          .optional()
          .transform((value) => (value ? value : undefined)),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.senha !== data.confirmacaoSenha) {
      ctx.addIssue({ code: "custom", path: ["confirmacaoSenha"], message: "A confirmação deve ser igual à senha." });
    }

    if (data.tipoCadastro === "PJ" && !data.dadosEmpresa) {
      ctx.addIssue({
        code: "custom",
        path: ["dadosEmpresa", "razaoSocial"],
        message: "Informe a razão social.",
      });
    }

    if (data.tipoCadastro === "PF" && data.dadosEmpresa) {
      ctx.addIssue({
        code: "custom",
        path: ["dadosEmpresa"],
        message: "Dados empresariais se aplicam somente a cadastros PJ.",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Login: a política de senha não é revalidada aqui para não revelar regras
// nem diferenciar senhas antigas; apenas presença e tamanho máximo.
export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string({ error: "Informe a senha." }).min(1, "Informe a senha.").max(128, "Credenciais inválidas."),
});

export type LoginInput = z.infer<typeof loginSchema>;
