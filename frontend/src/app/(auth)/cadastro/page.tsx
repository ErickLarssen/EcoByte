import type { Metadata } from "next";
import { RegistrationForm } from "@/components/features/auth/registration-form";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { RETURN_PARAM } from "@/lib/navigation";

export const metadata: Metadata = { title: "Criar conta" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// ?tipo=PJ pré-seleciona "Pessoa jurídica" (DEC-079); ?proximo= segue para o login.
export default async function RegistrationPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <AuthLayout title="Criar conta" description="Cadastre-se para solicitar a coleta do seu lixo eletrônico.">
      <RegistrationForm
        initialTipo={single(params.tipo) === "PJ" ? "PJ" : "PF"}
        returnTo={single(params[RETURN_PARAM]) ?? null}
      />
    </AuthLayout>
  );
}
