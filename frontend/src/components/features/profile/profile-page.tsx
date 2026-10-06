"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { DetailSection, DetailSkeleton } from "@/components/common/detail-parts";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { PasswordInput } from "@/components/common/password-input";
import { PasswordRequirements } from "@/components/common/password-requirements";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword, useProfile, useUpdateProfile } from "@/hooks/use-profile";
import type { Profile, UpdateProfilePayload } from "@/lib/api/profile";
import { formatDate } from "@/lib/format";
import { applyApiErrors } from "@/lib/form-errors";
import { ROLE_LABEL } from "@/lib/navigation";
import { TIPO_CADASTRO_LABEL } from "@/lib/user-labels";
import {
  passwordChangeFormSchema,
  profileFormSchema,
  type PasswordChangeFormValues,
  type ProfileFormValues,
} from "@/lib/validation/profile";

// Feedback de cada formulário, anunciado e com foco (12 §70).
function useFeedback() {
  const [feedback, setFeedback] = useState<{ kind: "success" | "failure"; message: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedback) ref.current?.focus();
  }, [feedback]);

  const node: ReactNode = (
    <div ref={ref} tabIndex={-1} className="outline-none empty:hidden">
      {feedback?.kind === "success" && (
        <Alert role="status" className="border-success/30 bg-success-surface text-success">
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>{feedback.message}</AlertTitle>
        </Alert>
      )}
      {feedback?.kind === "failure" && (
        <Alert variant="destructive" className="border-destructive/30">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  return { node, setFeedback };
}

function toFormValues(profile: Profile): ProfileFormValues {
  return {
    tipoCadastro: profile.tipoCadastro,
    nome: profile.nome,
    telefone: profile.telefone ?? "",
    razaoSocial: profile.dadosEmpresa?.razaoSocial ?? "",
    nomeFantasia: profile.dadosEmpresa?.nomeFantasia ?? "",
  };
}

function toPayload(values: ProfileFormValues): UpdateProfilePayload {
  return {
    nome: values.nome,
    telefone: values.telefone || null,
    ...(values.tipoCadastro === "PJ"
      ? { dadosEmpresa: { razaoSocial: values.razaoSocial, nomeFantasia: values.nomeFantasia || null } }
      : {}),
  };
}

function resolveProfileField(apiField: string): FieldPath<ProfileFormValues> | undefined {
  if (apiField === "dadosEmpresa.razaoSocial") return "razaoSocial";
  if (apiField === "dadosEmpresa.nomeFantasia") return "nomeFantasia";
  return apiField === "nome" || apiField === "telefone" ? apiField : undefined;
}

// Dados que o usuário não altera por aqui (OQ-041, DEC-078).
function FixedData({ profile }: { profile: Profile }) {
  const items: Array<[string, string]> = [
    ["E-mail", profile.email],
    ["Perfil", ROLE_LABEL[profile.role]],
    ["Tipo de cadastro", TIPO_CADASTRO_LABEL[profile.tipoCadastro]],
    ["Cadastrado em", formatDate(profile.createdAt)],
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="grid gap-0.5">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const mutation = useUpdateProfile();
  const { node: feedback, setFeedback } = useFeedback();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onTouched",
    defaultValues: toFormValues(profile),
  });
  const {
    register,
    reset,
    setError,
    formState: { errors, isDirty },
  } = form;
  const isPJ = profile.tipoCadastro === "PJ";

  function onSubmit(values: ProfileFormValues) {
    setFeedback(null);
    mutation.mutate(toPayload(values), {
      onSuccess: (updated) => {
        reset(toFormValues(updated));
        setFeedback({ kind: "success", message: "Perfil atualizado." });
      },
      onError: (error) => {
        const { message } = applyApiErrors(error, setError, resolveProfileField);
        if (message) setFeedback({ kind: "failure", message });
      },
    });
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
      {feedback}

      <div className="grid gap-5 md:grid-cols-2">
        <FormField id="nome" label={isPJ ? "Nome do responsável" : "Nome"} required error={errors.nome?.message}>
          <Input autoComplete="name" {...register("nome")} />
        </FormField>
        <FormField id="telefone" label="Telefone" error={errors.telefone?.message}>
          <Input type="tel" autoComplete="tel" {...register("telefone")} />
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
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" loading={mutation.isPending} disabled={!isDirty} className="w-full sm:w-auto">
          {mutation.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
        {isDirty && !mutation.isPending && (
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => reset()}>
            Descartar alterações
          </Button>
        )}
      </div>
    </form>
  );
}

const EMPTY_PASSWORDS: PasswordChangeFormValues = { senhaAtual: "", novaSenha: "", confirmacaoNovaSenha: "" };

function resolvePasswordField(apiField: string): FieldPath<PasswordChangeFormValues> | undefined {
  return apiField === "senhaAtual" || apiField === "novaSenha" || apiField === "confirmacaoNovaSenha"
    ? apiField
    : undefined;
}

type PasswordFormProps = {
  // Rótulo do campo da senha atual (ex.: "Senha provisória", DEC-083).
  currentLabel?: string;
  // Chamado após a troca confirmada pela API.
  onChanged?: () => void;
};

// Troca de senha (DEC-078), também usada na troca obrigatória da senha
// provisória (DEC-083).
export function PasswordForm({ currentLabel = "Senha atual", onChanged }: PasswordFormProps = {}) {
  const mutation = useChangePassword();
  const { node: feedback, setFeedback } = useFeedback();
  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeFormSchema),
    mode: "onTouched",
    defaultValues: EMPTY_PASSWORDS,
  });
  const {
    register,
    reset,
    setError,
    control,
    formState: { errors },
  } = form;

  const novaSenha = useWatch({ control, name: "novaSenha" });

  function onSubmit(values: PasswordChangeFormValues) {
    setFeedback(null);
    mutation.mutate(values, {
      onSuccess: () => {
        reset(EMPTY_PASSWORDS);
        setFeedback({ kind: "success", message: "Senha alterada com sucesso." });
        onChanged?.();
      },
      onError: (error) => {
        const { message } = applyApiErrors(error, setError, resolvePasswordField);
        if (message) setFeedback({ kind: "failure", message });
      },
    });
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
      {feedback}

      <FormField id="senhaAtual" label={currentLabel} required error={errors.senhaAtual?.message}>
        <PasswordInput autoComplete="current-password" {...register("senhaAtual")} />
      </FormField>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          id="novaSenha"
          label="Nova senha"
          required
          error={errors.novaSenha?.message}
          after={<PasswordRequirements id="nova-senha-requisitos" value={novaSenha} />}
        >
          <PasswordInput autoComplete="new-password" {...register("novaSenha")} />
        </FormField>
        <FormField
          id="confirmacaoNovaSenha"
          label="Confirmar nova senha"
          required
          error={errors.confirmacaoNovaSenha?.message}
        >
          <PasswordInput autoComplete="new-password" {...register("confirmacaoNovaSenha")} />
        </FormField>
      </div>

      <Button type="submit" loading={mutation.isPending} className="w-full sm:w-auto sm:justify-self-start">
        {mutation.isPending ? "Alterando..." : "Alterar senha"}
      </Button>
    </form>
  );
}

// Meu perfil (RF-011, RF-012, DEC-078), comum aos três perfis.
export function ProfilePage() {
  const query = useProfile();

  if (query.isPending) return <DetailSkeleton label="Carregando perfil..." />;

  if (query.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar seu perfil."
        message="Verifique sua conexão e tente novamente."
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  const profile = query.data;

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-semibold tracking-tight">Meu perfil</h1>

      <DetailSection title="Conta">
        <FixedData profile={profile} />
        <p className="text-sm text-muted-foreground">E-mail, perfil e tipo de cadastro não podem ser alterados por aqui.</p>
      </DetailSection>

      <DetailSection title="Dados pessoais">
        <ProfileForm profile={profile} />
      </DetailSection>

      <DetailSection title="Alterar senha">
        <PasswordForm />
      </DetailSection>
    </div>
  );
}
