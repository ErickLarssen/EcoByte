"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PageLoader } from "@/components/common/page-loader";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { ROLE_HOME } from "@/lib/navigation";
import { useAuth } from "./auth-provider";

type Result = { kind: "pending" } | { kind: "success" } | { kind: "failure"; message: string; expired: boolean };

// Página do link de confirmação (DEC-082). Funciona logado ou não: o link
// pode ser aberto em outro navegador ou dispositivo.
export function EmailVerification({ token }: { token: string | null }) {
  const { status, user, refreshUser } = useAuth();
  const [result, setResult] = useState<Result>(
    token ? { kind: "pending" } : { kind: "failure", message: "Link de confirmação inválido.", expired: false },
  );
  // Em desenvolvimento o React executa efeitos duas vezes; o token é de uso único.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    verifyEmail(token)
      .then(async () => {
        setResult({ kind: "success" });
        await refreshUser();
      })
      .catch((error: unknown) =>
        setResult({
          kind: "failure",
          message: error instanceof ApiError ? error.message : "Não foi possível confirmar agora. Tente novamente.",
          expired: error instanceof ApiError && error.code === "TOKEN_EXPIRED",
        }),
      );
  }, [token, refreshUser]);

  if (result.kind === "pending") return <PageLoader label="Confirmando seu e-mail..." />;

  const destination = user ? ROLE_HOME[user.role] : "/entrar";
  const destinationLabel = user ? "Ir para o meu painel" : "Entrar";

  return (
    <div role="status" className="grid justify-items-center gap-4 text-center">
      {result.kind === "success" ? (
        <>
          <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
          <div className="grid gap-1">
            <p className="text-lg font-semibold">E-mail confirmado!</p>
            <p className="text-muted-foreground">Agora você já pode solicitar coletas no EcoByte.</p>
          </div>
        </>
      ) : (
        <>
          <XCircle className="size-12 text-error" aria-hidden="true" />
          <div className="grid gap-1">
            <p className="text-lg font-semibold">Não foi possível confirmar o e-mail</p>
            <p className="text-muted-foreground">{result.message}</p>
            {user && !user.emailVerificado && (
              <p className="text-muted-foreground">Peça um novo link no seu painel.</p>
            )}
            {!user && status !== "loading" && result.expired && (
              <p className="text-muted-foreground">Entre na sua conta para pedir um novo link.</p>
            )}
          </div>
        </>
      )}
      {status !== "loading" && (
        <Button asChild>
          <Link href={destination}>{destinationLabel}</Link>
        </Button>
      )}
    </div>
  );
}
