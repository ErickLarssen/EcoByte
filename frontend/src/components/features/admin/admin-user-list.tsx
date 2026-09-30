"use client";

import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Pagination } from "@/components/common/pagination";
import { UserStatusBadge } from "@/components/domain/user-status-badge";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "@/hooks/use-admin";
import type { AdminUser } from "@/lib/api/admin";
import { formatDate } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/navigation";
import { PAGE_PARAM, pageFromParams } from "@/lib/pagination";
import { TIPO_CADASTRO_LABEL } from "@/lib/user-labels";

const PAGE_SIZE = 10;
const LIST_PATH = "/admin/usuarios";

const userHref = (user: AdminUser) => `${LIST_PATH}/${user.id}`;

// Celular: um cartão por usuário, mantendo a ordem e o contexto da tabela (12 §11, §69).
function UserCards({ users }: { users: AdminUser[] }) {
  return (
    <ul className="grid gap-3 md:hidden">
      {users.map((user) => (
        <li key={user.id}>
          <Link
            href={userHref(user)}
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="grid min-w-0 flex-1 gap-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="truncate font-medium">{user.nome}</p>
                <UserStatusBadge status={user.status} />
              </div>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                {ROLE_LABEL[user.role]} · {TIPO_CADASTRO_LABEL[user.tipoCadastro]}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

// A partir de md: tabela com cabeçalhos semânticos (12 §67).
function UserTable({ users }: { users: AdminUser[] }) {
  return (
    <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Usuários cadastrados</caption>
        <thead className="border-b bg-muted/50 text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Nome</th>
            <th scope="col" className="px-4 py-3 font-medium">Perfil</th>
            <th scope="col" className="px-4 py-3 font-medium">Tipo</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Cadastro</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/40">
              <th scope="row" className="max-w-72 px-4 py-3 font-normal">
                <Link
                  href={userHref(user)}
                  className="block truncate font-medium text-primary underline-offset-4 hover:underline"
                >
                  {user.nome}
                </Link>
                <span className="block truncate text-muted-foreground">{user.email}</span>
              </th>
              <td className="px-4 py-3">{ROLE_LABEL[user.role]}</td>
              <td className="px-4 py-3">{TIPO_CADASTRO_LABEL[user.tipoCadastro]}</td>
              <td className="px-4 py-3">
                <UserStatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Usuários (RF-041, 11 §80): lista paginada, mais recentes primeiro.
export function AdminUserList() {
  const searchParams = useSearchParams();
  const page = pageFromParams(searchParams.get(PAGE_PARAM));
  const query = useAdminUsers(page, PAGE_SIZE);

  if (query.isPending) return <CollectionListSkeleton />;

  if (query.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os usuários."
        message="Verifique sua conexão e tente novamente."
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  }

  const { items, pagination } = query.data;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum registro encontrado."
        description={pagination.total > 0 ? `A lista vai até a página ${pagination.totalPages}.` : undefined}
        action={
          pagination.total > 0 ? (
            <Button asChild variant="outline">
              <Link href={LIST_PATH}>Ir para a primeira página</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4" aria-busy={query.isPlaceholderData || undefined}>
      <p className="text-sm text-muted-foreground">
        {pagination.total} {pagination.total === 1 ? "usuário" : "usuários"}
      </p>
      <UserCards users={items} />
      <UserTable users={items} />
      <Pagination pagination={pagination} hrefForPage={(target) => `${LIST_PATH}?${PAGE_PARAM}=${target}`} />
    </div>
  );
}
