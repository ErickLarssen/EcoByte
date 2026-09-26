"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { PasswordInput } from "@/components/common/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useAuth } from "./auth-provider";

// Mensagens amigáveis por código de erro (06_API §9.3).
function loginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Não foi possível entrar. Tente novamente.";

  switch (error.code) {
    case "INVALID_CREDENTIALS":
      return "E-mail ou senha incorretos.";
    case "USER_INACTIVE":
      return "Sua conta está inativa. Entre em contato com a EcoByte.";
    default:
      return error.message;
  }
}

// Formulário de login (11 §71). O redirecionamento após o sucesso é feito
// pela guarda de visitante (GuestOnly), conforme o perfil (DEC-072).
export function LoginForm() {
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
    defaultValues: { email: "", senha: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values);
    } catch (error) {
      setFormError(loginErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} method="post" noValidate aria-label="Entrar" className="grid gap-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <FormField id="email" label="E-mail" required error={errors.email?.message}>
          <Input type="email" inputMode="email" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField id="senha" label="Senha" required error={errors.senha?.message}>
          <PasswordInput autoComplete="current-password" {...register("senha")} />
        </FormField>
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-primary underline-offset-4 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
