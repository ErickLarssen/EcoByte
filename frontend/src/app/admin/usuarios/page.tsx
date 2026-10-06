import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CollectionListSkeleton } from "@/components/common/collection-card-skeleton";
import { AdminUserList } from "@/components/features/admin/admin-user-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Usuários" };

export default function AdminUsuariosPage() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
        {/* Coletores são cadastrados pela administração (DEC-083). */}
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/usuarios/novo">
            <UserPlus aria-hidden="true" data-icon="inline-start" />
            Cadastrar coletor
          </Link>
        </Button>
      </div>
      {/* A lista lê ?pagina da URL (useSearchParams): fica sob Suspense. */}
      <Suspense fallback={<CollectionListSkeleton />}>
        <AdminUserList />
      </Suspense>
    </div>
  );
}
