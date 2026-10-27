"use client";

import { ScrollText } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { useAuditLogs } from "@/hooks/use-admin";
import type { AuditAction, AuditLogEntry } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/navigation";
import { PAGE_PARAM, pageFromParams } from "@/lib/pagination";

const PAGE_SIZE = 20;
const LIST_PATH = "/admin/auditoria";

const ACTION_LABEL: Record<AuditAction, string> = {
  ADMIN_INICIAL_CRIADO: "Administrador inicial criado",
  COLETOR_CADASTRADO: "Coletor cadastrado",
  USUARIO_ATIVADO: "Usuário ativado",
  USUARIO_DESATIVADO: "Usuário desativado",
  ECOPONTO_ATUALIZADO: "Ecoponto atualizado",
  CONTA_EXCLUIDA: "Conta excluída pelo titular",
};

// Quem fez: o nome é resolvido pela API na leitura (DEC-094).
function actorLabel({ ator }: AuditLogEntry): string {
  if (ator.role === "SISTEMA") return "Sistema (inicialização)";
  return `${ator.nome ?? "Usuário removido"} · ${ROLE_LABEL[ator.role]}`;
}

function Target({ entry }: { entry: AuditLogEntry }) {
  const href = entry.alvo.tipo === "ECOPONTO" ? "/admin/ecoponto" : `/admin/usuarios/${entry.alvo.id}`;
  const label = entry.alvo.tipo === "ECOPONTO" ? "Ecoponto" : "Ver usuário";
  return (
    <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline">
      {label}
    </Link>
  );
}

// Detalhes sem dados pessoais: novo status ou nomes dos campos alterados.
function details(entry: AuditLogEntry): string | null {
  const campos = entry.detalhes?.campos;
  if (Array.isArray(campos)) return `Campos: ${campos.join(", ")}`;
  return null;
}

// Registro de auditoria (DEC-094): somente leitura, mais recentes primeiro.
export function AdminAuditLog() {
  const page = pageFromParams(useSearchParams().get(PAGE_PARAM));
  const query = useAuditLogs(page, PAGE_SIZE);

  if (query.isPending) return <CollectionListSkeleton />;

  if (query.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o registro."
        message="Verifique sua conexão e tente novamente."
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  const { items, pagination } = query.data;

  if (items.length === 0) {
    return <EmptyState icon={ScrollText} title="Nenhuma ação registrada ainda." />;
  }

  return (
    <div className="grid gap-4" aria-busy={query.isPlaceholderData || undefined}>
      <ol className="grid gap-3" aria-label="Ações registradas">
        {items.map((entry) => (
          <li key={entry.id} className="grid gap-1 surface-card p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
            <div className="grid gap-1">
              <p className="font-medium">{ACTION_LABEL[entry.acao]}</p>
              <p className="text-sm text-muted-foreground">
                {actorLabel(entry)}
                {details(entry) && <> · {details(entry)}</>}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm sm:justify-end">
              <time dateTime={entry.createdAt} className="text-muted-foreground">
                {formatDateTime(entry.createdAt)}
              </time>
              <Target entry={entry} />
            </div>
          </li>
        ))}
      </ol>
      <Pagination pagination={pagination} hrefForPage={(target) => `${LIST_PATH}?${PAGE_PARAM}=${target}`} />
    </div>
  );
}
