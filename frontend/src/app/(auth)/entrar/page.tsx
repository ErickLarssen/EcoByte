import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ACCOUNT_DELETED_PARAM, ACCOUNT_DELETED_VALUE, RETURN_PARAM } from "@/lib/navigation";

export const metadata: Metadata = { title: "Entrar" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const value = params[RETURN_PARAM];
  const accountDeleted = params[ACCOUNT_DELETED_PARAM] === ACCOUNT_DELETED_VALUE;

  return (
    <AuthLayout title="Entrar" description="Acesse sua conta EcoByte com e-mail e senha.">
      {accountDeleted && (
        <Alert className="mb-6">
          <CheckCircle2 aria-hidden="true" />
          <AlertDescription>Sua conta foi excluída e seus dados pessoais foram removidos.</AlertDescription>
        </Alert>
      )}
      <LoginForm returnTo={(Array.isArray(value) ? value[0] : value) ?? null} />
    </AuthLayout>
  );
}
