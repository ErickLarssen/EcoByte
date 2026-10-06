import { ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import recyclingProcessing from "@/assets/images/recycling-processing.webp";
import { BrandBackdrop } from "@/components/common/brand-backdrop";
import { Logo } from "@/components/common/logo";
import { Eyebrow } from "@/components/features/site/site-blocks";
import { CardDescription } from "@/components/ui/card";

type AuthLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const HIGHLIGHTS = [
  "Solicite a coleta em poucos passos",
  "Acompanhe cada etapa até a entrega",
  "Material levado ao ecoponto EcoByte",
];

// Painel da marca, a partir de lg (DEC-085): a mesma linguagem do hero do site
// (DEC-080), com foto em movimento lento, véu escuro e o símbolo como marca
// d'água. No celular, não aparece: o formulário vem primeiro (mobile-first).
function BrandPanel() {
  return (
    <aside className="relative isolate hidden overflow-hidden bg-foreground text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <Image
        src={recyclingProcessing}
        alt=""
        fill
        priority
        sizes="50vw"
        className="-z-20 animate-ken-burns object-cover motion-reduce:animate-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-br from-foreground/95 via-foreground/80 to-primary/60"
      />
      <Image
        src="/brand/ecobyte-mark.png"
        alt=""
        width={491}
        height={242}
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-10 -z-10 w-[34rem] max-w-none opacity-[0.07]"
      />

      <Link
        href="/"
        className="flex items-center gap-2 justify-self-start self-start rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-white/50"
      >
        <Image src="/brand/ecobyte-mark.png" alt="" width={491} height={242} className="h-8 w-auto" />
        <span className="text-xl font-semibold tracking-tight">EcoByte</span>
      </Link>

      <div className="grid max-w-lg gap-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        <Eyebrow className="text-brand-green">Coleta de lixo eletrônico em Diadema-SP</Eyebrow>
        <p className="text-4xl font-semibold tracking-tight text-balance xl:text-5xl">
          Descarte responsável, do seu endereço ao nosso ecoponto.
        </p>
        <ul className="grid gap-3">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-3 text-white/85">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                <Check className="size-3.5 text-brand-green" aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-white/60">Você solicita, a equipe EcoByte recolhe e leva o material ao nosso ecoponto.</p>
    </aside>
  );
}

// Layout de login, cadastro, confirmação de e-mail e troca de senha (11 §75,
// DEC-085). Mobile-first: uma coluna sobre o fundo da marca, conteúdo a partir
// do topo; a partir de lg, o painel da marca à esquerda. "Voltar ao site" e o
// logotipo levam à página inicial (DEC-083).
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-muted lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <BrandPanel />

      <main className="relative isolate flex min-h-dvh flex-col items-center overflow-hidden px-4 py-8 sm:justify-center sm:py-12">
        <BrandBackdrop />

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
          className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:hidden"
        >
          <Logo className="h-14 sm:h-16" priority />
        </Link>

        <div className="relative mt-6 w-full max-w-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
          {/* Borda luminosa: degradê da paleta contornando o cartão. */}
          <div
            aria-hidden="true"
            className="absolute -inset-px rounded-[calc(var(--radius-2xl)+1px)] bg-gradient-to-br from-primary/35 via-border to-brand-green/35"
          />
          <section
            aria-labelledby="auth-titulo"
            className="relative grid gap-5 rounded-2xl bg-card/90 p-5 shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-7"
          >
            <header className="grid gap-1.5">
              <h1 id="auth-titulo" className="text-2xl font-semibold tracking-tight">
                {title}
              </h1>
              {description && <CardDescription>{description}</CardDescription>}
            </header>
            <div>{children}</div>
          </section>
        </div>
      </main>
    </div>
  );
}
