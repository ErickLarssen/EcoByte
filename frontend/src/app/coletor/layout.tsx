import type { ReactNode } from "react";
import { RequireAuth } from "@/components/features/auth/require-auth";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Área do perfil COLETOR (DEC-072). A guarda é experiência de uso; a API valida a role.
export default function ColetorAreaLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth role="COLETOR">
      <DashboardLayout area="coletor">{children}</DashboardLayout>
    </RequireAuth>
  );
}
