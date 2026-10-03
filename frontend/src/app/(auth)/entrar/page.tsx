import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { RETURN_PARAM } from "@/lib/navigation";

export const metadata: Metadata = { title: "Entrar" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const value = (await searchParams)[RETURN_PARAM];

  return (
    <AuthLayout title="Entrar" description="Acesse sua conta EcoByte com e-mail e senha.">
      <LoginForm returnTo={(Array.isArray(value) ? value[0] : value) ?? null} />
    </AuthLayout>
  );
}
