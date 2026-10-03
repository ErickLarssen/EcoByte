"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { PasswordInput } from "@/components/common/password-input";
import { PasswordRequirements } from "@/components/common/password-requirements";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { RegisterPayload, TipoCadastro } from "@/lib/api/auth";
import { applyApiErrors } from "@/lib/form-errors";
import { withReturnParam } from "@/lib/navigation";
import { registrationFormSchema, type RegistrationFormValues } from "@/lib/validation/auth";
import { useAuth } from "./auth-provider";

const FORM_FIELDS: readonly FieldPath<RegistrationFormValues>[] = [
  "tipoCadastro",
  "nome",
  "email",
  "telefone",
  "razaoSocial",
  "nomeFantasia",
  "senha",
  "confirmacaoSenha",
];

// Nomes da API → nomes do formulário.
const API_FIELD_MAP: Record<string, FieldPath<RegistrationFormValues>> = {
  "dadosEmpresa.razaoSocial": "razaoSocial",
  "dadosEmpresa.nomeFantasia": "nomeFantasia",
  dadosEmpresa: "razaoSocial",
};

const resolveApiField = (apiField: string): FieldPath<RegistrationFormValues> | undefined =>
  API_FIELD_MAP[apiField] ?? FORM_FIELDS.find((field) => field === apiField);

function toPayload(values: RegistrationFormValues): RegisterPayload {
  return {
    nome: values.nome,
    email: values.email,
    senha: values.senha,
    confirmacaoSenha: values.confirmacaoSenha,
    tipoCadastro: values.tipoCadastro,
    telefone: values.telefone || undefined,
    dadosEmpresa:
      values.tipoCadastro === "PJ"
        ? { razaoSocial: values.razaoSocial, nomeFantasia: values.nomeFantasia || undefined }
        : undefined,
  };
}

const TIPOS = [
  { value: "PF", title: "Pessoa física", description: "Para descartar seus próprios eletrônicos." },
  { value: "PJ", title: "Pessoa jurídica", description: "Para empresas e instituições." },
] as const;

// Cadastro de cliente PF ou PJ (11 §70, 10 §40, DEC-066). Após o sucesso, o
// usuário já está autenticado e a guarda de visitante o leva à sua área.
type RegistrationFormProps = {
  // Tipo pré-selecionado (ex.: "Sou empresa / instituição", DEC-079).
  initialTipo?: TipoCadastro;
  // Destino após o cadastro (?proximo=), mantido no link para "Entrar".
  returnTo?: string | null;
};

export function RegistrationForm({ initialTipo = "PF", returnTo }: RegistrationFormProps = {}) {
  const { register: registerAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    mode: "onTouched",
    defaultValues: {
      tipoCadastro: initialTipo,
      nome: "",
      email: "",
      telefone: "",
      razaoSocial: "",
      nomeFantasia: "",
      senha: "",
      confirmacaoSenha: "",
    },
  });

  const tipoCadastro = useWatch({ control, name: "tipoCadastro" });
  const senha = useWatch({ control, name: "senha" });
  const isPJ = tipoCadastro === "PJ";

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerAccount(toPayload(values));
    } catch (error) {
      setFormError(applyApiErrors(error, setError, resolveApiField).message);
    }
  });

  return (
    <form onSubmit={onSubmit} method="post" noValidate aria-label="Criar conta" className="grid gap-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <FieldSet>
        <FieldLegend variant="label">Tipo de cadastro</FieldLegend>
        <Controller
          control={control}
          name="tipoCadastro"
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-3 sm:grid-cols-2"
            >
              {TIPOS.map((tipo) => (
                <FieldLabel key={tipo.value} htmlFor={`tipo-${tipo.value}`}>
                  <Field orientation="horizontal">
                    <RadioGroupItem value={tipo.value} id={`tipo-${tipo.value}`} />
                    <FieldContent>
                      <span className="font-medium">{tipo.title}</span>
                      <FieldDescription>{tipo.description}</FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          )}
        />
      </FieldSet>

      <FieldGroup>
        <FormField
          id="nome"
          label={isPJ ? "Nome do responsável" : "Nome completo"}
          required
          error={errors.nome?.message}
        >
          <Input autoComplete="name" {...register("nome")} />
        </FormField>

        {isPJ && (
          <>
            <FormField id="razaoSocial" label="Razão social" required error={errors.razaoSocial?.message}>
              <Input autoComplete="organization" {...register("razaoSocial")} />
            </FormField>

            <FormField id="nomeFantasia" label="Nome fantasia" error={errors.nomeFantasia?.message}>
              <Input {...register("nomeFantasia")} />
            </FormField>
          </>
        )}

        <FormField id="email" label="E-mail" required error={errors.email?.message}>
          <Input type="email" inputMode="email" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField
          id="telefone"
          label="Telefone"
          description="Opcional. Ajuda o coletor a falar com você no dia da coleta."
          error={errors.telefone?.message}
        >
          <Input type="tel" inputMode="tel" autoComplete="tel" {...register("telefone")} />
        </FormField>

        <FormField
          id="senha"
          label="Senha"
          required
          error={errors.senha?.message}
          after={<PasswordRequirements id="senha-requisitos" value={senha} />}
        >
          <PasswordInput autoComplete="new-password" {...register("senha")} />
        </FormField>

        <FormField id="confirmacaoSenha" label="Confirme a senha" required error={errors.confirmacaoSenha?.message}>
          <PasswordInput autoComplete="new-password" {...register("confirmacaoSenha")} />
        </FormField>
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href={withReturnParam("/entrar", returnTo)} className="font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
