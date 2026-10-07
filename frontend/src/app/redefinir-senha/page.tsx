import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import { AuthLayout } from "@/components/layouts/auth-layout";

export const metadata: Metadata = { title: "Redefinir senha" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Destino do link de redefinição enviado por e-mail (DEC-088). Fica fora do
// grupo (auth), como /verificar-email: o link pode ser aberto por quem está logado.
export default async function RedefinirSenhaPage({ searchParams }: { searchParams: SearchParams }) {
  const value = (await searchParams).token;
  const token = (Array.isArray(value) ? value[0] : value) ?? null;

  return (
    <AuthLayout title="Redefinir senha" description="Defina uma nova senha para a sua conta EcoByte.">
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
