"use client";

import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ROLE_HOME, withReturnParam } from "@/lib/navigation";
import { REQUEST_COLLECTION_PATH } from "@/lib/site-navigation";

// Ações de "Solicitar coleta" no site público (DEC-079). A solicitação exige
// conta de cliente (RF-014): o visitante entra ou cria conta e volta ao
// formulário; coletor e administrador são levados ao próprio painel.
export function RequestCollectionActions({ size = "lg" }: { size?: "default" | "lg" }) {
  const { status, user } = useAuth();

  if (status === "loading") return null;

  if (user?.role === "CLIENTE") {
    return (
      <Button asChild size={size} className="w-full sm:w-auto">
        <Link href={REQUEST_COLLECTION_PATH}>
          <PlusCircle aria-hidden="true" data-icon="inline-start" />
          Solicitar coleta
        </Link>
      </Button>
    );
  }

  if (user) {
    return (
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">A solicitação de coleta é feita com uma conta de cliente.</p>
        <Button asChild size={size} variant="outline" className="w-full sm:w-auto sm:justify-self-start">
          <Link href={ROLE_HOME[user.role]}>Ir para o meu painel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button asChild size={size} className="w-full sm:w-auto">
        <Link href={withReturnParam("/cadastro", REQUEST_COLLECTION_PATH)}>Criar conta e solicitar</Link>
      </Button>
      <Button asChild size={size} variant="outline" className="w-full sm:w-auto">
        <Link href={withReturnParam("/entrar", REQUEST_COLLECTION_PATH)}>Já tenho conta</Link>
      </Button>
    </div>
  );
}
