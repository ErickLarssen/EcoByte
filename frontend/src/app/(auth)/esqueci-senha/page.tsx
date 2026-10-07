import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";
import { AuthLayout } from "@/components/layouts/auth-layout";

export const metadata: Metadata = { title: "Recuperar senha" };

// Pedido do link de redefinição (DEC-088). Página de visitante: quem está
// logado troca a senha no perfil (DEC-078).
export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Recuperar senha" description="Informe o e-mail da sua conta para receber um link de redefinição.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
