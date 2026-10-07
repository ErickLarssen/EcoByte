"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/api/auth";
import { applyApiErrors } from "@/lib/form-errors";
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from "@/lib/validation/auth";

const BACK_LINK = "font-medium text-primary underline-offset-4 hover:underline";

// Pedido do link de redefinição (DEC-088). A confirmação é a mesma com ou sem
// conta para o e-mail: a tela não revela se ele está cadastrado (09 §50).
export function ForgotPasswordForm() {
  const [sent, setSent] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null);
    try {
      setSent(await forgotPassword(email));
    } catch (error) {
      setFormError(applyApiErrors(error, setError, (field) => (field === "email" ? "email" : undefined)).message);
    }
  });

  if (sent) {
    return (
      <div role="status" className="grid justify-items-center gap-4 text-center">
        <MailCheck className="size-12 text-success" aria-hidden="true" />
        <div className="grid gap-1">
          <p className="text-lg font-semibold">Verifique seu e-mail</p>
          <p className="text-muted-foreground">{sent}</p>
          <p className="text-sm text-muted-foreground">O link vale por 1 hora. Confira também a caixa de spam.</p>
        </div>
        <Button asChild>
          <Link href="/entrar">Voltar para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} method="post" noValidate aria-label="Recuperar senha" className="grid gap-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FormField id="email" label="E-mail" required error={errors.email?.message}>
        <Input type="email" inputMode="email" autoComplete="email" {...register("email")} />
      </FormField>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link href="/entrar" className={BACK_LINK}>
          Entrar
        </Link>
      </p>
    </form>
  );
}
