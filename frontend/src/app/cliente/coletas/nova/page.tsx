import type { Metadata } from "next";
import { RequireVerifiedEmail } from "@/components/features/auth/email-verification-notice";
import { CollectionRequestForm } from "@/components/features/collections/collection-request-form";

export const metadata: Metadata = { title: "Solicitar coleta" };

export default function SolicitarColetaPage() {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-5">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Solicitar coleta</h1>
        <p className="text-muted-foreground">Informe onde retirar o material e o que será descartado.</p>
      </div>
      <RequireVerifiedEmail>
        <CollectionRequestForm />
      </RequireVerifiedEmail>
    </div>
  );
}
