"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { BackLink, DetailSection } from "@/components/common/detail-parts";
import { FormField } from "@/components/common/form-field";
import { PasswordInput } from "@/components/common/password-input";
import { PasswordRequirements } from "@/components/common/password-requirements";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateCollector } from "@/hooks/use-admin";
import { applyApiErrors } from "@/lib/form-errors";
import { collectorFormSchema, type CollectorFormValues } from "@/lib/validation/collector";

const FIELDS: Array<FieldPath<CollectorFormValues>> = ["nome", "email", "telefone", "senha", "confirmacaoSenha"];

function resolveApiField(apiField: string): FieldPath<CollectorFormValues> | undefined {
  return FIELDS.find((field) => field === apiField);
}

// Cadastro de coletor pelo administrador (DEC-083). O coletor entra com a
// senha provisória e é obrigado a trocá-la no primeiro acesso.
export function AdminCollectorForm() {
  const router = useRouter();
  const mutation = useCreateCollector();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<CollectorFormValues>({
    resolver: zodResolver(collectorFormSchema),
    mode: "onTouched",
    defaultValues: { nome: "", email: "", telefone: "", senha: "", confirmacaoSenha: "" },
  });
  const {
    register,
    control,
    setError,
    formState: { errors },
  } = form;
  const senha = useWatch({ control, name: "senha" });

  function onSubmit(values: CollectorFormValues) {
    setFormError(null);
    mutation.mutate(values, {
      onSuccess: (user) => router.push(`/admin/usuarios/${user.id}?novo=1`),
      onError: (error) => setFormError(applyApiErrors(error, setError, resolveApiField).message),
    });
  }

  return (
    <div className="grid gap-5">
      <BackLink href="/admin/usuarios">Usuários</BackLink>
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Cadastrar coletor</h1>
        <p className="text-muted-foreground">Coletores são cadastrados somente pela administração.</p>
      </div>

      <DetailSection title="Dados do coletor">
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
          {formError && (
            <Alert variant="destructive" className="border-destructive/30">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField id="nome" label="Nome" required error={errors.nome?.message}>
                <Input autoComplete="off" {...register("nome")} />
              </FormField>
            </div>
            <FormField id="email" label="E-mail" required error={errors.email?.message}>
              <Input type="email" autoComplete="off" {...register("email")} />
            </FormField>
            <FormField
              id="telefone"
              label="Telefone"
              required
              description="Para contato da operação."
              error={errors.telefone?.message}
            >
              <Input type="tel" autoComplete="off" {...register("telefone")} />
            </FormField>
          </div>

          <Alert className="border-info/30 bg-info-surface text-info">
            <Info aria-hidden="true" />
            <AlertDescription className="text-info">
              Defina uma senha provisória e repasse ao coletor. No primeiro acesso, ele será obrigado a trocá-la.
            </AlertDescription>
          </Alert>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              id="senha"
              label="Senha provisória"
              required
              error={errors.senha?.message}
              after={<PasswordRequirements id="senha-provisoria-requisitos" value={senha} />}
            >
              <PasswordInput autoComplete="new-password" {...register("senha")} />
            </FormField>
            <FormField id="confirmacaoSenha" label="Confirmar senha provisória" required error={errors.confirmacaoSenha?.message}>
              <PasswordInput autoComplete="new-password" {...register("confirmacaoSenha")} />
            </FormField>
          </div>

          <Button type="submit" size="lg" loading={mutation.isPending} className="w-full sm:w-auto sm:justify-self-start">
            {mutation.isPending ? "Cadastrando..." : "Cadastrar coletor"}
          </Button>
        </form>
      </DetailSection>
    </div>
  );
}
