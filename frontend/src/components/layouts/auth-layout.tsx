import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/logo";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

type AuthLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

// Layout de login, cadastro e confirmação de e-mail (11 §75). Mobile-first:
// uma coluna, conteúdo a partir do topo; centralizado verticalmente a partir de
// telas maiores. "Voltar ao site" e o logotipo levam à página inicial (DEC-083).
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-muted px-4 py-8 sm:justify-center sm:py-12">
      <div className="mb-4 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-1.5 rounded-lg text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar ao site
        </Link>
      </div>

      <Link
        href="/"
        aria-label="EcoByte, página inicial"
        className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Logo className="h-14 sm:h-16" priority />
      </Link>

      <Card className="mt-6 w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
