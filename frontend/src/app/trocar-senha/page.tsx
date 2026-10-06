import type { Metadata } from "next";
import { ChangePasswordRequired } from "@/components/features/profile/change-password-required";
import { AuthLayout } from "@/components/layouts/auth-layout";

export const metadata: Metadata = { title: "Trocar senha" };

// Primeiro acesso com senha provisória (DEC-083). Fora do grupo (auth), que
// redirecionaria quem já está logado.
export default function TrocarSenhaPage() {
  return (
    <AuthLayout title="Defina sua senha" description="Primeiro acesso à sua conta EcoByte.">
      <ChangePasswordRequired />
    </AuthLayout>
  );
}
