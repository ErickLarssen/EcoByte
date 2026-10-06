"use client";

import { MailWarning } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "./auth-provider";

// Reenvio do link de confirmação, com o resultado anunciado (12 §70).
function ResendButton() {
  const { refreshUser } = useAuth();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function resend() {
    setPending(true);
    setFeedback(null);
    try {
      setFeedback(await resendVerificationEmail());
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_VERIFIED") {
        await refreshUser();
        return;
      }
      setFeedback(error instanceof ApiError ? error.message : "Não foi possível reenviar agora. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <Button variant="outline" size="sm" className="justify-self-start" loading={pending} onClick={() => void resend()}>
        {pending ? "Reenviando..." : "Reenviar e-mail"}
      </Button>
      <p role="status" className="text-sm empty:hidden">
        {feedback}
      </p>
    </div>
  );
}

function NoticeAlert({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <Alert className="border-warning/30 bg-warning-surface text-warning">
      <MailWarning aria-hidden="true" />
      <AlertTitle>Confirme seu e-mail</AlertTitle>
      <AlertDescription className="text-warning">
        {children} Enviamos o link para <strong>{user?.email}</strong>.
        <ResendButton />
      </AlertDescription>
    </Alert>
  );
}

// Aviso na área do cliente enquanto o e-mail não for confirmado (DEC-082).
export function EmailVerificationNotice() {
  const { user } = useAuth();
  if (user?.role !== "CLIENTE" || user.emailVerificado) return null;

  return (
    <div className="mb-6">
      <NoticeAlert>Para solicitar coletas, confirme o seu e-mail pelo link que enviamos.</NoticeAlert>
    </div>
  );
}

// Só mostra o conteúdo (o formulário de solicitação) com o e-mail confirmado.
// A API também recusa a solicitação antes disso (403 EMAIL_NOT_VERIFIED).
export function RequireVerifiedEmail({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // O aviso com o reenvio já aparece no topo da área do cliente.
  if (user && !user.emailVerificado) {
    return (
      <p className="surface-card p-5 text-muted-foreground">
        A solicitação de coleta fica disponível depois que você confirmar o seu e-mail. Se não encontrar a mensagem,
        use &quot;Reenviar e-mail&quot; no aviso acima.
      </p>
    );
  }

  return <>{children}</>;
}
