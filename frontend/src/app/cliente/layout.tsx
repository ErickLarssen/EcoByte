import type { ReactNode } from "react";
import { EmailVerificationNotice } from "@/components/features/auth/email-verification-notice";
import { RequireAuth } from "@/components/features/auth/require-auth";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Área do perfil CLIENTE (DEC-072). A guarda é experiência de uso; a API valida a role.
// Enquanto o e-mail não for confirmado, um aviso aparece no topo (DEC-082).
export default function ClienteAreaLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth role="CLIENTE">
      <DashboardLayout area="cliente">
        <EmailVerificationNotice />
        {children}
      </DashboardLayout>
    </RequireAuth>
  );
}
