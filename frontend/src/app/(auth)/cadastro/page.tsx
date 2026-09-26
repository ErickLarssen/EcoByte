import type { Metadata } from "next";
import { RegistrationForm } from "@/components/features/auth/registration-form";
import { AuthLayout } from "@/components/layouts/auth-layout";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegistrationPage() {
  return (
    <AuthLayout title="Criar conta" description="Cadastre-se para solicitar a coleta do seu lixo eletrônico.">
      <RegistrationForm />
    </AuthLayout>
  );
}
