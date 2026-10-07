"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { PasswordInput } from "@/components/common/password-input";
import { PasswordRequirements } from "@/components/common/password-requirements";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { applyApiErrors } from "@/lib/form-errors";
import { resetPasswordFormSchema, type ResetPasswordFormValues } from "@/lib/validation/auth";
import { useAuth } from "./auth-provider";

// Link sem uso possível: ausente, já usado ou vencido.
function InvalidLink({ message }: { message: string }) {
  return (
    <div role="status" className="grid justify-items-center gap-4 text-center">
      <XCircle className="size-12 text-error" aria-hidden="true" />
      <div className="grid gap-1">
        <p className="text-lg font-semibold">Não foi possível usar este link</p>
        <p className="text-muted-foreground">{message}</p>
      </div>
      <Button asChild>
        <Link href="/esqueci-senha">Pedir um novo link</Link>
      </Button>
    </div>
  );
}

const resolveField = (field: string) =>
  field === "novaSenha" || field === "confirmacaoSenha" ? (field as keyof ResetPasswordFormValues) : undefined;

// Nova senha a partir do link enviado por e-mail (DEC-088). Funciona logado ou
// não; depois da troca, todas as sessões da conta são encerradas e o usuário
// entra de novo com a nova senha.
export function ResetPasswordForm({ token }: { token: string | null }) {
  const { refreshUser } = useAuth();
  const [done, setDone] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(token ? null : "Link de redefinição inválido.");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onTouched",
    defaultValues: { novaSenha: "", confirmacaoSenha: "" },
  });
  const novaSenha = useWatch({ control, name: "novaSenha" });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setFormError(null);
    try {
      setDone(await resetPassword({ token, ...values }));
      // A sessão deste navegador, se havia, foi encerrada pela API.
      await refreshUser();
    } catch (error) {
      if (error instanceof ApiError && (error.code === "INVALID_TOKEN" || error.code === "TOKEN_EXPIRED")) {
        setLinkError(error.message);
        return;
      }
      setFormError(applyApiErrors(error, setError, resolveField).message);
    }
  });

  if (linkError) return <InvalidLink message={linkError} />;

  if (done) {
    return (
      <div role="status" className="grid justify-items-center gap-4 text-center">
        <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
        <div className="grid gap-1">
          <p className="text-lg font-semibold">Senha redefinida!</p>
          <p className="text-muted-foreground">{done}</p>
        </div>
        <Button asChild>
          <Link href="/entrar">Entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} method="post" noValidate aria-label="Redefinir senha" className="grid gap-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <FormField
          id="novaSenha"
          label="Nova senha"
          required
          error={errors.novaSenha?.message}
          after={<PasswordRequirements id="nova-senha-requisitos" value={novaSenha} />}
        >
          <PasswordInput autoComplete="new-password" {...register("novaSenha")} />
        </FormField>

        <FormField id="confirmacaoSenha" label="Confirmar nova senha" required error={errors.confirmacaoSenha?.message}>
          <PasswordInput autoComplete="new-password" {...register("confirmacaoSenha")} />
        </FormField>
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Redefinir senha"}
      </Button>
    </form>
  );
}
