import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";
import { AuthLayout } from "@/components/layouts/auth-layout";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <AuthLayout title="Entrar" description="Acesse sua conta EcoByte com e-mail e senha.">
      <LoginForm />
    </AuthLayout>
  );
}
