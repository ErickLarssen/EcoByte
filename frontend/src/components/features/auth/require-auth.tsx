"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageLoader } from "@/components/common/page-loader";
import type { UserRole } from "@/lib/api/auth";
import { CHANGE_PASSWORD_PATH, ROLE_HOME, loginRedirectPath } from "@/lib/navigation";
import { useAuth } from "./auth-provider";

// Guarda de rota da interface (11 §128–§129, DEC-072): envia visitantes para o
// login e usuários de outro perfil para a própria área. Não substitui a
// autorização da API.
export function RequireAuth({ role, children }: { role: UserRole; children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Com senha provisória, a área só abre depois da troca (DEC-083).
  const allowed = status === "authenticated" && user.role === role && !user.trocaSenhaObrigatoria;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(loginRedirectPath(pathname));
    } else if (status === "authenticated" && user.trocaSenhaObrigatoria) {
      router.replace(CHANGE_PASSWORD_PATH);
    } else if (status === "authenticated" && user.role !== role) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [status, user, role, router, pathname]);

  if (!allowed) {
    return <PageLoader label={status === "loading" ? "Verificando sua sessão..." : "Redirecionando..."} />;
  }

  return children;
}
