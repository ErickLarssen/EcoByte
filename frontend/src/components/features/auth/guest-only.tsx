"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageLoader } from "@/components/common/page-loader";
import { RETURN_PARAM, postLoginDestination } from "@/lib/navigation";
import { useAuth } from "./auth-provider";

// Páginas de visitante (login e cadastro). Quando há usuário autenticado,
// inclusive logo após o login, envia para a página solicitada ou para a
// área do perfil (DEC-072). Usa useSearchParams: deve estar sob <Suspense>.
export function GuestOnly({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(postLoginDestination(user.role, searchParams.get(RETURN_PARAM)));
    }
  }, [status, user, router, searchParams]);

  if (status === "loading") return <PageLoader label="Verificando sua sessão..." />;
  if (status === "authenticated") return <PageLoader label="Redirecionando..." />;

  return children;
}
