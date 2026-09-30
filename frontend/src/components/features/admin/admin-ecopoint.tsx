"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, MapPinOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { AddressFields } from "@/components/common/address-fields";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DetailSection, DetailSkeleton } from "@/components/common/detail-parts";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { UserStatusBadge } from "@/components/domain/user-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEcopoint, useUpdateEcopoint } from "@/hooks/use-ecopoint";
import type { RecordStatus } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Ecopoint, UpdateEcopointPayload } from "@/lib/api/ecopoint";
import { formatDateTime } from "@/lib/format";
import { applyApiErrors } from "@/lib/form-errors";
import { ecopointFormSchema, type EcopointFormInput, type EcopointFormValues } from "@/lib/validation/ecopoint";

type Feedback = { kind: "success"; message: string } | { kind: "failure"; title: string; message: string };

function toFormValues(ecopoint: Ecopoint): EcopointFormInput {
  const [longitude, latitude] = ecopoint.localizacao?.coordinates ?? [];
  return {
    nome: ecopoint.nome,
    descricao: ecopoint.descricao ?? "",
    endereco: { ...ecopoint.endereco, complemento: ecopoint.endereco.complemento ?? "" },
    latitude: latitude === undefined ? "" : String(latitude),
    longitude: longitude === undefined ? "" : String(longitude),
  };
}

function toPayload(values: EcopointFormValues): UpdateEcopointPayload {
  const { complemento, ...endereco } = values.endereco;
  return {
    nome: values.nome,
    descricao: values.descricao || null,
    endereco: { ...endereco, ...(complemento ? { complemento } : {}) },
    localizacao:
      values.latitude === ""
        ? null
        : { type: "Point", coordinates: [Number(values.longitude), Number(values.latitude)] },
  };
}

// Caminhos da API → campos do formulário (GeoJSON [longitude, latitude]).
function resolveApiField(apiField: string): FieldPath<EcopointFormInput> | undefined {
  if (apiField === "localizacao.coordinates.0") return "longitude";
  if (apiField === "localizacao.coordinates.1" || apiField.startsWith("localizacao")) return "latitude";
  return /^(nome|descricao|endereco)(\.|$)/.test(apiField) ? (apiField as FieldPath<EcopointFormInput>) : undefined;
}

function EcopointForm({ ecopoint, onSaved }: { ecopoint: Ecopoint; onSaved: (feedback: Feedback) => void }) {
  const mutation = useUpdateEcopoint();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<EcopointFormInput, unknown, EcopointFormValues>({
    resolver: zodResolver(ecopointFormSchema),
    mode: "onTouched",
    defaultValues: toFormValues(ecopoint),
  });
  const {
    register,
    reset,
    setError,
    formState: { errors, isDirty },
  } = form;

  function onSubmit(values: EcopointFormValues) {
    setFormError(null);
    mutation.mutate(toPayload(values), {
      onSuccess: (updated) => {
        reset(toFormValues(updated));
        onSaved({ kind: "success", message: "Ecoponto atualizado." });
      },
      onError: (error) => setFormError(applyApiErrors(error, setError, resolveApiField).message),
    });
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        {formError && (
          <Alert variant="destructive" className="border-destructive/30">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <FormField id="nome" label="Nome" required error={errors.nome?.message}>
          <Input {...register("nome")} />
        </FormField>

        <FormField id="descricao" label="Descrição" error={errors.descricao?.message}>
          <Textarea rows={3} {...register("descricao")} />
        </FormField>

        <fieldset className="grid gap-3">
          <legend className="mb-3 font-medium">Endereço</legend>
          <AddressFields name="endereco" />
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="mb-1 font-medium">Localização</legend>
          <p className="text-sm text-muted-foreground">Opcional. Coordenadas em graus decimais, como -23,6812.</p>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="latitude" label="Latitude" error={errors.latitude?.message}>
              <Input inputMode="decimal" {...register("latitude")} />
            </FormField>
            <FormField id="longitude" label="Longitude" error={errors.longitude?.message}>
              <Input inputMode="decimal" {...register("longitude")} />
            </FormField>
          </div>
        </fieldset>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" size="lg" loading={mutation.isPending} disabled={!isDirty} className="w-full sm:w-auto">
            {mutation.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
          {isDirty && !mutation.isPending && (
            <Button type="button" size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => reset()}>
              Descartar alterações
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

// Administração do ecoponto (RF-039, DEC-065, DEC-076): dados, localização e
// status. Horários ficam de fora enquanto OQ-005 estiver aberta.
export function AdminEcopoint() {
  const query = useEcopoint();
  const statusMutation = useUpdateEcopoint();
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  function changeStatus(status: RecordStatus) {
    setFeedback(null);
    statusMutation.mutate(
      { status },
      {
        onSuccess: () =>
          setFeedback({ kind: "success", message: status === "ATIVO" ? "Ecoponto reativado." : "Ecoponto desativado." }),
        onError: (error) =>
          setFeedback({
            kind: "failure",
            title: "Não foi possível alterar o status do ecoponto.",
            message: error instanceof ApiError ? error.message : "Tente novamente.",
          }),
        onSettled: () => setConfirming(false),
      },
    );
  }

  if (query.isPending) return <DetailSkeleton label="Carregando ecoponto..." />;

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      // A criação do ecoponto não faz parte da API (DEC-002): ele vem do seed.
      return (
        <EmptyState
          icon={MapPinOff}
          title="Nenhum ecoponto cadastrado."
          description="O ecoponto central é criado na configuração inicial do sistema."
        />
      );
    }

    return (
      <ErrorState
        title="Não foi possível carregar o ecoponto."
        message="Verifique sua conexão e tente novamente."
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  const ecopoint = query.data;
  const active = ecopoint.status === "ATIVO";

  return (
    <div className="grid gap-5">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Ecoponto</h1>
          <UserStatusBadge status={ecopoint.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Atualizado em <time dateTime={ecopoint.updatedAt}>{formatDateTime(ecopoint.updatedAt)}</time>
        </p>
      </header>

      <div ref={feedbackRef} tabIndex={-1} className="outline-none empty:hidden">
        {feedback?.kind === "success" && (
          <Alert role="status" className="border-success/30 bg-success-surface text-success">
            <CheckCircle2 aria-hidden="true" />
            <AlertTitle>{feedback.message}</AlertTitle>
          </Alert>
        )}
        {feedback?.kind === "failure" && (
          <Alert variant="destructive" className="border-destructive/30">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>{feedback.title}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}
      </div>

      <DetailSection title="Dados do ecoponto">
        <EcopointForm ecopoint={ecopoint} onSaved={setFeedback} />
      </DetailSection>

      <DetailSection title="Horários">
        <p className="text-sm text-muted-foreground">
          Os horários de funcionamento ainda não foram definidos e não podem ser editados por aqui.
        </p>
      </DetailSection>

      <DetailSection title="Funcionamento">
        {active ? (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              O ecoponto está recebendo materiais. Ao desativar, os coletores não conseguem registrar novas entregas.
            </p>
            <Button
              variant="destructive"
              className="w-full sm:w-auto sm:justify-self-start"
              onClick={() => setConfirming(true)}
            >
              Desativar ecoponto
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              O ecoponto está desativado: novas entregas são recusadas até a reativação.
            </p>
            <Button
              className="w-full sm:w-auto sm:justify-self-start"
              loading={statusMutation.isPending}
              onClick={() => changeStatus("ATIVO")}
            >
              {statusMutation.isPending ? "Reativando..." : "Reativar ecoponto"}
            </Button>
          </div>
        )}
      </DetailSection>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Desativar ecoponto?"
        description="Enquanto estiver desativado, os coletores não conseguirão registrar entregas e o ecoponto aparecerá como indisponível."
        confirmLabel="Desativar"
        pendingLabel="Desativando..."
        pending={statusMutation.isPending}
        destructive
        onConfirm={() => changeStatus("INATIVO")}
      />
    </div>
  );
}
