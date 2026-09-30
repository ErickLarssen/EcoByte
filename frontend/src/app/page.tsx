import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { EcopointInfo } from "@/components/features/ecopoint/ecopoint-info";
import { Button } from "@/components/ui/button";

// Página pública provisória. A landing page completa (10 §63) é uma fase posterior;
// o texto resume a proposta de 00_PROJECT_OVERVIEW §3.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <Logo className="h-24 sm:h-28" priority />

      <div className="grid max-w-xl gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Descarte seu lixo eletrônico sem sair de casa
        </h1>
        <p className="text-lg text-muted-foreground text-balance">
          Você solicita a coleta, a equipe EcoByte recolhe e leva o material ao nosso ecoponto em Diadema.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="flex-1">
          <Link href="/cadastro">Criar conta</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <Link href="/entrar">Entrar</Link>
        </Button>
      </div>

      {/* Consulta pública do ecoponto (RF-036, DEC-076). */}
      <section aria-labelledby="nosso-ecoponto" className="grid w-full max-w-xl gap-3 text-left">
        <h2 id="nosso-ecoponto" className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Nosso ecoponto
        </h2>
        <EcopointInfo />
      </section>
    </main>
  );
}
