import { z } from "zod";
import { passwordSchema } from "./auth";

// Cadastro de coletor (DEC-083). Espelha createCollectorSchema do backend; a API
// é a validação definitiva (DEC-040).
export const collectorFormSchema = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome.").max(120, "Máximo de 120 caracteres."),
    email: z.string().trim().min(1, "Informe o e-mail.").pipe(z.email("Informe um e-mail válido.")),
    telefone: z.string().trim().min(1, "Informe o telefone.").max(20, "O telefone deve ter no máximo 20 caracteres."),
    senha: passwordSchema,
    confirmacaoSenha: z.string().min(1, "Confirme a senha."),
  })
  .superRefine((values, ctx) => {
    if (values.confirmacaoSenha && values.senha !== values.confirmacaoSenha) {
      ctx.addIssue({ code: "custom", path: ["confirmacaoSenha"], message: "A confirmação deve ser igual à senha." });
    }
  });

export type CollectorFormValues = z.infer<typeof collectorFormSchema>;
