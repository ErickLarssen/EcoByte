import type { ReactNode } from "react";
import { RequireAuth } from "@/components/features/auth/require-auth";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Área do perfil CLIENTE (DEC-072). A guarda é experiência de uso; a API valida a role.
export default function ClienteAreaLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth role="CLIENTE">
      <DashboardLayout>{children}</DashboardLayout>
    </RequireAuth>
  );
}
