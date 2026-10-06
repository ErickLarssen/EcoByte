import type { Metadata } from "next";
import { EmailVerification } from "@/components/features/auth/email-verification";
import { AuthLayout } from "@/components/layouts/auth-layout";

export const metadata: Metadata = { title: "Confirmar e-mail" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Destino do link enviado por e-mail (DEC-082). Fica fora do grupo (auth):
// a guarda de visitante redirecionaria quem já está logado.
export default async function VerificarEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const value = (await searchParams).token;
  const token = (Array.isArray(value) ? value[0] : value) ?? null;

  return (
    <AuthLayout title="Confirmar e-mail" description="Confirmação do e-mail da sua conta EcoByte.">
      <EmailVerification token={token} />
    </AuthLayout>
  );
}
