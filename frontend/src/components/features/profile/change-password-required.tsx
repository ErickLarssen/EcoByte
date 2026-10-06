"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoader } from "@/components/common/page-loader";
import { useAuth } from "@/components/features/auth/auth-provider";
import { LOGIN_PATH, ROLE_HOME } from "@/lib/navigation";
import { PasswordForm } from "./profile-page";

// Troca obrigatória da senha provisória definida pelo administrador (DEC-083).
// Até a troca, a API recusa as demais operações (403 PASSWORD_CHANGE_REQUIRED).
export function ChangePasswordRequired() {
  const { status, user, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(LOGIN_PATH);
    // Sem troca pendente, a página não se aplica: segue para a área do perfil.
    else if (status === "authenticated" && !user.trocaSenhaObrigatoria) router.replace(ROLE_HOME[user.role]);
  }, [status, user, router]);

  if (status !== "authenticated" || !user.trocaSenhaObrigatoria) {
    return <PageLoader label="Verificando sua sessão..." />;
  }

  return (
    <div className="grid gap-5">
      <p className="text-sm text-muted-foreground">
        Sua conta foi criada com uma senha provisória. Para continuar, defina uma senha só sua.
      </p>
      <PasswordForm currentLabel="Senha provisória" onChanged={() => void refreshUser()} />
    </div>
  );
}
