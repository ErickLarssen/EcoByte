import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Blocos das páginas institucionais (10 §63): linguagem mais expressiva que a
// área autenticada, com o mesmo sistema visual.

type PageHeroProps = {
  title: string;
  description: string;
  image: StaticImageData;
  // Texto alternativo da foto (16 §31). Vazio quando for decorativa.
  imageAlt: string;
  // Prioriza o carregamento quando o hero for o maior conteúdo da página.
  priority?: boolean;
  children?: ReactNode;
};

// Abertura da página: texto e ações à esquerda; foto ao lado a partir de lg,
// e abaixo do texto no celular (mobile-first).
export function PageHero({ title, description, image, imageAlt, priority = false, children }: PageHeroProps) {
  return (
    <section className="border-b bg-muted">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:py-14 lg:grid-cols-2 lg:gap-12">
        <div className="grid gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
          <p className="text-lg text-muted-foreground text-pretty">{description}</p>
          {children && <div className="mt-2 flex flex-col gap-3 sm:flex-row">{children}</div>}
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority={priority}
            placeholder="blur"
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

type SiteSectionProps = {
  id?: string;
  title: string;
  description?: string;
  muted?: boolean;
  children: ReactNode;
};

// Seção com título de nível 2. O id permite links diretos (ex.: /sobre#missao).
export function SiteSection({ id, title, description, muted = false, children }: SiteSectionProps) {
  const headingId = id ? `${id}-titulo` : undefined;

  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-20", muted && "bg-muted")}>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:py-16">
        <div className="grid max-w-2xl gap-2">
          <h2 id={headingId} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description && <p className="text-muted-foreground text-pretty">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

// Lista de passos numerados (ex.: como funciona a coleta).
export function StepList({ steps }: { steps: Array<{ title: string; description: string }> }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="grid content-start gap-2 rounded-xl border bg-card p-5">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            {index + 1}
          </span>
          <h3 className="font-semibold">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

// Foto ilustrativa dentro de uma seção.
export function SectionImage({ image, alt }: { image: StaticImageData; alt: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
      <Image src={image} alt={alt} fill placeholder="blur" sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
    </div>
  );
}
