"use client";

import { AlertCircle, CheckCircle2, SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { BackLink, DetailSection, DetailSkeleton } from "@/components/common/detail-parts";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { UserStatusBadge } from "@/components/domain/user-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAdminUser, useUpdateUserStatus } from "@/hooks/use-admin";
import type { AdminUser, RecordStatus } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { NOT_INFORMED, formatDate } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/navigation";
import { TIPO_CADASTRO_LABEL } from "@/lib/user-labels";

const LIST_PATH = "/admin/usuarios";

type Feedback = { kind: "success"; message: string } | { kind: "failure"; title: string; message: string };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={value ? "break-words" : "text-muted-foreground"}>{value || NOT_INFORMED}</dd>
    </div>
  );
}

function UserData({ user }: { user: AdminUser }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      <Field label="E-mail" value={user.email} />
      <Field label="Telefone" value={user.telefone} />
      <Field label="Perfil" value={ROLE_LABEL[user.role]} />
      <Field label="Tipo de cadastro" value={TIPO_CADASTRO_LABEL[user.tipoCadastro]} />
      {user.tipoCadastro === "PJ" && (
        <>
          <Field label="Razão social" value={user.dadosEmpresa?.razaoSocial} />
          <Field label="Nome fantasia" value={user.dadosEmpresa?.nomeFantasia} />
        </>
      )}
      <Field label="Cadastrado em" value={formatDate(user.createdAt)} />
    </dl>
  );
}

// Detalhe do usuário (RF-042) e controle de status (RF-043, DEC-075).
// As regras (administradores, coletor com coletas em andamento) são da API;
// a tela só oculta a ação para contas ADMIN, que a API também recusa.
export function AdminUserDetail({ id }: { id: string }) {
  const query = useAdminUser(id);
  const mutation = useUpdateUserStatus(id);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  function changeStatus(status: RecordStatus) {
    setFeedback(null);
    mutation.mutate(status, {
      onSuccess: ({ message }) => setFeedback({ kind: "success", message }),
      onError: (error) =>
        setFeedback({
          kind: "failure",
          title: status === "INATIVO" ? "Não foi possível desativar o usuário." : "Não foi possível reativar o usuário.",
          message: error instanceof ApiError ? error.message : "Tente novamente.",
        }),
      onSettled: () => setConfirming(false),
    });
  }

  if (query.isPending) return <DetailSkeleton label="Carregando usuário..." />;

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <div className="grid gap-4">
          <BackLink href={LIST_PATH}>Usuários</BackLink>
          <EmptyState
            icon={SearchX}
            title="Usuário não encontrado."
            description="Confira o endereço ou volte para a lista."
            action={
              <Button asChild variant="outline">
                <Link href={LIST_PATH}>Ver usuários</Link>
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        <BackLink href={LIST_PATH}>Usuários</BackLink>
        <ErrorState
          title="Não foi possível carregar o usuário."
          message="Verifique sua conexão e tente novamente."
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      </div>
    );
  }

  const user = query.data;
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="grid gap-5">
      <BackLink href={LIST_PATH}>Usuários</BackLink>

      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight break-words">{user.nome}</h1>
        <UserStatusBadge status={user.status} />
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

      <DetailSection title="Dados do usuário">
        <UserData user={user} />
      </DetailSection>

      <DetailSection title="Acesso">
        {isAdmin ? (
          <p className="text-sm text-muted-foreground">O status de administradores não pode ser alterado.</p>
        ) : user.status === "ATIVO" ? (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              O usuário pode entrar e usar o EcoByte. Ao desativar, o acesso é bloqueado até a reativação.
            </p>
            <Button variant="destructive" className="w-full sm:w-auto sm:justify-self-start" onClick={() => setConfirming(true)}>
              Desativar usuário
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">O usuário está desativado e não consegue entrar no EcoByte.</p>
            <Button
              className="w-full sm:w-auto sm:justify-self-start"
              loading={mutation.isPending}
              onClick={() => changeStatus("ATIVO")}
            >
              {mutation.isPending ? "Reativando..." : "Reativar usuário"}
            </Button>
          </div>
        )}
      </DetailSection>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Desativar usuário?"
        description={`${user.nome} não conseguirá mais entrar no EcoByte até ser reativado. Se estiver usando o sistema agora, será desconectado.`}
        confirmLabel="Desativar"
        pendingLabel="Desativando..."
        pending={mutation.isPending}
        destructive
        onConfirm={() => changeStatus("INATIVO")}
      />
    </div>
  );
}
