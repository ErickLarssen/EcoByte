"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/common/logo";
import { useAuth } from "@/components/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { LOGIN_PATH, ROLE_HOME, ROLE_LABEL } from "@/lib/navigation";

// Layout das áreas autenticadas (11 §74). Nesta fase possui apenas o cabeçalho;
// a navegação de cada perfil (10 §58) entra junto com as páginas das próximas fases.
export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function handleLogout() {
    setLeaving(true);
    try {
      await logout();
    } finally {
      router.replace(LOGIN_PATH);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-muted">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link
            href={user ? ROLE_HOME[user.role] : "/"}
            className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo variant="simbolo" className="h-7" />
            <span className="text-lg font-semibold tracking-tight">EcoByte</span>
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{user.nome}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
              </div>
            )}
            <Button variant="ghost" onClick={handleLogout} loading={leaving}>
              {!leaving && <LogOut aria-hidden="true" data-icon="inline-start" />}
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
