"use client";

import { useAuth } from "@/components/features/auth/auth-provider";
import { Card, CardContent } from "@/components/ui/card";

// Boas-vindas das áreas autenticadas enquanto as funcionalidades de cada
// perfil são implementadas nas próximas fases.
export function DashboardWelcome({ description }: { description: string }) {
  const { user } = useAuth();
  const firstName = user?.nome.split(" ")[0];

  return (
    <section aria-labelledby="boas-vindas" className="grid gap-4">
      <h1 id="boas-vindas" className="text-2xl font-semibold tracking-tight">
        Olá{firstName ? `, ${firstName}` : ""}!
      </h1>
      <Card>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </section>
  );
}
