import type { ReactNode } from "react";
import { RequireAuth } from "@/components/features/auth/require-auth";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Área do perfil ADMIN (DEC-072). A guarda é experiência de uso; a API valida a role.
export default function AdminAreaLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth role="ADMIN">
      <DashboardLayout>{children}</DashboardLayout>
    </RequireAuth>
  );
}
